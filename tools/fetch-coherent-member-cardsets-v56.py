from __future__ import annotations

from io import BytesIO
from pathlib import Path
import hashlib
import json
import re
import urllib.request

from PIL import Image, ImageOps

OLD = 'challengers-concept2-cards-v55'
NEW = 'coherent-member-cardsets-v56'
ROOT = Path('.')
MANIFEST = ROOT / 'assets/revive/member-cards/manifest.json'
MEMBERS = ['gaeul', 'yujin', 'rei', 'wonyoung', 'liz', 'leeseo']

SOURCE_PAGE = {
    'bangers': 'https://www.ptt.cc/bbs/IVE_STARSHIP/M.1771426264.A.F85.html',
    'spoilers': 'https://www.ptt.cc/bbs/IVE_STARSHIP/M.1769526059.A.0FF.html',
}

# One matched ordinal from each member's official concept-photo sequence.
DOWNLOADS = {
    'bangers': {
        'gaeul': ('https://i.imgur.com/4hsGTOs.jpg', 'https://x.com/IVEstarship/status/2024121969587761165'),
        'yujin': ('https://i.imgur.com/KCZkQiX.jpg', 'https://x.com/IVEstarship/status/2024121836557185221'),
        'rei': ('https://i.imgur.com/m1ERSWg.jpg', 'https://x.com/IVEstarship/status/2024121756412236221'),
        'wonyoung': ('https://i.imgur.com/IHBkZIr.jpg', 'https://x.com/IVEstarship/status/2024122160810451353'),
        'liz': ('https://i.imgur.com/vQ9l4no.jpg', 'https://x.com/IVEstarship/status/2024122105168855228'),
        'leeseo': ('https://i.imgur.com/YfLymCh.jpg', 'https://x.com/IVEstarship/status/2024121904383004940'),
    },
    'spoilers': {
        'gaeul': ('https://i.imgur.com/cwa7j4g.jpg', 'https://x.com/IVEstarship/status/2016151017696723199'),
        'yujin': ('https://i.imgur.com/0j0gGiC.jpg', 'https://x.com/IVEstarship/status/2016151111749820512'),
        'rei': ('https://i.imgur.com/JGJe8Z2.jpg', 'https://x.com/IVEstarship/status/2016150820228890959'),
        'wonyoung': ('https://i.imgur.com/PCP9J1j.jpg', 'https://x.com/IVEstarship/status/2016150607573483593'),
        'liz': ('https://i.imgur.com/FkD8Hj5.jpg', 'https://x.com/IVEstarship/status/2016150914076443139'),
        'leeseo': ('https://i.imgur.com/wADkLMC.jpg', 'https://x.com/IVEstarship/status/2016150712049402127'),
    },
}

CONCEPT = {
    'bangers': 'BANGERS CONCEPT PHOTO · MATCHED SECOND CUT',
    'spoilers': 'SPOILERS CONCEPT PHOTO · MATCHED SECOND CUT',
}


def fetch_image(url: str) -> tuple[bytes, str, tuple[int, int]]:
    request = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (IVE Cosmic Archive asset fetch v56)',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        raw = response.read()
        resolved = response.geturl()

    if len(raw) < 50_000:
        raise RuntimeError(f'Image payload suspiciously small for {url}: {len(raw)} bytes')

    with Image.open(BytesIO(raw)) as opened:
        image = ImageOps.exif_transpose(opened).convert('RGB')
        width, height = image.size
        if min(width, height) < 700:
            raise RuntimeError(f'Image resolution too small for {url}: {width}x{height}')
        out = BytesIO()
        image.save(out, format='JPEG', quality=95, subsampling=0, optimize=True)
        data = out.getvalue()

    return data, resolved, (width, height)


def replace_version_tokens() -> None:
    for path in ROOT.rglob('*'):
        if not path.is_file() or path.suffix not in {'.html', '.js', '.css'}:
            continue
        try:
            text = path.read_text()
        except UnicodeDecodeError:
            continue
        if OLD in text:
            path.write_text(text.replace(OLD, NEW))


