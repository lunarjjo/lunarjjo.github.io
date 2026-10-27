#!/usr/bin/env python3
"""fix_lang_attrs.py — post-processing build (output: export).

Next.js single root layout menghasilkan <html lang="en"> untuk SEMUA
halaman statis; script inline di <head> memperbaikinya saat runtime,
namun HTML mentah (crawler tanpa-JS, preview share) harus benar sejak
awal. Skrip ini menyetel, per file out/<locale>/index.html:

  1. <html lang="xx" dir="ltr|rtl">
  2. <meta property="og:locale" content="xx_XX">  (disisipkan sebelum </head>)

Deterministik, idempoten (aman dijalankan berkali-kali), exit 1 bila
ada file locale yang hilang.
"""

import re
import sys
from pathlib import Path

# code -> (htmlLang, dir, ogLocale)
LOCALES = {
    "id": ("id", "ltr", "id_ID"),
    "es": ("es", "ltr", "es_ES"),
    "fr": ("fr", "ltr", "fr_FR"),
    "de": ("de", "ltr", "de_DE"),
    "pt": ("pt", "ltr", "pt_BR"),
    "it": ("it", "ltr", "it_IT"),
    "ru": ("ru", "ltr", "ru_RU"),
    "ja": ("ja", "ltr", "ja_JP"),
    "zh-CN": ("zh-CN", "ltr", "zh_CN"),
    "ko": ("ko", "ltr", "ko_KR"),
    "hi": ("hi", "ltr", "hi_IN"),
    "ar": ("ar", "rtl", "ar_AR"),
}

OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("out")
ROOT_HTML = OUT / "index.html"

HTML_TAG = re.compile(r"<html[^>]*>")
OG_LOCALE = re.compile(r'<meta property="og:locale" content="[^"]*"/>')

fails = []


def fix_file(path: Path, lang: str, direction: str, og: str) -> None:
    if not path.exists():
        fails.append(f"missing: {path}")
        return
    c = path.read_text(encoding="utf-8")
    m = HTML_TAG.search(c)
    if not m:
        fails.append(f"no <html> tag in {path}")
        return
    tag = m.group(0)
    # susun tag baru dengan lang & dir yang benar (pertahankan atribut lain)
    new_tag = tag
    if 'lang="' in new_tag:
        new_tag = re.sub(r'lang="[^"]*"', f'lang="{lang}"', new_tag)
    else:
        new_tag = new_tag[:-1] + f' lang="{lang}">'
    if 'dir="' in new_tag:
        new_tag = re.sub(r'dir="[^"]*"', f'dir="{direction}"', new_tag)
    else:
        new_tag = new_tag[:-1] + f' dir="{direction}">'
    c = c[: m.start()] + new_tag + c[m.end() :]

    # og:locale — sisipkan bila belum ada (idempoten)
    if OG_LOCALE.search(c):
        c = OG_LOCALE.sub(f'<meta property="og:locale" content="{og}"/>', c, count=1)
    else:
        c = c.replace("</head>", f'<meta property="og:locale" content="{og}"/></head>', 1)

    path.write_text(c, encoding="utf-8")
    print(f"  ok: {path.relative_to(OUT)} -> lang={lang} dir={direction} og={og}")


def main() -> int:
    if not ROOT_HTML.exists():
        print("FAIL: out/index.html tidak ditemukan — jalankan build dulu", file=sys.stderr)
        return 1

    print("fix_lang_attrs:")
    # root = English (sudah benar secara default; pastikan og:locale ada)
    fix_file(ROOT_HTML, "en", "ltr", "en_US")
    for code, (lang, direction, og) in LOCALES.items():
        fix_file(OUT / code / "index.html", lang, direction, og)

    if fails:
        for f in fails:
            print(f"FAIL: {f}", file=sys.stderr)
        return 1
    print(f"  {len(LOCALES) + 1} file OK — lang/dir/og:locale terpasang")
    return 0


if __name__ == "__main__":
    sys.exit(main())
