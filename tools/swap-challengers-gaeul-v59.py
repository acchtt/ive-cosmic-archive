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
OLD_VERSION = 'challengers-gaeul-liz-swap-v58'
NEW_VERSION = 'challengers-gaeul-align-v59'
GAEUL_URL = 'https://blogger.googleusercontent.com/img/a/AVvXsEhKYjyniPHdtoKym0gRP0TnVbyirLMF_Ui9XPlBKVsyCN86B2g1oqC4YdotKwt7V2D21KpBsstIQPn1P1_j7h3NgsOGDrcHze1SQzL9V6r8ur-pbQubkjqUWu4hz5I-EyCpofWawRXUohn8n-4KXxUg1szv_kcTgpLuJ59rOIytrV-hGQxsem5sBBXjmOR3'


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


cards = sorted(CARD_ROOT.glob('*/*.jpg'))
before = {str(p.relative_to(ROOT)): sha(p) for p in cards}

target = CARD_ROOT / 'challengers/gaeul.jpg'
old_gaeul = before[str(target.relative_to(ROOT))]

r = requests.get(GAEUL_URL, timeout=45)
r.raise_for_status()
img = Image.open(io.BytesIO(r.content)).convert('RGB')
if img.width < 1000 or img.height < 1200:
    raise RuntimeError(f'Unexpected Gaeul image dimensions: {img.size}')
img.save(target, 'JPEG', quality=95, optimize=True)
new_gaeul = sha(target)
if new_gaeul == old_gaeul:
    raise RuntimeError('Gaeul cut did not change')

manifest = json.loads(MANIFEST.read_text())
for item in manifest['assets']:
    if item.get('set') == 'challengers' and item.get('member') == 'gaeul':
        item.update({
            'source': GAEUL_URL,
            'resolved_source': GAEUL_URL,
            'bytes': target.stat().st_size,
            'sha256': new_gaeul,
            'source_page': 'https://www.pannchoa.com/2026/02/theqoo-ive-2nd-album-revive-challengers_3.html',
            'official_post': 'https://x.com/IVEstarship/status/2018686237352079410',
            'concept': 'CHALLENGERS CONCEPT PHOTO 2 · ALIGNED CUT',
            'source_ordinal': 4,
            'selection_method': 'manual alignment to the retained CHALLENGERS cut-4 portrait framing',
            'dimensions': [img.width, img.height],
        })
        item.pop('match_features', None)
        break
else:
    raise RuntimeError('Gaeul manifest entry not found')
MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')

# Production token bump across top-level HTML/JS/CSS assets that currently carry v58.
for pattern in ('*.html', '*.js', '*.css'):
    for path in ROOT.glob(pattern):
        if path.name == Path(__file__).name:
            continue
        text = path.read_text()
        if OLD_VERSION in text:
            path.write_text(text.replace(OLD_VERSION, NEW_VERSION))
            print('VERSION', path.name)

# Verify every card except Gaeul is byte-for-byte unchanged.
after = {str(p.relative_to(ROOT)): sha(p) for p in cards}
changed = [p for p in before if before[p] != after[p]]
expected = ['assets/revive/member-cards/challengers/gaeul.jpg']
if changed != expected:
    raise RuntimeError(f'Unexpected card changes: {changed}')

print('GAEUL cut 4', img.size, target.stat().st_size, new_gaeul)
print('IMMUTABLE VERIFIED', len(cards) - 1, 'other card files')
print('DONE', NEW_VERSION)
