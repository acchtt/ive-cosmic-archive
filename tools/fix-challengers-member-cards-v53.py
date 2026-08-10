from pathlib import Path
import re

OLD = 'member-signature-result-v52'
NEW = 'challengers-member-cards-v53'

# Keep every mobile/cache loader on one token so production cannot mix v52 and v53 assets.
version_files = [
    'album-theme-sync.js',
    'mobile-version-cardsets.js',
    'mobile-members-redesign.js',
    'home-revive.js',
    'index.html',
    'members.html',
    'member-profile-details.js',
    'member-profile-details.css',
]
for name in version_files:
    path = Path(name)
    text = path.read_text()
    if OLD in text:
        path.write_text(text.replace(OLD, NEW))

# CHALLENGERS: stop using a separate external Imgur source on mobile.
# Use the corrected local six-card set with the same v53 cache token as the rest of the mobile runtime.
cardsets = Path('mobile-version-cardsets.js')
text = cardsets.read_text()
old_block = """    challengers: {\n      label: 'CHALLENGERS',\n      featureIndex: 1,\n      portraits: [\n        'https://i.imgur.com/U9c80gv.jpg',\n        'https://i.imgur.com/ZVnaaYc.jpg',\n        'https://i.imgur.com/V5MRKib.jpg',\n        'https://i.imgur.com/fk5Pt1u.jpg',\n        'https://i.imgur.com/j6WvOG4.jpg',\n        'https://i.imgur.com/6o4i2dg.jpg'\n      ]\n    },"""
new_block = """    challengers: {\n      label: 'CHALLENGERS',\n      featureIndex: 1,\n      portraits: MEMBER_KEYS.map((key) => `assets/revive/member-cards/challengers/${key}.jpg?v=${ASSET_VERSION}`)\n    },"""
if old_block not in text:
    raise SystemExit('Could not find current CHALLENGERS mobile portrait block')
text = text.replace(old_block, new_block, 1)

# Keep the dossier art synchronized even when the active member changes without a click.
needle = """  window.addEventListener('revive-member-set-change', scheduleSync);\n  document.addEventListener('click', (event) => {\n    if (PAGE === 'members' && event.target.closest('[data-dossier-index]')) scheduleSync();\n  });\n\n"""
insert = needle + """  if (PAGE === 'members') {\n    const panel = document.querySelector('[data-member-profile]');\n    if (panel) {\n      new MutationObserver(scheduleSync).observe(panel, {\n        attributes: true,\n        attributeFilter: ['data-active-member']\n      });\n    }\n  }\n\n"""
if needle not in text:
    raise SystemExit('Could not find mobile cardset sync listeners')
text = text.replace(needle, insert, 1)

marker = "    document.documentElement.dataset.versionCards = ASSET_VERSION;\n"
replacement = marker + "    if (set === 'challengers') document.documentElement.dataset.challengersCards = ASSET_VERSION;\n"
if marker not in text:
    raise SystemExit('Could not find versionCards marker')
text = text.replace(marker, replacement, 1)
cardsets.write_text(text)

# Version the local CHALLENGERS paths used by the core card system too.
sets = Path('revive-member-sets.js')
text = sets.read_text()
const_needle = "  const STORAGE_KEY = 'ive-cosmic-revive-member-set';\n"
if "CARD_ASSET_VERSION" not in text:
    if const_needle not in text:
        raise SystemExit('Could not find revive-member-sets storage constant')
    text = text.replace(const_needle, const_needle + f"  const CARD_ASSET_VERSION = '{NEW}';\n", 1)

for key in ['gaeul', 'yujin', 'rei', 'wonyoung', 'liz', 'leeseo']:
    plain = f"        'assets/revive/member-cards/challengers/{key}.jpg'"
    versioned = f"        `assets/revive/member-cards/challengers/{key}.jpg?v=${{CARD_ASSET_VERSION}}`"
    if plain not in text and versioned not in text:
        raise SystemExit(f'Could not find CHALLENGERS local path for {key}')
    text = text.replace(plain, versioned, 1)
sets.write_text(text)

# Cache-bust the core set controller itself on both pages.
for name in ['index.html', 'members.html']:
    path = Path(name)
    text = path.read_text()
    text, count = re.subn(
        r'src="revive-member-sets\.js(?:\?v=[^"]+)?"',
        f'src="revive-member-sets.js?v={NEW}"',
        text,
        count=1,
    )
    if count != 1:
        raise SystemExit(f'Could not cache-bust revive-member-sets.js in {name}')
    path.write_text(text)

Path('tools/fix-challengers-member-cards-v53.py').unlink(missing_ok=True)
Path('.github/workflows/fix-challengers-member-cards-v53.yml').unlink(missing_ok=True)
