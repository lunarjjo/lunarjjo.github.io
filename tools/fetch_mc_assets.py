#!/usr/bin/env python3
"""
Fetch REAL Minecraft assets for the lunarjjo portfolio site.

Sources:
  A) Monocraft font (OFL license)  -> GitHub Releases API (IdreesInc/Monocraft)
  B) GUI / item / block textures    -> InventivetalentDev/minecraft-assets (client-jar extraction),
                                       probed across version branches with fallbacks
  C) Sounds & music (real .ogg)     -> OFFICIAL Mojang asset servers via version manifest
                                       + asset index (SHA1-verified, so these are authentic)

Everything is magic-byte verified (PNG/OGG/TTF) and SHA1-verified for Mojang objects.
A report with PNG dimensions + average color is printed to help write exact CSS.
"""
import json
import os
import struct
import sys
import urllib.request
import urllib.error
import hashlib
import io

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "mc")
UA = {"User-Agent": "lunarjjo-portfolio/1.0 (asset fetcher)"}
TIMEOUT = 60

report = []   # (dest, source, bytes, info)
failures = []


def http_get(url, timeout=TIMEOUT):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def magic_ok(data, kind):
    if kind == "png":
        return data[:8] == b"\x89PNG\r\n\x1a\n"
    if kind == "ogg":
        return data[:4] == b"OggS"
    if kind == "ttf":
        return data[:4] in (b"\x00\x01\x00\x00", b"OTTO", b"true", b"wOFF")
    return True


def png_dims(data):
    if len(data) > 24 and data[:8] == b"\x89PNG\r\n\x1a\n":
        w, h = struct.unpack(">II", data[16:24])
        return w, h
    return None, None


def png_avg_rgb(data):
    """Average color of the raw IDAT (requires PIL if available)."""
    try:
        from PIL import Image
        im = Image.open(io.BytesIO(data)).convert("RGBA")
        im = im.resize((8, 8))
        px = list(im.getdata())
        n = len(px)
        r = sum(p[0] for p in px) // n
        g = sum(p[1] for p in px) // n
        b = sum(p[2] for p in px) // n
        return (r, g, b)
    except Exception:
        return None


def save(dest, data):
    path = os.path.join(BASE, dest)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)


def record(dest, source, data, kind):
    info = ""
    if kind == "png":
        w, h = png_dims(data)
        avg = png_avg_rgb(data)
        info = f"{w}x{h} avg={avg}"
    elif kind == "ogg":
        info = f"ogg {len(data)//1024}KB"
    elif kind == "ttf":
        info = f"font {len(data)//1024}KB"
    report.append((dest, source, len(data), info))
    save(dest, data)


# ----------------------------------------------------------------------------
# A) Monocraft font
# ----------------------------------------------------------------------------
def fetch_font():
    try:
        meta = json.loads(http_get(
            "https://api.github.com/repos/IdreesInc/Monocraft/releases/latest").decode())
        wanted = {"Monocraft.ttf": "fonts/Monocraft.ttf",
                  "Monocraft-no-ligatures.ttf": "fonts/MonocraftNoLiga.ttf"}
        got = 0
        for asset in meta.get("assets", []):
            name = asset.get("name", "")
            if name in wanted:
                data = http_get(asset["browser_download_url"])
                if magic_ok(data, "ttf"):
                    record(wanted[name], f"IdreesInc/Monocraft {meta.get('tag_name','?')}",
                           data, "ttf")
                    got += 1
        if got == 0:
            failures.append("font: no Monocraft.ttf asset in latest release")
    except Exception as e:
        failures.append(f"font: {e}")


# ----------------------------------------------------------------------------
# B) Textures from minecraft-assets repo (probe branches first)
# ----------------------------------------------------------------------------
GH_RAW = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets"
BRANCH_CANDIDATES = ["1.20.4", "1.20.1", "1.19.4", "1.18.2", "1.16.5", "1.15.2", "1.12.2"]
live_branches = []


