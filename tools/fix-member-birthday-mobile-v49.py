from pathlib import Path

OLD = 'member-birthday-identity-v48'
NEW = 'member-birthday-mobile-fix-v49'

version_files = [
    'album-theme-sync.js',
    'mobile-version-cardsets.js',
    'mobile-members-redesign.js',
    'home-revive.js',
    'index.html',
    'members.html',
]

for name in version_files:
    path = Path(name)
    text = path.read_text()
    if OLD not in text:
        raise SystemExit(f'Missing {OLD} in {name}')
    path.write_text(text.replace(OLD, NEW))

# v48 moved birthdays into the identity cluster, but mobile name-separator
# selectors are more specific than the component birthday selector. On phones
# that can turn the BIRTHDAY label back into the generic middle-dot separator
# and override the intended birthday typography. Give the birthday element an
# explicit page + element selector so it wins those mobile rules.
profile_css = Path('member-profile-details.css')
css = profile_css.read_text()
old_selector = '.profile-identity .profile-birthday'
new_selector = 'html[data-page="members"] .profile-identity span.profile-birthday'
if old_selector not in css:
    raise SystemExit('Birthday selector not found in member-profile-details.css')
css = css.replace(old_selector, new_selector)
profile_css.write_text(css)

# Keep the repository clean after the one-shot production finalizer runs.
Path('tools/fix-member-birthday-mobile-v49.py').unlink(missing_ok=True)
Path('.github/workflows/fix-member-birthday-mobile-v49.yml').unlink(missing_ok=True)