def version_local_portraits() -> None:
    core = ROOT / 'revive-member-sets.js'
    text = core.read_text()
    text = re.sub(
        r"'assets/revive/member-cards/([^']+?\.jpg)'",
        r'`assets/revive/member-cards/\1?v=${CARD_ASSET_VERSION}`',
        text,
    )
    core.write_text(text)

    picker = ROOT / 'mobile-theme-picker.js'
    text = picker.read_text()
    storage_marker = "  const STORAGE_KEY = 'ive-cosmic-revive-member-set';\n"
    version_line = f"  const CARD_ASSET_VERSION = '{NEW}';\n"
    if 'const CARD_ASSET_VERSION' not in text:
        if storage_marker not in text:
            raise RuntimeError('mobile-theme-picker STORAGE_KEY marker not found')
        text = text.replace(storage_marker, storage_marker + version_line, 1)
    else:
        text = re.sub(
            r"  const CARD_ASSET_VERSION = '[^']+';\n",
            version_line,
            text,
            count=1,
        )

    old_return = "    return `assets/revive/member-cards/${id}/${MEMBER_KEYS[index]}.jpg`;\n"
    new_return = "    return `assets/revive/member-cards/${id}/${MEMBER_KEYS[index]}.jpg?v=${CARD_ASSET_VERSION}`;\n"
    if old_return in text:
        text = text.replace(old_return, new_return, 1)
    elif new_return not in text:
        raise RuntimeError('mobile-theme-picker portraitUrl return not found')
    picker.write_text(text)

    for html_name in ('index.html', 'members.html'):
        html = ROOT / html_name
        text = html.read_text()
        text = re.sub(
            r'href="assets/revive/member-cards/bangers/([^"?]+\.jpg)(?:\?v=[^"]+)?"',
            lambda m: f'href="assets/revive/member-cards/bangers/{m.group(1)}?v={NEW}"',
            text,
        )
        html.write_text(text)


def localize_mobile_cardsets() -> None:
    path = ROOT / 'mobile-version-cardsets.js'
    text = path.read_text()

    old_bangers = """    bangers: {\n      label: 'BANGERS',\n      featureIndex: 3,\n      portraits: [\n        'https://i.imgur.com/4hsGTOs.jpg',\n        'https://i.imgur.com/KCZkQiX.jpg',\n        'https://i.imgur.com/m1ERSWg.jpg',\n        'https://i.imgur.com/IHBkZIr.jpg',\n        'https://i.imgur.com/vQ9l4no.jpg',\n        'https://i.imgur.com/YfLymCh.jpg'\n      ]\n    },\n"""
    new_bangers = """    bangers: {\n      label: 'BANGERS',\n      featureIndex: 3,\n      portraits: MEMBER_KEYS.map((key) => `assets/revive/member-cards/bangers/${key}.jpg?v=${ASSET_VERSION}`)\n    },\n"""
    if old_bangers not in text:
        raise RuntimeError('BANGERS mobile card block not found')
    text = text.replace(old_bangers, new_bangers, 1)

    old_spoilers = """    spoilers: {\n    label: 'SPOILERS',\n    featureIndex: 4,\n    // Verified matching blue press/nameplate sub-series from the six official posts.\n    // Slot map: Gaeul 1, Yujin 3, Rei 3, Wonyoung 1, Liz 3, Leeseo 3.\n    portraits: [\n      'https://pbs.twimg.com/media/G_rOpkKW0AAt_VT?format=jpg&name=orig',\n      'https://pbs.twimg.com/media/G_rOv13bAAMOrul?format=jpg&name=orig',\n      'https://pbs.twimg.com/media/G_rOezqbAAAfAON?format=jpg&name=orig',\n      'https://pbs.twimg.com/media/G_rOSXybAAAljAV?format=jpg&name=orig',\n      'https://pbs.twimg.com/media/G_rOkQMbAAAQ3UB?format=jpg&name=orig',\n      'https://pbs.twimg.com/media/G_rOYdzbAAgBg7K?format=jpg&name=orig'\n    ]\n  },\n"""
    new_spoilers = """    spoilers: {\n      label: 'SPOILERS',\n      featureIndex: 4,\n      portraits: MEMBER_KEYS.map((key) => `assets/revive/member-cards/spoilers/${key}.jpg?v=${ASSET_VERSION}`)\n    },\n"""
    if old_spoilers not in text:
        raise RuntimeError('SPOILERS mobile card block not found')
    text = text.replace(old_spoilers, new_spoilers, 1)

    path.write_text(text)


