#!/usr/bin/env python3
"""
verify_assets.py — gerbang integritas FINAL sebelum build statis.

Memastikan pipeline fetch+fix menghasilkan SEMUA aset yang dipakai situs
(persis 83 file yang situs di-QA-kan), dengan:
  - magic byte benar (PNG / OGG / TTF)
  - dimensi eksak untuk tekstur yang pernah jadi perangkap QA
    (command_block harus 16x16 hasil crop frame — bukan strip 16x64)
  - semua ikon items/*.png harus persegi (guard ter-stretch)

Exit 1 jika ADA yang kurang/salah — workflow gagal jujur, bukan deploy
situs dengan tekstur hilang.
"""
import os
import struct
import sys

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "mc")

REQUIRED = [
    # --- suara & musik (root)
    "bell.ogg", "bgm_beginning.ogg", "bgm_cat.ogg", "bgm_far.ogg",
    "bgm_floating.ogg", "bgm_mellohi.ogg", "bgm_menu.ogg", "bgm_moog.ogg",
    "click.ogg", "door_close.ogg", "door_open.ogg", "harp.ogg",
    "levelup.ogg", "orb.ogg", "pling.ogg", "pop.ogg", "toast.ogg",
    # --- font
    "fonts/Monocraft.ttf",
    # --- GUI
    "gui/adv_window.png", "gui/button.png", "gui/button_disabled.png",
    "gui/button_highlighted.png", "gui/heart_empty.png", "gui/heart_full.png",
    "gui/heart_half.png", "gui/hotbar.png", "gui/hotbar_selection.png",
    "gui/icons.png", "gui/slider.png", "gui/slider_handle.png",
    "gui/slider_handle_highlighted.png", "gui/toasts.png",
    "gui/xp_bg.png", "gui/xp_fg.png",
    # --- items
    "items/book.png", "items/bow.png", "items/clock.png", "items/compass.png",
    "items/diamond.png", "items/diamond_sword.png", "items/emerald.png",
    "items/enchanted_book.png", "items/ender_eye.png", "items/ender_pearl.png",
    "items/experience_bottle.png", "items/flint_and_steel.png",
    "items/golden_apple.png", "items/iron_pickaxe.png", "items/map.png",
    "items/music_disc_cat.png", "items/name_tag.png", "items/nether_star.png",
    "items/paper.png", "items/shears.png", "items/spyglass.png",
    "items/writable_book.png",
    # --- blocks
    "blocks/bedrock.png", "blocks/cobblestone.png", "blocks/command_block.png",
    "blocks/crafting_table_front.png", "blocks/crafting_table_top.png",
    "blocks/diamond_ore.png", "blocks/dirt.png",
    "blocks/enchanting_table_top.png", "blocks/end_stone.png",
    "blocks/furnace_front.png", "blocks/glass.png", "blocks/grass_block_side.png",
    "blocks/grass_block_top.png", "blocks/netherrack.png", "blocks/note_block.png",
    "blocks/oak_leaves.png", "blocks/oak_log.png", "blocks/oak_log_top.png",
    "blocks/oak_planks.png", "blocks/obsidian.png", "blocks/redstone_block.png",
    "blocks/sand.png", "blocks/stone.png", "blocks/tnt_side.png",
    "blocks/water_still.png",
    # --- entity
    "entity/creeper.png", "entity/steve.png",
]

# Dimensi EKSAK (nilai terverifikasi dari aset yang situs QA-kan)
MUST_DIMS = {
    "blocks/command_block.png": (16, 16),   # strip 16x64 = belum di-crop = bug
    "items/compass.png": (16, 16),
    "items/clock.png": (16, 16),
    "gui/button.png": (200, 20),
    "gui/button_disabled.png": (200, 20),
    "gui/button_highlighted.png": (200, 20),
    "gui/slider.png": (200, 20),
    "gui/hotbar.png": (182, 22),
    "gui/heart_full.png": (9, 9),
    "gui/heart_half.png": (9, 9),
    "gui/heart_empty.png": (9, 9),
    "gui/xp_bg.png": (182, 5),
    "gui/xp_fg.png": (182, 5),
    "gui/toasts.png": (160, 32),
}


def png_dims(path):
    with open(path, "rb") as f:
        head = f.read(24)
    if len(head) < 24 or head[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", head[16:24])


def main():
    missing, bad = [], []

    for rel in REQUIRED:
        path = os.path.join(BASE, rel)
        if not os.path.isfile(path):
            missing.append(rel)
            continue
        with open(path, "rb") as f:
            head = f.read(8)
        if rel.endswith(".png") and head[:8] != b"\x89PNG\r\n\x1a\n":
            bad.append((rel, "bukan PNG"))
        elif rel.endswith(".ogg") and head[:4] != b"OggS":
            bad.append((rel, "bukan OGG"))
        elif rel.endswith(".ttf") and head[:4] not in (b"\x00\x01\x00\x00", b"OTTO", b"true", b"wOFF"):
            bad.append((rel, "bukan TTF"))

    # dimensi eksak
    for rel, want in MUST_DIMS.items():
        path = os.path.join(BASE, rel)
        if os.path.isfile(path):
            got = png_dims(path)
            if got != want:
                bad.append((rel, f"dimensi {got}, harus {want}"))

    # semua ikon item harus persegi (guard ter-stretch)
    items_dir = os.path.join(BASE, "items")
    if os.path.isdir(items_dir):
        for fn in sorted(os.listdir(items_dir)):
            if not fn.endswith(".png"):
                continue
            got = png_dims(os.path.join(items_dir, fn))
            if got and got[0] != got[1]:
                bad.append((f"items/{fn}", f"tidak persegi {got}"))

    print(f"aset wajib : {len(REQUIRED)}")
    print(f"hilang      : {len(missing)}")
    print(f"rusak/salah: {len(bad)}")
    for rel in missing:
        print(f"  MISSING {rel}")
    for rel, why in bad:
        print(f"  BAD     {rel} — {why}")

    if missing or bad:
        print("\nVERIFY GAGAL — situs akan punya aset hilang/cacat, deploy ditolak.")
        return 1
    print("\nVERIFY LOLOS — semua aset lengkap & valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
