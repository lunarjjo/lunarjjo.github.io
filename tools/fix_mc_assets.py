#!/usr/bin/env python3
"""Fix-up pass: font via PAT, animated item frames, correct sound keys."""
import json
import os
import struct
import sys
import urllib.request
import urllib.error

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "mc")
UA = {"User-Agent": "lunarjjo-portfolio/1.0"}
TIMEOUT = 60
report, failures = [], []


def http_get(url, headers=None, timeout=TIMEOUT):
    h = dict(UA)
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def magic_ok(data, kind):
    return {
        "png": data[:8] == b"\x89PNG\r\n\x1a\n",
        "ogg": data[:4] == b"OggS",
        "ttf": data[:4] in (b"\x00\x01\x00\x00", b"OTTO", b"true", b"wOFF"),
    }.get(kind, True)


def png_dims(data):
    if len(data) > 24 and data[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", data[16:24])
    return None, None


def save(dest, data):
    path = os.path.join(BASE, dest)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)


def record(dest, source, data, kind):
    info = ""
    if kind == "png":
        w, h = png_dims(data)
        info = f"{w}x{h}"
    report.append((dest, source, len(data), info))
    save(dest, data)


# 1) Monocraft font — direct release URLs, then authenticated API
def fix_font():
    candidates = [
        "https://github.com/IdreesInc/Monocraft/releases/download/v3.0/Monocraft.ttf",
        "https://github.com/IdreesInc/Monocraft/releases/download/v2.9/Monocraft.ttf",
        "https://github.com/IdreesInc/Monocraft/releases/download/v2.8/Monocraft.ttf",
    ]
    for url in candidates:
        try:
            data = http_get(url)
            if magic_ok(data, "ttf"):
                record("fonts/Monocraft.ttf", url.split("/releases/")[1], data, "ttf")
                return
        except Exception:
            continue
    # authenticated API fallback
    try:
        tok = open("/home/z/my-project/.github_token").read().strip()
        hdr = {"Authorization": f"Bearer {tok}", "Accept": "application/vnd.github+json"}
        meta = json.loads(http_get(
            "https://api.github.com/repos/IdreesInc/Monocraft/releases/latest", hdr).decode())
        for a in meta.get("assets", []):
            if a["name"] == "Monocraft.ttf":
                data = http_get(a["browser_download_url"])
                if magic_ok(data, "ttf"):
                    record("fonts/Monocraft.ttf",
                           f"api:{meta.get('tag_name')}", data, "ttf")
                    return
        failures.append("font: asset not found in latest release")
    except Exception as e:
        failures.append(f"font: {e}")


# 2) Animated item frames (compass/clock are split into per-frame files)
def fix_items():
    probes = [
        ("items/compass.png", [f"textures/item/compass_{i}.png" for i in (16, 17, 20, 26)]),
        ("items/clock.png", [f"textures/item/clock_{i:02d}.png" for i in (16, 17, 20)]),
    ]
    raw = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/"
    for dest, rels in probes:
        for rel in rels:
            try:
                data = http_get(raw + rel)
                if magic_ok(data, "png"):
                    record(dest, f"1.20.4/{rel}", data, "png")
                    break
            except Exception:
                continue
        else:
            failures.append(f"item frames: {dest}")


# 2b) Animated BLOCK strips -> crop frame 0 (command_block = 16x64, 4 frame kursor)
#     Tanpa ini, <img> menampilkan seluruh strip = ikon ter-stretch 4x vertikal.
def fix_block_frames():
    from PIL import Image
    rel = "blocks/command_block.png"
    path = os.path.join(BASE, rel)
    if not os.path.exists(path):
        failures.append(f"block frames: {rel} tidak ada")
        return
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    if h == 16:
        return  # sudah di-crop
    if w != 16 or h % 16 != 0:
        failures.append(f"block frames: {rel} aneh {w}x{h}")
        return
    im.crop((0, 0, 16, 16)).save(path, optimize=True)
    report.append((rel, f"crop frame0/{h // 16}", os.path.getsize(path), "16x16"))


# 3) Sounds — inspect the official asset index for correct keys
def fix_sounds():
    manifest = json.loads(http_get(
        "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json").decode())
    ver = next(v for v in manifest["versions"] if v["id"] == "1.20.4")
    ver_meta = json.loads(http_get(ver["url"]).decode())
    index = json.loads(http_get(ver_meta["assetIndex"]["url"]).decode())
    objects = index["objects"]

    # what's actually available?
    for pat in ("wooden_door", "note_block", "music/menu", "records/"):
        keys = sorted(k for k in objects if pat in k)
        print(f"  [index] {pat}: {len(keys)} keys -> {keys[:6]}{'...' if len(keys) > 6 else ''}")

    def grab(dest, key):
        import hashlib
        h = objects[key]["hash"]
        url = f"https://resources.download.minecraft.net/{h[:2]}/{h}"
        data = http_get(url, timeout=120)
        assert magic_ok(data, "ogg"), "bad magic"
        assert hashlib.sha1(data).hexdigest() == h, "sha1 mismatch"
        record(dest, f"mojang:{key}", data, "ogg")

    # door: pick open/close variants
    door_keys = sorted(k for k in objects if "wooden_door" in k)
    opened = [k for k in door_keys if "open" in k and k.endswith(".ogg")]
    closed = [k for k in door_keys if "close" in k and k.endswith(".ogg")]
    try:
        if opened:
            grab("door_open.ogg", opened[0])
        if closed:
            grab("door_close.ogg", closed[0])
    except Exception as e:
        failures.append(f"door: {e}")

    # note block: pling family
    plings = sorted(k for k in objects if "note_block" in k and "pling" in k)
    print(f"  [index] plings: {plings}")
    try:
        if plings:
            grab("pling.ogg", plings[0])
        else:  # fallback: any note_block sound
            nb = sorted(k for k in objects if "note_block" in k and k.endswith(".ogg"))
            if nb:
                grab("pling.ogg", nb[0])
    except Exception as e:
        failures.append(f"pling: {e}")

    # extra SFX: xp pickup variants & 'classic' menu track if a nicer one exists
    for dest, key in [
        ("xp_pickup.ogg", "minecraft/sounds/entity/experience_orb/pickup.ogg"),
        ("levelup2.ogg", "minecraft/sounds/entity/player/levelup.ogg"),
    ]:
        if key in objects:
            try:
                grab(dest, key)
            except Exception as e:
                failures.append(f"{dest}: {e}")


def main():
    print("== font ==")
    fix_font()
    print("== items ==")
    fix_items()
    print("== block frames ==")
    fix_block_frames()
    print("== sounds ==")
    fix_sounds()
    print("\n==== FIXUP REPORT ====")
    for d, s, n, i in report:
        print(f"OK   {d:28s} {n:>9,}B  {i:10s} [{s}]")
    for f in failures:
        print(f"FAIL {f}")
    print(f"ok={len(report)} fail={len(failures)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
