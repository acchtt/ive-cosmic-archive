from pathlib import Path

OLD = 'challengers-member-cards-v53'
NEW = 'challengers-card-owner-sync-v54'

# Keep every current production token aligned in one pass.
for path in Path('.').rglob('*'):
    if not path.is_file() or path.suffix not in {'.html', '.js', '.css'}:
        continue
    try:
        text = path.read_text()
    except UnicodeDecodeError:
        continue
    if OLD in text:
        path.write_text(text.replace(OLD, NEW))

# Members must have one final portrait owner. Home still uses the unified
# mobile card renderer for its campaign/grid surfaces.
sync = Path('album-theme-sync.js')
text = sync.read_text()
old_loader = "    appendScript('mobile-version-cardsets.js', 'data-mobile-version-cardsets-script');\n"
new_loader = "    if (page === 'index') appendScript('mobile-version-cardsets.js', 'data-mobile-version-cardsets-script');\n"
if old_loader not in text:
    raise SystemExit('mobile-version-cardsets loader line not found')
text = text.replace(old_loader, new_loader, 1)
sync.write_text(text)

# Keep the core member-set engine synchronized when the mobile picker changes
# the version. Previously its private activeSetId stayed stale and later
# MutationObserver callbacks repainted the old portraits.
core = Path('revive-member-sets.js')
text = core.read_text()
marker = "  const CARD_ASSET_VERSION = 'challengers-card-owner-sync-v54';\n"
if marker not in text:
    raise SystemExit('CARD_ASSET_VERSION marker not found')
if "const CORE_EVENT_SOURCE" not in text:
    text = text.replace(marker, marker + "  const CORE_EVENT_SOURCE = 'revive-member-sets';\n", 1)

old_dispatch = "      detail: { id: setId, label: SETS[setId].label, themeColor: SETS[setId].themeColor }\n"
new_dispatch = "      detail: { id: setId, label: SETS[setId].label, themeColor: SETS[setId].themeColor, source: CORE_EVENT_SOURCE }\n"
if old_dispatch not in text:
    raise SystemExit('core dispatch detail not found')
text = text.replace(old_dispatch, new_dispatch, 1)

insert_before = "  function observeRenderedCards() {\n"
external_sync = '''  function syncExternalMemberSet(event) {\n    const setId = event.detail?.id;\n    if (!SETS[setId] || event.detail?.source === CORE_EVENT_SOURCE) return;\n\n    storeSet(setId);\n    if (setId !== activeSetId) {\n      activeSetId = setId;\n      selectionVersion += 1;\n    }\n\n    document.documentElement.dataset.memberSet = setId;\n    applyCurrentSet();\n  }\n\n'''
if 'function syncExternalMemberSet' not in text:
    if insert_before not in text:
        raise SystemExit('observeRenderedCards marker not found')
    text = text.replace(insert_before, external_sync + insert_before, 1)

listener_marker = "  injectPreloadHints();\n  preloadAllPortraits();\n"
listener = "  window.addEventListener('revive-member-set-change', syncExternalMemberSet);\n\n"
if listener.strip() not in text:
    if listener_marker not in text:
        raise SystemExit('preload marker not found')
    text = text.replace(listener_marker, listener + listener_marker, 1)
core.write_text(text)

Path('tools/fix-challengers-card-owner-v54.py').unlink(missing_ok=True)
Path('.github/workflows/fix-challengers-card-owner-v54.yml').unlink(missing_ok=True)