def probe_branches():
    for br in BRANCH_CANDIDATES:
        url = f"{GH_RAW}/{br}/assets/minecraft/textures/block/dirt.png"
        try:
            data = http_get(url, timeout=25)
            if magic_ok(data, "png"):
                live_branches.append(br)
        except Exception:
            pass
    # probe mcasset.cloud as extra fallback source
    try:
        url = "https://mcasset.cloud/1.20.4/assets/minecraft/textures/block/dirt.png"
        data = http_get(url, timeout=25)
        if magic_ok(data, "png"):
            live_branches.append("MCASSET:1.20.4")
    except Exception:
        pass


def branch_url(br, rel):
    if br.startswith("MCASSET:"):
        v = br.split(":", 1)[1]
        return f"https://mcasset.cloud/{v}/assets/minecraft/{rel}"
    return f"{GH_RAW}/{br}/assets/minecraft/{rel}"


# dest -> candidate relative paths (against assets/minecraft/)
TEXTURES = [
    # --- widgets / HUD
    ("gui/button.png", ["textures/gui/sprites/widget/button.png"]),
    ("gui/button_disabled.png", ["textures/gui/sprites/widget/button_disabled.png"]),
    ("gui/button_highlighted.png", ["textures/gui/sprites/widget/button_highlighted.png"]),
    ("gui/slider.png", ["textures/gui/sprites/widget/slider.png"]),
    ("gui/slider_handle.png", ["textures/gui/sprites/widget/slider_handle.png"]),
    ("gui/slider_handle_highlighted.png", ["textures/gui/sprites/widget/slider_handle_highlighted.png"]),
    ("gui/hotbar.png", ["textures/gui/sprites/hud/hotbar.png", "textures/gui/hotbar.png"]),
    ("gui/hotbar_selection.png", ["textures/gui/sprites/hud/hotbar_selection.png",
                                  "textures/gui/hotbar_selection.png"]),
    ("gui/xp_bg.png", ["textures/gui/sprites/hud/experience_bar_background.png"]),
    ("gui/xp_fg.png", ["textures/gui/sprites/hud/experience_bar_progress.png"]),
    ("gui/heart_full.png", ["textures/gui/sprites/hud/heart/full.png"]),
    ("gui/heart_half.png", ["textures/gui/sprites/hud/heart/half.png"]),
    ("gui/heart_empty.png", ["textures/gui/sprites/hud/heart/empty.png",
                             "textures/gui/sprites/hud/heart/container.png",
                             "textures/gui/sprites/hud/heart/outline.png"]),
    ("gui/toasts.png", ["textures/gui/sprites/toast/advancement.png", "textures/gui/toasts.png"]),
    ("gui/adv_window.png", ["textures/gui/sprites/advancements/window.png",
                            "textures/gui/advancements/window.png"]),
    ("gui/icons.png", ["textures/gui/icons.png"]),
    # --- items
    ("items/compass.png", ["textures/item/compass.png"]),
    ("items/clock.png", ["textures/item/clock.png"]),
    ("items/book.png", ["textures/item/book.png"]),
    ("items/enchanted_book.png", ["textures/item/enchanted_book.png"]),
    ("items/writable_book.png", ["textures/item/writable_book.png"]),
    ("items/paper.png", ["textures/item/paper.png"]),
    ("items/map.png", ["textures/item/map.png", "textures/item/filled_map.png"]),
    ("items/diamond.png", ["textures/item/diamond.png"]),
    ("items/emerald.png", ["textures/item/emerald.png"]),
    ("items/nether_star.png", ["textures/item/nether_star.png"]),
    ("items/ender_eye.png", ["textures/item/ender_eye.png"]),
    ("items/ender_pearl.png", ["textures/item/ender_pearl.png"]),
    ("items/experience_bottle.png", ["textures/item/experience_bottle.png"]),
    ("items/music_disc_cat.png", ["textures/item/music_disc_cat.png"]),
    ("items/diamond_sword.png", ["textures/item/diamond_sword.png"]),
    ("items/iron_pickaxe.png", ["textures/item/iron_pickaxe.png"]),
    ("items/bow.png", ["textures/item/bow.png"]),
    ("items/spyglass.png", ["textures/item/spyglass.png"]),
    ("items/flint_and_steel.png", ["textures/item/flint_and_steel.png"]),
    ("items/name_tag.png", ["textures/item/name_tag.png"]),
    ("items/recovery_compass.png", ["textures/item/recovery_compass.png"]),
    ("items/player_head.png", ["textures/item/player_head.png"]),
    ("items/creeper_head.png", ["textures/item/creeper_head.png"]),
    ("items/skeleton_skull.png", ["textures/item/skeleton_skull.png"]),
    ("items/golden_apple.png", ["textures/item/golden_apple.png"]),
    ("items/shears.png", ["textures/item/shears.png"]),
    # --- blocks (panorama + world icons + skills)
    ("blocks/grass_block_side.png", ["textures/block/grass_block_side.png"]),
    ("blocks/grass_block_top.png", ["textures/block/grass_block_top.png"]),
    ("blocks/dirt.png", ["textures/block/dirt.png"]),
    ("blocks/stone.png", ["textures/block/stone.png"]),
    ("blocks/cobblestone.png", ["textures/block/cobblestone.png"]),
    ("blocks/oak_log.png", ["textures/block/oak_log.png"]),
    ("blocks/oak_log_top.png", ["textures/block/oak_log_top.png"]),
    ("blocks/oak_planks.png", ["textures/block/oak_planks.png"]),
    ("blocks/oak_leaves.png", ["textures/block/oak_leaves.png"]),
    ("blocks/sand.png", ["textures/block/sand.png"]),
    ("blocks/glass.png", ["textures/block/glass.png"]),
    ("blocks/bedrock.png", ["textures/block/bedrock.png"]),
    ("blocks/command_block.png", ["textures/block/command_block.png",
                                  "textures/block/command_block_front.png",
                                  "textures/block/command_block_side.png"]),
    ("blocks/redstone_block.png", ["textures/block/redstone_block.png"]),
    ("blocks/diamond_ore.png", ["textures/block/diamond_ore.png"]),
    ("blocks/end_stone.png", ["textures/block/end_stone.png"]),
    ("blocks/netherrack.png", ["textures/block/netherrack.png"]),
    ("blocks/obsidian.png", ["textures/block/obsidian.png"]),
    ("blocks/tnt_side.png", ["textures/block/tnt_side.png"]),
    ("blocks/crafting_table_top.png", ["textures/block/crafting_table_top.png"]),
    ("blocks/crafting_table_front.png", ["textures/block/crafting_table_front.png"]),
    ("blocks/furnace_front.png", ["textures/block/furnace_front.png"]),
    ("blocks/water_still.png", ["textures/block/water_still.png"]),
    ("blocks/note_block.png", ["textures/block/note_block.png"]),
    ("blocks/enchanting_table_top.png", ["textures/block/enchanting_table_top.png"]),
    # --- entity skins
    ("entity/steve.png", ["textures/entity/player/wide/steve.png",
                          "textures/entity/steve.png"]),
    ("entity/creeper.png", ["textures/entity/creeper/creeper.png"]),
]


