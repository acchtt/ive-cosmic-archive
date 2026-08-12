from __future__ import annotations

import re
from pathlib import Path

OLD_VERSION = 'mobile-card-memory-fix-v62'
NEW_VERSION = 'mobile-card-freeze-fix-v63'
ROOT = Path(__file__).resolve().parents[1]

js_path = ROOT / 'revive-member-sets.js'
js = js_path.read_text(encoding='utf-8')

needle = "  const setLoads = new Map();\n  let activeSetId = readStoredSet();\n"
replacement = "  const setLoads = new Map();\n  const MAX_CONCURRENT_PORTRAITS = window.matchMedia('(max-width: 640px)').matches ? 2 : 4;\n  let activeSetId = readStoredSet();\n"
if needle not in js:
    raise RuntimeError('Could not locate setLoads block')
js = js.replace(needle, replacement, 1)

old_hints = '''    set.portraits.forEach((url) => {\n      if (document.querySelector(`link[rel="preload"][as="image"][href="${url}"]`)) return;\n      const link = document.createElement('link');\n      link.rel = 'preload';\n      link.as = 'image';\n      link.href = url;\n      link.fetchPriority = 'high';\n      fragment.appendChild(link);\n    });\n'''
new_hints = '''    set.portraits.forEach((url, index) => {\n      if (document.querySelector(`link[rel="preload"][as="image"][href="${url}"]`)) return;\n      const link = document.createElement('link');\n      link.rel = 'preload';\n      link.as = 'image';\n      link.href = url;\n      link.fetchPriority = index < 2 ? 'high' : 'auto';\n      fragment.appendChild(link);\n    });\n'''
if old_hints not in js:
    raise RuntimeError('Could not locate active-set preload hint block')
js = js.replace(old_hints, new_hints, 1)

old_preload_set = '''  function preloadSetPortraits(setId, priority = 'high') {\n    if (setLoads.has(setId)) return setLoads.get(setId);\n\n    const load = Promise.all(SETS[setId].portraits.map((url, index) => {\n      const fallback = SETS.bangers.portraits[index];\n      return preloadPortrait(url, fallback, priority);\n    }));\n\n    setLoads.set(setId, load);\n    return load;\n  }\n'''
new_preload_set = '''  function preloadSetPortraits(setId, priority = 'high') {\n    if (setLoads.has(setId)) return setLoads.get(setId);\n\n    const portraits = SETS[setId].portraits;\n    const load = (async () => {\n      const resolved = new Array(portraits.length);\n      let nextIndex = 0;\n\n      const worker = async () => {\n        while (nextIndex < portraits.length) {\n          const index = nextIndex;\n          nextIndex += 1;\n          const url = portraits[index];\n          const fallback = SETS.bangers.portraits[index];\n          const itemPriority = index < 2 ? priority : 'auto';\n          resolved[index] = await preloadPortrait(url, fallback, itemPriority);\n        }\n      };\n\n      const workers = Array.from(\n        { length: Math.min(MAX_CONCURRENT_PORTRAITS, portraits.length) },\n        () => worker()\n      );\n      await Promise.all(workers);\n      return resolved;\n    })();\n\n    setLoads.set(setId, load);\n    return load;\n  }\n'''
if old_preload_set not in js:
    raise RuntimeError('Could not locate preloadSetPortraits block')
js = js.replace(old_preload_set, new_preload_set, 1)
js_path.write_text(js, encoding='utf-8')

# Remove hard-coded BANGERS image preloads. The runtime now preloads only the actual active set.
for html_name in ['index.html', 'members.html']:
    path = ROOT / html_name
    text = path.read_text(encoding='utf-8')
    text, count = re.subn(
        r'^\s*<link rel="preload" as="image" href="assets/revive/member-cards/bangers/[^\n]+\n',
        '',
        text,
        flags=re.MULTILINE,
    )
    print('REMOVE_STATIC_PRELOADS', html_name, count)
    if count < 6:
        raise RuntimeError(f'Expected at least 6 static BANGERS preloads in {html_name}, found {count}')
    path.write_text(text, encoding='utf-8')

# One coherent v63 token everywhere.
for path in list(ROOT.rglob('*.html')) + list(ROOT.rglob('*.js')) + list(ROOT.rglob('*.css')):
    if '.git' in path.parts:
        continue
    text = path.read_text(encoding='utf-8')
    if OLD_VERSION in text:
        path.write_text(text.replace(OLD_VERSION, NEW_VERSION), encoding='utf-8')
        print('VERSION', path.relative_to(ROOT))

members_html = (ROOT / 'members.html').read_text(encoding='utf-8')
index_html = (ROOT / 'index.html').read_text(encoding='utf-8')
loader = (ROOT / 'album-theme-sync.js').read_text(encoding='utf-8')
member_sets = js_path.read_text(encoding='utf-8')

for html_name, html in [('members.html', members_html), ('index.html', index_html)]:
    if f'album-theme-sync.js?v={NEW_VERSION}' not in html:
        raise RuntimeError(f'{html_name} loader mismatch')
    if 'rel="preload" as="image" href="assets/revive/member-cards/bangers/' in html:
        raise RuntimeError(f'{html_name} still has hard-coded BANGERS preloads')
if f"MOBILE_ASSET_VERSION = '{NEW_VERSION}'" not in loader:
    raise RuntimeError('album-theme-sync internal version mismatch')
if f"CARD_ASSET_VERSION = '{NEW_VERSION}'" not in member_sets:
    raise RuntimeError('revive-member-sets card version mismatch')
if "MAX_CONCURRENT_PORTRAITS = window.matchMedia('(max-width: 640px)').matches ? 2 : 4" not in member_sets:
    raise RuntimeError('mobile concurrency guard missing')
if 'preloadAllPortraits' in member_sets or 'portraitImages' in member_sets:
    raise RuntimeError('legacy all-card preload/memory retention returned')

print('DONE', NEW_VERSION)
