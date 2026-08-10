from pathlib import Path
import re

OLD = 'members-launch-freeze-v46'
NEW = 'member-birthdays-social-row-v47'

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

# Members should never set the launch guard on initial load.
members = Path('members.html')
text = members.read_text()
launch_script = re.compile(
    r'\n  <script>\n    \(\(\) => \{\n      const editions = new Set\(\[.*?\n    \}\)\(\);\n  </script>',
    re.S,
)
text, count = launch_script.subn('', text, count=1)
if count != 1:
    raise SystemExit('Could not remove Members inline launch guard')

# Cache-bust member-specific profile assets too.
text = re.sub(r'member-profile-details\.css(?:\?v=[^"\']+)?', f'member-profile-details.css?v={NEW}', text)
text = re.sub(r'member-profile-details\.js(?:\?v=[^"\']+)?', f'member-profile-details.js?v={NEW}', text)

birthday_metric = '<div><dt>Birthday</dt><dd data-profile-birthday>September 24, 2002</dd></div>'
if 'data-profile-birthday' not in text:
    needle = '<div><dt>Frequency</dt><dd data-profile-frequency>91.4</dd></div>'
    if needle not in text:
        raise SystemExit('Frequency metric anchor not found')
    text = text.replace(needle, needle + '\n              ' + birthday_metric, 1)
members.write_text(text)

# Add verified Starship birth dates and bind the Birthday metric.
profile_js = Path('member-profile-details.js')
js = profile_js.read_text()
replacements = {
    "korean: '김가을',\n      instagram": "korean: '김가을',\n      birthday: 'September 24, 2002',\n      instagram",
    "{ stage: 'YUJIN', english: 'An Yujin', korean: '안유진', instagram: '_yujin_an' }": "{ stage: 'YUJIN', english: 'An Yujin', korean: '안유진', birthday: 'September 1, 2003', instagram: '_yujin_an' }",
    "korean: '나오이 레이',\n      japanese": "korean: '나오이 레이',\n      birthday: 'February 3, 2004',\n      japanese",
    "{ stage: 'WONYOUNG', english: 'Jang Wonyoung', korean: '장원영', instagram: 'for_everyoung10' }": "{ stage: 'WONYOUNG', english: 'Jang Wonyoung', korean: '장원영', birthday: 'August 31, 2004', instagram: 'for_everyoung10' }",
    "{ stage: 'LIZ', english: 'Kim Jiwon', korean: '김지원', instagram: 'liz.yeyo' }": "{ stage: 'LIZ', english: 'Kim Jiwon', korean: '김지원', birthday: 'November 21, 2004', instagram: 'liz.yeyo' }",
    "{ stage: 'LEESEO', english: 'Lee Hyunseo', korean: '이현서', instagram: 'eeseooes' }": "{ stage: 'LEESEO', english: 'Lee Hyunseo', korean: '이현서', birthday: 'February 21, 2007', instagram: 'eeseooes' }",
}
for old, new in replacements.items():
    if old not in js:
        raise SystemExit(f'Profile identity anchor missing: {old[:40]}')
    js = js.replace(old, new, 1)

selector_anchor = "    const japaneseName = document.querySelector('[data-profile-japanese-name]');"
if "data-profile-birthday" not in js:
    if selector_anchor not in js:
        raise SystemExit('Birthday selector anchor missing')
    js = js.replace(selector_anchor, selector_anchor + "\n    const birthday = document.querySelector('[data-profile-birthday]');", 1)

set_anchor = "    if (koreanName) koreanName.textContent = identity.korean;"
if "birthday.textContent" not in js:
    if set_anchor not in js:
        raise SystemExit('Birthday update anchor missing')
    js = js.replace(set_anchor, set_anchor + "\n    if (birthday) birthday.textContent = identity.birthday;", 1)

channel_anchor = "      const channel = identity.youtube;\n      youtubeLink.hidden = !channel;"
if "dataset.hasYoutube" not in js:
    if channel_anchor not in js:
        raise SystemExit('YouTube state anchor missing')
    js = js.replace(
        channel_anchor,
        "      const channel = identity.youtube;\n      if (socialLinks) socialLinks.dataset.hasYoutube = channel ? 'true' : 'false';\n      youtubeLink.hidden = !channel;",
        1,
    )
profile_js.write_text(js)

# Force Gaeul/Rei social pills into one compact row without changing other profiles.
profile_css = Path('member-profile-details.css')
css = profile_css.read_text()
marker = '/* v47 social row and birthday */'
if marker not in css:
    css += r'''

/* v47 social row and birthday */
.profile-social-links {
  flex-wrap: nowrap;
}

.profile-social-links[data-has-youtube="true"] .profile-instagram,
.profile-social-links[data-has-youtube="true"] .profile-youtube {
  flex: 1 1 0;
  min-width: 0;
  min-height: 40px;
  padding: 5px 8px 5px 5px;
  gap: 6px;
  font-size: .61rem;
  letter-spacing: .02em;
}

.profile-social-links[data-has-youtube="true"] .profile-instagram-icon,
.profile-social-links[data-has-youtube="true"] .profile-youtube-icon {
  width: 28px;
  height: 28px;
  flex-basis: 28px;
}

.profile-social-links[data-has-youtube="true"] .profile-instagram-handle,
.profile-social-links[data-has-youtube="true"] .profile-youtube-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html[data-page="members"] [data-profile-birthday] {
  white-space: nowrap;
}

@media (max-width: 380px) {
  .profile-social-links[data-has-youtube="true"] {
    gap: 6px;
  }

  .profile-social-links[data-has-youtube="true"] .profile-instagram,
  .profile-social-links[data-has-youtube="true"] .profile-youtube {
    padding-right: 6px;
    gap: 5px;
    font-size: .57rem;
  }

  .profile-social-links[data-has-youtube="true"] .profile-instagram-icon,
  .profile-social-links[data-has-youtube="true"] .profile-youtube-icon {
    width: 26px;
    height: 26px;
    flex-basis: 26px;
  }
}
'''
profile_css.write_text(css)

# Cleanup this one-shot finalizer and its workflow before committing.
Path('tools/finalize-member-birthdays-v47.py').unlink(missing_ok=True)
Path('.github/workflows/finalize-member-birthdays-v47.yml').unlink(missing_ok=True)