def fetch_textures():
    for dest, cands in TEXTURES:
        ok = False
        for rel in cands:
            for br in live_branches:
                url = branch_url(br, rel)
                try:
                    data = http_get(url, timeout=30)
                    if magic_ok(data, "png"):
                        record(dest, f"{br}/{rel}", data, "png")
                        ok = True
                        break
                except Exception:
                    continue
            if ok:
                break
        if not ok:
            failures.append(f"texture: {dest} (no candidate matched)")


# ----------------------------------------------------------------------------
# C) Sounds & music from OFFICIAL Mojang asset servers (SHA1 verified)
# ----------------------------------------------------------------------------
ASSET_VERSION = "1.20.4"

# dest -> list of exact logical names (first match wins), or ("glob", pattern)
SOUND_SPECS = [
    ("click.ogg", ["minecraft/sounds/random/click.ogg"]),
    ("levelup.ogg", ["minecraft/sounds/random/levelup.ogg"]),
    ("orb.ogg", ["minecraft/sounds/random/orb.ogg"]),
    ("pop.ogg", ["minecraft/sounds/random/pop.ogg"]),
    ("door_open.ogg", ["minecraft/sounds/block/wooden_door/open.ogg"]),
    ("door_close.ogg", ["minecraft/sounds/block/wooden_door/close.ogg"]),
    ("pling.ogg", [("glob", "minecraft/sounds/block/note_block/pling")]),
    ("toast.ogg", [("glob", "minecraft/sounds/ui/toast/challenge"),
                   ("glob", "minecraft/sounds/ui/toast/"),
                   "minecraft/sounds/random/levelup.ogg"]),
    ("bgm_cat.ogg", ["minecraft/sounds/records/cat.ogg"]),
    ("bgm_far.ogg", ["minecraft/sounds/records/far.ogg"]),
    ("bgm_mellohi.ogg", ["minecraft/sounds/records/mellohi.ogg"]),
    ("bgm_menu.ogg", [("glob", "minecraft/sounds/music/menu/menu1"),
                      ("glob", "minecraft/sounds/music/menu/")]),
]


