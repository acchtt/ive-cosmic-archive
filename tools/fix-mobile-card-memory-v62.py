from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageOps

OLD_VERSION = 'spoilers-rei-align-v61'
NEW_VERSION = 'mobile-card-memory-fix-v62'
ROOT = Path(__file__).resolve().parents[1]
CARD_ROOT = ROOT / 'assets/revive/member-cards'
MANIFEST = CARD_ROOT / 'manifest.json'
MEMBERS = ['gaeul', 'yujin', 'rei', 'wonyoung', 'liz', 'leeseo']
OPTIMIZE_SETS = ['bangers', 'spoilers']
MAX_HEIGHT = 1600


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
records = {(item['set'], item['member']): item for item in manifest['assets']}

# Preserve the exact chosen photographs while producing web-sized local JPEGs.
for set_id in OPTIMIZE_SETS:
    for member in MEMBERS:
        path = CARD_ROOT / set_id / f'{member}.jpg'
        before_bytes = path.stat().st_size
        with Image.open(path) as raw:
            image = ImageOps.exif_transpose(raw).convert('RGB')
            image.load()

        old_size = image.size
        if image.height > MAX_HEIGHT:
            width = round(image.width * (MAX_HEIGHT / image.height))
            image = image.resize((width, MAX_HEIGHT), Image.Resampling.LANCZOS)
            image.save(
                path,
                'JPEG',
                quality=90,
                optimize=True,
                progressive=True,
                subsampling=0,
            )

        with Image.open(path) as check:
            check = ImageOps.exif_transpose(check)
            check.load()
            new_size = check.size

        record = records[(set_id, member)]
        record['bytes'] = path.stat().st_size
        record['sha256'] = digest(path)
        record['dimensions'] = [new_size[0], new_size[1]]
        record['display_optimization'] = {
            'version': NEW_VERSION,
            'max_height': MAX_HEIGHT,
            'preserves_selected_photo': True,
        }
        print('OPTIMIZE', set_id, member, old_size, '->', new_size, before_bytes, '->', path.stat().st_size, record['sha256'][:16])

MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

js_path = ROOT / 'revive-member-sets.js'
js = js_path.read_text(encoding='utf-8')

# Do not keep decoded image elements alive after preloading.
js = js.replace('  const portraitImages = new Map();\n', '')
js = js.replace('        portraitImages.set(url, image);\n', '')

# Preload only the active six-card set instead of all 24 assets.
old_hints = '''  function injectPreloadHints() {\n    const fragment = document.createDocumentFragment();\n    SET_ORDER.forEach((setId) => {\n      SETS[setId].portraits.forEach((url) => {\n        if (document.querySelector(`link[rel="preload"][as="image"][href="${url}"]`)) return;\n        const link = document.createElement('link');\n        link.rel = 'preload';\n        link.as = 'image';\n        link.href = url;\n        link.fetchPriority = 'high';\n        fragment.appendChild(link);\n      });\n    });\n    document.head.appendChild(fragment);\n  }\n'''
new_hints = '''  function injectPreloadHints(setId = activeSetId) {\n    const set = SETS[setId];\n    if (!set) return;\n    const fragment = document.createDocumentFragment();\n    set.portraits.forEach((url) => {\n      if (document.querySelector(`link[rel="preload"][as="image"][href="${url}"]`)) return;\n      const link = document.createElement('link');\n      link.rel = 'preload';\n      link.as = 'image';\n      link.href = url;\n      link.fetchPriority = 'high';\n      fragment.appendChild(link);\n    });\n    document.head.appendChild(fragment);\n  }\n'''
if old_hints not in js:
    raise RuntimeError('Could not locate preload-hint block')
js = js.replace(old_hints, new_hints)

old_all = '''  function preloadAllPortraits() {\n    const preloadOrder = [\n      activeSetId,\n      ...SET_ORDER.filter((setId) => setId !== activeSetId)\n    ];\n\n    return Promise.all(preloadOrder.map((setId) => preloadSetPortraits(setId, 'high')))\n      .then(() => {\n        document.documentElement.dataset.memberAssetsReady = 'true';\n      });\n  }\n\n'''
if old_all not in js:
    raise RuntimeError('Could not locate preload-all block')
js = js.replace(old_all, '')

old_apply = '''  function applyCurrentSet() {\n    const setId = activeSetId;\n    const version = selectionVersion;\n\n    return preloadSetPortraits(setId, 'high').then((portraits) => {\n      applyResolvedSet(setId, portraits, version);\n    });\n  }\n'''
new_apply = '''  function applyCurrentSet() {\n    const setId = activeSetId;\n    const version = selectionVersion;\n    document.documentElement.dataset.memberAssetsReady = 'loading';\n\n    return preloadSetPortraits(setId, 'high').then((portraits) => {\n      if (version !== selectionVersion || setId !== activeSetId) return;\n      applyResolvedSet(setId, portraits, version);\n      document.documentElement.dataset.memberAssetsReady = 'true';\n    });\n  }\n'''
if old_apply not in js:
    raise RuntimeError('Could not locate applyCurrentSet block')
js = js.replace(old_apply, new_apply)

# Add hints only for the newly selected set; the Image preloader handles the actual swap.
old_set_active = '''    activeSetId = setId;\n    selectionVersion += 1;\n    applyCurrentSet();\n'''
new_set_active = '''    activeSetId = setId;\n    selectionVersion += 1;\n    injectPreloadHints(setId);\n    applyCurrentSet();\n'''
if old_set_active not in js:
    raise RuntimeError('Could not locate setActiveSet load block')
js = js.replace(old_set_active, new_set_active, 1)

# Remove the eager pre-DOM all-set preload; initialize() performs one active-set hint pass.
old_boot = '''  injectPreloadHints();\n  preloadAllPortraits();\n\n'''
if old_boot not in js:
    raise RuntimeError('Could not locate eager preload boot block')
js = js.replace(old_boot, '')

js_path.write_text(js, encoding='utf-8')

# Bump every production-facing reference to one coherent token.
for path in list(ROOT.rglob('*.html')) + list(ROOT.rglob('*.js')) + list(ROOT.rglob('*.css')):
    if '.git' in path.parts:
        continue
    text = path.read_text(encoding='utf-8')
    if OLD_VERSION in text:
        path.write_text(text.replace(OLD_VERSION, NEW_VERSION), encoding='utf-8')
        print('VERSION', path.relative_to(ROOT))

# Mandatory production-token consistency checks.
members_html = (ROOT / 'members.html').read_text(encoding='utf-8')
index_html = (ROOT / 'index.html').read_text(encoding='utf-8')
loader = (ROOT / 'album-theme-sync.js').read_text(encoding='utf-8')
member_sets = js_path.read_text(encoding='utf-8')

for html_name, html in [('members.html', members_html), ('index.html', index_html)]:
    if f'album-theme-sync.js?v={NEW_VERSION}' not in html:
        raise RuntimeError(f'{html_name} top-level loader version mismatch')
if f"MOBILE_ASSET_VERSION = '{NEW_VERSION}'" not in loader:
    raise RuntimeError('album-theme-sync.js internal version mismatch')
if f"CARD_ASSET_VERSION = '{NEW_VERSION}'" not in member_sets:
    raise RuntimeError('revive-member-sets.js card version mismatch')
if 'preloadAllPortraits' in member_sets or 'portraitImages' in member_sets:
    raise RuntimeError('legacy all-card memory retention still present')

print('MEMORY FIX active-set-only preloading; no retained decoded Image map')
print('DONE', NEW_VERSION)
