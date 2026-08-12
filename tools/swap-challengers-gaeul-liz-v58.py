from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CARD_ROOT = ROOT / 'assets/revive/member-cards'
MANIFEST = CARD_ROOT / 'manifest.json'
OLD_VERSION = 'portrait-matched-cardsets-v57'
NEW_VERSION = 'challengers-gaeul-liz-swap-v58'

SWAPS = {
    'gaeul': {
        'url': 'https://blogger.googleusercontent.com/img/a/AVvXsEjlVzrUmp0F8qBEAQDbYIF08Ti2hgDRA_4My3lzAqaeukqaf8y7LH6f4Z1_h1DT7ojqZOZj7nKicTsN2LF1XZqKwo0hjnZn4hhFis1IzvVFsY7copiyxpQfS8zuV3u9jZ05_BTsX1ojG6ArnaVNkr1SAOYPcoFDeBLp3ePcGlZVqIozP9Z3vjTR2fXcuvq7',
        'ordinal': 2,
        'official_post': 'https://x.com/IVEstarship/status/2018686237352079410',
    },
    'liz': {
        'url': 'https://blogger.googleusercontent.com/img/a/AVvXsEi8xv27SYReAnAL76lVaoxBwitUYnSVXPFg38-hw65oWP450DRnZ8BcatZfM38FTXcybzWvP36KCNjP1ADq6c4RUlDWlgX_CWuE9AgrJrBOYSqih90N49zEYF2HXom0He00o7YqIMCaS2jRT0ppQuFT5BBQFbafX39WzIQPatfBmWeEcG3ZTLnCS448IIhb',
        'ordinal': 4,
        'official_post': 'https://x.com/IVEstarship/status/2018685965313741223',
    },
}

SOURCE_PAGE = 'https://www.pannchoa.com/2026/02/theqoo-ive-2nd-album-revive-challengers_3.html'
TEXT_FILES = [
    'album-theme-sync.js',
    'home-revive.js',
    'index.html',
    'members.html',
    'mobile-members-redesign.js',
    'mobile-theme-picker.js',
    'mobile-version-cardsets.js',
    'revive-member-sets.js',
    'member-profile-details.js',
    'member-profile-details.css',
]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def immutable_hashes() -> dict[str, str]:
    paths = []
    for member in ['yujin', 'rei', 'wonyoung', 'leeseo']:
        paths.append(CARD_ROOT / 'challengers' / f'{member}.jpg')
    for member in ['gaeul', 'yujin', 'rei', 'wonyoung', 'liz', 'leeseo']:
        paths.append(CARD_ROOT / 'loved-ive' / f'{member}.jpg')
    return {str(path.relative_to(ROOT)): sha256_file(path) for path in paths}


before_immutable = immutable_hashes()
manifest = json.loads(MANIFEST.read_text())
assets = manifest['assets']

session = requests.Session()
session.headers['User-Agent'] = 'Mozilla/5.0 IVE-Cosmic-Archive-v58'

for member, spec in SWAPS.items():
    response = session.get(spec['url'], timeout=45)
    response.raise_for_status()
    raw = response.content
    image = Image.open(io.BytesIO(raw))
    image.load()
    if image.width < 900 or image.height < 1100:
        raise RuntimeError(f'{member}: unexpectedly small source {image.size}')
    if image.mode != 'RGB':
        image = image.convert('RGB')
    out = io.BytesIO()
    image.save(out, format='JPEG', quality=94, optimize=True)
    data = out.getvalue()
    target = CARD_ROOT / 'challengers' / f'{member}.jpg'
    target.write_bytes(data)
    digest = sha256_bytes(data)

    record = next(a for a in assets if a.get('set') == 'challengers' and a.get('member') == member)
    record.update({
        'source': spec['url'],
        'resolved_source': spec['url'],
        'bytes': len(data),
        'sha256': digest,
        'source_page': SOURCE_PAGE,
        'official_post': spec['official_post'],
        'concept': 'CHALLENGERS CONCEPT PHOTO 2 · MANUAL ALTERNATE CUT',
        'source_ordinal': spec['ordinal'],
        'selection_method': 'manual alternate requested after v57 portrait-matched set',
        'dimensions': [image.width, image.height],
    })
    record.pop('match_features', None)
    print('SWAP', member, 'cut', spec['ordinal'], image.size, len(data), digest[:16])

MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')

after_immutable = immutable_hashes()
if before_immutable != after_immutable:
    changed = [k for k in before_immutable if before_immutable[k] != after_immutable[k]]
    raise RuntimeError(f'Immutable card files changed unexpectedly: {changed}')
print('IMMUTABLE VERIFIED', len(after_immutable), 'files')

for relative in TEXT_FILES:
    path = ROOT / relative
    if not path.exists():
        continue
    text = path.read_text()
    if OLD_VERSION in text:
        path.write_text(text.replace(OLD_VERSION, NEW_VERSION))
        print('VERSION', relative)

# Guard against stale production token in first-party HTML/JS/CSS sources.
for path in list(ROOT.glob('*.html')) + list(ROOT.glob('*.js')) + list(ROOT.glob('*.css')):
    if path.name.startswith('.'):
        continue
    text = path.read_text(errors='ignore')
    if OLD_VERSION in text:
        raise RuntimeError(f'Stale version remains in {path.name}')

print('DONE', NEW_VERSION)
