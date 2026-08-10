from pathlib import Path

OLD = 'member-youtube-links-v45'
NEW = 'members-launch-freeze-v46'

# Keep every production-facing cache token synchronized.
for name in (
    'album-theme-sync.js',
    'mobile-version-cardsets.js',
    'mobile-members-redesign.js',
    'home-revive.js',
    'index.html',
    'members.html',
):
    path = Path(name)
    text = path.read_text()
    if OLD not in text:
        raise SystemExit(f'Missing {OLD} in {name}')
    path.write_text(text.replace(OLD, NEW))

# The launch guard is only appropriate on Home. Members must always render
# immediately, even if sessionStorage was reset or the picker asset stalls.
path = Path('album-theme-sync.js')
text = path.read_text()
text = text.replace(
    "    if (!MOBILE_QUERY.matches || !PICKER_PAGES.has(page)) return;\n\n    if (mobileLaunchRequired()) {\n      document.documentElement.dataset.themeLaunchPending = 'true';\n    }",
    "    if (!MOBILE_QUERY.matches || page !== 'index') return;\n\n    if (mobileLaunchRequired()) {\n      document.documentElement.dataset.themeLaunchPending = 'true';\n\n      // Never allow a delayed/failed picker asset to strand the page behind\n      // the launch guard. This is a single fail-safe, not a retry loop.\n      window.setTimeout(() => {\n        if (document.documentElement.dataset.themeLaunchPending === 'true'\n            && document.documentElement.dataset.mobileThemePickerReady !== 'true') {\n          delete document.documentElement.dataset.themeLaunchPending;\n        }\n      }, 3500);\n    }"
)
text = text.replace('content: "Preparing your archive theme";', 'content: "Syncing your REVIVE+ version";')
path.write_text(text)

# Members skips automatic picker launch. Manual invocation from the floating
# version control remains supported through a short-lived document flag.
path = Path('mobile-theme-picker.js')
text = path.read_text()
needle = "    syncLocalFallback(readStoredTheme());\n\n    if (!launchRequired()) {"
replacement = "    syncLocalFallback(readStoredTheme());\n\n    const manualOpen = document.documentElement.dataset.mobileThemePickerManual === 'true';\n\n    if (PAGE === 'members' && !manualOpen) {\n      delete document.documentElement.dataset.themeLaunchPending;\n      delete document.documentElement.dataset.mobileThemePickerOpen;\n      delete document.documentElement.dataset.mobileThemePickerReady;\n      return;\n    }\n\n    if (!manualOpen && !launchRequired()) {"
if needle not in text:
    raise SystemExit('Could not locate mobile-theme-picker initialize guard')
text = text.replace(needle, replacement)
text = text.replace(
    "    root = createPicker();\n    bindEvents();",
    "    root = createPicker();\n    delete document.documentElement.dataset.mobileThemePickerManual;\n    bindEvents();"
)
text = text.replace(
    "    delete document.documentElement.dataset.mobileThemePickerReady;",
    "    delete document.documentElement.dataset.mobileThemePickerReady;\n    delete document.documentElement.dataset.mobileThemePickerManual;",
    1,
)
path.write_text(text)

# Tell the picker that a Members invocation came from the explicit version
# button rather than initial page load.
path = Path('mobile-version-button.js')
text = path.read_text()
needle = "  function reopenPicker() {\n    setPopupOpen(false);\n    if (document.querySelector('[data-mobile-theme-picker]')) return;\n\n    try {"
replacement = "  function reopenPicker() {\n    setPopupOpen(false);\n    if (document.querySelector('[data-mobile-theme-picker]')) return;\n\n    document.documentElement.dataset.mobileThemePickerManual = 'true';\n\n    try {"
if needle not in text:
    raise SystemExit('Could not locate mobile-version-button reopenPicker')
text = text.replace(needle, replacement)
text = text.replace(
    "    script.addEventListener('load', () => script.remove(), { once: true });\n    document.head.appendChild(script);",
    "    script.addEventListener('load', () => script.remove(), { once: true });\n    script.addEventListener('error', () => {\n      delete document.documentElement.dataset.mobileThemePickerManual;\n      script.remove();\n    }, { once: true });\n    document.head.appendChild(script);"
)
path.write_text(text)