def fetch_sounds():
    try:
        manifest = json.loads(http_get(
            "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json").decode())
        ver = next((v for v in manifest["versions"] if v["id"] == ASSET_VERSION), None)
        if not ver:
            failures.append("sounds: version not in manifest")
            return
        ver_meta = json.loads(http_get(ver["url"]).decode())
        asset_index_url = ver_meta["assetIndex"]["url"]
        index = json.loads(http_get(asset_index_url).decode())
        objects = index["objects"]
    except Exception as e:
        failures.append(f"sounds: meta chain failed: {e}")
        return

    def resolve(spec):
        if isinstance(spec, tuple) and spec[0] == "glob":
            pat = spec[1]
            # prefer exact .ogg, then any ogg
            exact = [k for k in objects if k.startswith(pat) and k.endswith(".ogg")]
            pref = sorted(exact, key=lambda k: (len(k), k))
            return pref[0] if pref else None
        return spec if spec in objects else None

    for dest, specs in SOUND_SPECS:
        key = None
        for spec in specs:
            key = resolve(spec)
            if key:
                break
        if not key:
            failures.append(f"sound: {dest} (no key in asset index)")
            continue
        h = objects[key]["hash"]
        size = objects[key]["size"]
        url = f"https://resources.download.minecraft.net/{h[:2]}/{h}"
        try:
            data = http_get(url, timeout=120)
            if not magic_ok(data, "ogg"):
                failures.append(f"sound: {dest} bad magic from {key}")
                continue
            if hashlib.sha1(data).hexdigest() != h:
                failures.append(f"sound: {dest} SHA1 MISMATCH from {key}")
                continue
            record(dest, f"mojang-assets:{key}", data, "ogg")
        except Exception as e:
            failures.append(f"sound: {dest} {e}")


# ----------------------------------------------------------------------------
def main():
    os.makedirs(BASE, exist_ok=True)
    print("== A) Font (Monocraft) ==")
    fetch_font()
    print("== B) Probing texture branches ==")
    probe_branches()
    print("   live:", live_branches)
    print("== B) Textures ==")
    fetch_textures()
    print("== C) Sounds/Music (official Mojang, SHA1-verified) ==")
    fetch_sounds()

    print("\n================ REPORT ================")
    for dest, src, n, info in report:
        print(f"OK   {dest:42s} {n:>9,}B  {info:28s} [{src}]")
    print(f"\nTotal OK  : {len(report)}")
    print(f"Failures  : {len(failures)}")
    for f in failures:
        print(f"  FAIL {f}")
    # write manifest for the app
    with open(os.path.join(BASE, "manifest.json"), "w") as f:
        json.dump({
            "ok": [{ "dest": d, "source": s, "bytes": n, "info": i } for d, s, n, i in report],
            "failures": failures,
        }, f, indent=2)
    print(f"\nmanifest -> {os.path.join(BASE, 'manifest.json')}")
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())
