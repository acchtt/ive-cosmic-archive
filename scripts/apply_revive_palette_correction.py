from pathlib import Path
import re

VERSION = "0.20.0"
BUILD = "021"

PALETTES = {
    "bangers": '''html[data-member-set="bangers"] {
  --set-bg: #08070b;
  --set-bg-soft: #18090f;
  --set-panel: rgba(18, 9, 14, .82);
  --set-panel-strong: rgba(25, 9, 15, .95);
  --set-paper: #f4fcfe;
  --set-muted: #c9bdc8;
  --set-ink: #08070b;
  --set-accent: #fd0100;
  --set-accent-2: #79e5fd;
  --set-accent-3: #e5f183;
  --set-line: rgba(253, 1, 0, .24);
  --set-glow-a: rgba(253, 1, 0, .25);
  --set-glow-b: rgba(121, 229, 253, .16);
  --set-board-a: #f4fcfe;
  --set-board-b: #ded8eb;
  --set-board-c: #ca0009;
}''',
    "challengers": '''html[data-member-set="challengers"] {
  --set-bg: #07090a;
  --set-bg-soft: #071710;
  --set-panel: rgba(7, 18, 13, .82);
  --set-panel-strong: rgba(7, 24, 16, .95);
  --set-paper: #ecf7eb;
  --set-muted: #9fbdb1;
  --set-ink: #050806;
  --set-accent: #10e68a;
  --set-accent-2: #c7e3d9;
  --set-accent-3: #5db08f;
  --set-line: rgba(16, 230, 138, .24);
  --set-glow-a: rgba(16, 230, 138, .27);
  --set-glow-b: rgba(199, 227, 217, .12);
  --set-board-a: #ecf7eb;
  --set-board-b: #97c1b5;
  --set-board-c: #175c46;
}''',
    "spoilers": '''html[data-member-set="spoilers"] {
  --set-bg: #090d14;
  --set-bg-soft: #111b28;
  --set-panel: rgba(11, 20, 31, .82);
  --set-panel-strong: rgba(12, 27, 43, .95);
  --set-paper: #e7eef1;
  --set-muted: #a5b5bd;
  --set-ink: #08111d;
  --set-accent: #3071b6;
  --set-accent-2: #9cd0db;
  --set-accent-3: #e7ef19;
  --set-line: rgba(48, 113, 182, .26);
  --set-glow-a: rgba(48, 113, 182, .25);
  --set-glow-b: rgba(156, 208, 219, .16);
  --set-board-a: #e7eef1;
  --set-board-b: #9cd0db;
  --set-board-c: #3071b6;
}''',
    "loved-ive": '''html[data-member-set="loved-ive"] {
  --set-bg: #0b1220;
  --set-bg-soft: #102742;
  --set-panel: rgba(11, 29, 48, .82);
  --set-panel-strong: rgba(10, 38, 64, .95);
  --set-paper: #f3f1ed;
  --set-muted: #a9bdcf;
  --set-ink: #09111c;
  --set-accent: #72aacc;
  --set-accent-2: #a3bdcf;
  --set-accent-3: #ccc3bb;
  --set-line: rgba(114, 170, 204, .26);
  --set-glow-a: rgba(38, 105, 163, .25);
  --set-glow-b: rgba(204, 195, 187, .13);
  --set-board-a: #e9eef1;
  --set-board-b: #a3bdcf;
  --set-board-c: #0a355e;
}''',
}

OPTION_LINES = {
    "bangers": '.member-set-options button[data-member-set="bangers"] { --option-a: #fd0100; --option-b: #79e5fd; }',
    "challengers": '.member-set-options button[data-member-set="challengers"] { --option-a: #10e68a; --option-b: #c7e3d9; }',
    "spoilers": '.member-set-options button[data-member-set="spoilers"] { --option-a: #3071b6; --option-b: #9cd0db; }',
    "loved-ive": '.member-set-options button[data-member-set="loved-ive"] { --option-a: #72aacc; --option-b: #a3bdcf; }',
}

SET_COPY = {
    "bangers": {
        "description": "Color-block fashion energy in signal red, electric cyan, acid lime, and icy white.",
        "theme_color": "#fd0100",
        "tags": ["Signal red", "Electric cyan", "Acid lime", "Color-block"],
    },
    "challengers": {
        "description": "Black-stage portraits cut by laser green light and cold mint styling.",
        "theme_color": "#10e68a",
        "tags": ["Laser green", "Black stage", "Cold mint", "Challenge mode"],
    },
    "spoilers": {
        "description": "Press-room blue, cool gray, powder cyan, and acid-yellow editorial details.",
        "theme_color": "#3071b6",
        "tags": ["Press blue", "Cool gray", "Powder cyan", "Acid yellow"],
    },
    "loved-ive": {
        "description": "School-portrait navy, studio blue, soft gray, and warm uniform neutrals.",
        "theme_color": "#0a355e",
        "tags": ["School portrait", "Deep navy", "Studio blue", "Uniform neutrals"],
    },
}


def replace_once(text: str, pattern: str, replacement: str, label: str, flags: int = 0) -> str:
    updated, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise RuntimeError(f"Expected one {label} replacement, found {count}")
    return updated


css_path = Path("revive-member-sets.css")
css = css_path.read_text(encoding="utf-8")
for set_id, block in PALETTES.items():
    css = replace_once(
        css,
        rf'html\[data-member-set="{re.escape(set_id)}"\]\s*\{{.*?\n\}}',
        block,
        f"{set_id} palette",
        re.S,
    )
for set_id, line in OPTION_LINES.items():
    css = replace_once(
        css,
        rf'\.member-set-options button\[data-member-set="{re.escape(set_id)}"\]\s*\{{[^\n]*\}}',
        line,
        f"{set_id} option swatch",
    )
css_path.write_text(css, encoding="utf-8")

js_path = Path("revive-member-sets.js")
js = js_path.read_text(encoding="utf-8")
js = replace_once(js, r"const ARCHIVE_VERSION = '[^']+';", f"const ARCHIVE_VERSION = '{VERSION}';", "version")
js = replace_once(js, r"const ARCHIVE_BUILD = '[^']+';", f"const ARCHIVE_BUILD = '{BUILD}';", "build")

for set_id, values in SET_COPY.items():
    tags = ", ".join(repr(tag) for tag in values["tags"])
    pattern = (
        rf"({re.escape(set_id)}: \{{\n\s+label: '[^']+',\n)"
        rf"\s+description: '[^']*',\n"
        rf"\s+themeColor: '#[0-9a-fA-F]{{6}}',\n"
        rf"\s+tags: \[[^\n]*\],"
    )
    replacement = (
        rf"\1      description: '{values['description']}',\n"
        rf"      themeColor: '{values['theme_color']}',\n"
        rf"      tags: [{tags}],"
    )
    js = replace_once(js, pattern, replacement, f"{set_id} metadata")

js_path.write_text(js, encoding="utf-8")

for html_path in Path(".").glob("*.html"):
    text = html_path.read_text(encoding="utf-8")
    text = re.sub(r"Archive build\s*·\s*\d+", f"Archive build · {BUILD}", text)
    text = re.sub(r"·\s*v\d+(?:\.\d+){1,2}", f"· v{VERSION}", text)
    html_path.write_text(text, encoding="utf-8")

print("Applied corrected image-derived REVIVE+ palettes")