def update_assets_and_manifest() -> None:
    manifest = json.loads(MANIFEST.read_text())
    entries = {(item['set'], item['member']): item for item in manifest['assets']}

    for set_id, member_sources in DOWNLOADS.items():
        for member in MEMBERS:
            url, official_post = member_sources[member]
            data, resolved, dimensions = fetch_image(url)
            target = ROOT / f'assets/revive/member-cards/{set_id}/{member}.jpg'
            target.write_bytes(data)
            digest = hashlib.sha256(data).hexdigest()

            entry = entries[(set_id, member)]
            entry.clear()
            entry.update({
                'set': set_id,
                'member': member,
                'path': target.as_posix(),
                'source': url,
                'resolved_source': resolved,
                'bytes': len(data),
                'sha256': digest,
                'source_page': SOURCE_PAGE[set_id],
                'official_post': official_post,
                'concept': CONCEPT[set_id],
                'ordinal': 2,
                'dimensions': list(dimensions),
            })
            print(set_id, member, len(data), digest[:12], dimensions)

    graduation_post = 'https://x.com/IVEstarship/status/2026885010159247556'
    for member in MEMBERS:
        entry = entries[('loved-ive', member)]
        target = ROOT / entry['path']
        data = target.read_bytes()
        with Image.open(BytesIO(data)) as image:
            dimensions = list(image.size)
        entry['bytes'] = len(data)
        entry['sha256'] = hashlib.sha256(data).hexdigest()
        entry['source_page'] = graduation_post
        entry['official_post'] = graduation_post
        entry['concept'] = 'IVE HIGH SCHOOL GRADUATION · WE GRADUATED'
        entry['campaign_date'] = '2026-02-26'
        entry['dimensions'] = dimensions

    manifest['count'] = len(manifest['assets'])
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')


def verify() -> None:
    loader = (ROOT / 'album-theme-sync.js').read_text()
    index = (ROOT / 'index.html').read_text()
    members = (ROOT / 'members.html').read_text()
    core = (ROOT / 'revive-member-sets.js').read_text()
    mobile = (ROOT / 'mobile-version-cardsets.js').read_text()
    picker = (ROOT / 'mobile-theme-picker.js').read_text()

    assert f"const MOBILE_ASSET_VERSION = '{NEW}';" in loader
    assert f'album-theme-sync.js?v={NEW}' in index
    assert f'album-theme-sync.js?v={NEW}' in members
    assert f'revive-member-sets.js?v={NEW}' in index
    assert f'revive-member-sets.js?v={NEW}' in members
    assert f"const CARD_ASSET_VERSION = '{NEW}';" in core
    assert f"const ASSET_VERSION = '{NEW}';" in mobile
    assert f"const CARD_ASSET_VERSION = '{NEW}';" in picker
    assert 'https://i.imgur.com/' not in mobile
    assert 'https://pbs.twimg.com/' not in mobile

    for set_id in ('bangers', 'challengers', 'spoilers', 'loved-ive'):
        for member in MEMBERS:
            versioned = f'assets/revive/member-cards/{set_id}/{member}.jpg?v=${{CARD_ASSET_VERSION}}'
            assert versioned in core, f'missing versioned core portrait: {set_id}/{member}'

    for html in (index, members):
        for member in MEMBERS:
            assert f'assets/revive/member-cards/bangers/{member}.jpg?v={NEW}' in html


replace_version_tokens()
version_local_portraits()
localize_mobile_cardsets()
update_assets_and_manifest()
verify()

Path('tools/fetch-coherent-member-cardsets-v56.py').unlink(missing_ok=True)
Path('.github/workflows/fetch-coherent-member-cardsets-v56.yml').unlink(missing_ok=True)
