from pathlib import Path
import re

OLD = 'member-birthdays-social-row-v47'
NEW = 'member-birthday-identity-v48'

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

# Move Birthday out of metrics and into the identity/name cluster.
members = Path('members.html')
text = members.read_text()
metric = '              <div><dt>Birthday</dt><dd data-profile-birthday>September 24, 2002</dd></div>\n'
if metric not in text:
    raise SystemExit('Birthday metric not found')
text = text.replace(metric, '', 1)
identity_anchor = '              <span lang="ja" data-profile-japanese-name hidden></span>\n'
if identity_anchor not in text:
    raise SystemExit('Identity anchor not found')
text = text.replace(
    identity_anchor,
    identity_anchor + '              <span class="profile-birthday" data-profile-birthday>September 24, 2002</span>\n',
    1,
)
# Cache-bust member-specific assets too.
text = re.sub(r'member-profile-details\.css(?:\?v=[^"\']+)?', f'member-profile-details.css?v={NEW}', text)
text = re.sub(r'member-profile-details\.js(?:\?v=[^"\']+)?', f'member-profile-details.js?v={NEW}', text)
members.write_text(text)

# Revert the v47 forced equal-width social pills.
profile_js = Path('member-profile-details.js')
js = profile_js.read_text()
js = js.replace("      if (socialLinks) socialLinks.dataset.hasYoutube = channel ? 'true' : 'false';\n", '')
profile_js.write_text(js)

profile_css = Path('member-profile-details.css')
css = profile_css.read_text()
marker = '/* v47 social row and birthday */'
if marker not in css:
    raise SystemExit('v47 social CSS marker not found')
css = css.split(marker, 1)[0].rstrip() + r'''


/* v48 birthday in member identity cluster */
.profile-identity .profile-birthday {
  flex: 0 0 100%;
  margin-top: 2px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #9f98aa;
  font-size: .72rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: .035em;
  white-space: nowrap;
}

.profile-identity .profile-birthday::before {
  content: "BIRTHDAY";
  margin: 0;
  color: #746d7d;
  font-size: .54rem;
  font-weight: 800;
  letter-spacing: .14em;
}

@media (max-width: 760px) {
  .profile-identity .profile-birthday {
    margin-top: 1px;
    font-size: .69rem;
  }
}
'''
profile_css.write_text(css)

# Cleanup one-shot finalizer and workflow.
Path('tools/finalize-member-identity-v48.py').unlink(missing_ok=True)
Path('.github/workflows/finalize-member-identity-v48.yml').unlink(missing_ok=True)
