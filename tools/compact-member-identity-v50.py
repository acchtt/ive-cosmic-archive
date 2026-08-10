from pathlib import Path

OLD = 'member-birthday-mobile-fix-v49'
NEW = 'member-identity-compact-v50'

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

profile_css = Path('member-profile-details.css')
css = profile_css.read_text()
marker = '/* v50 compact mobile identity and social rail */'
if marker in css:
    raise SystemExit('v50 mobile identity CSS already exists')

css += r'''


/* v50 compact mobile identity and social rail */
@media (max-width: 640px) {
  html[data-page="members"] .profile-identity {
    margin-bottom: 9px !important;
    row-gap: 4px !important;
    column-gap: 7px !important;
  }

  html[data-page="members"] .profile-identity span.profile-birthday {
    margin-top: 2px !important;
    padding-top: 7px;
    gap: 7px !important;
    border-top: 1px solid color-mix(in srgb, var(--set-accent) 14%, rgba(255,255,255,.05));
    color: color-mix(in srgb, var(--set-muted) 88%, var(--set-paper)) !important;
    font-size: .7rem !important;
    letter-spacing: .015em !important;
  }

  html[data-page="members"] .profile-identity span.profile-birthday::before {
    margin-right: 1px !important;
    color: color-mix(in srgb, var(--set-muted) 66%, transparent) !important;
    font-size: .48rem !important;
    letter-spacing: .12em !important;
  }

  html[data-page="members"] .profile-social-links {
    width: 100%;
    margin: 0 0 14px !important;
    display: flex !important;
    align-items: center !important;
    flex-wrap: nowrap !important;
    gap: 7px !important;
  }

  html[data-page="members"] .profile-social-links .profile-instagram,
  html[data-page="members"] .profile-social-links .profile-youtube {
    width: auto !important;
    min-width: 0 !important;
    min-height: 36px !important;
    margin: 0 !important;
    padding: 4px 8px 4px 4px !important;
    gap: 6px !important;
    border-radius: 12px !important;
    background: color-mix(in srgb, var(--set-panel-strong) 92%, var(--set-accent) 4%) !important;
    box-shadow: none !important;
    font-size: .58rem !important;
    font-weight: 720 !important;
    letter-spacing: .012em !important;
    white-space: nowrap !important;
  }

  html[data-page="members"] .profile-social-links .profile-instagram {
    border-color: color-mix(in srgb, var(--set-accent) 22%, rgba(255,255,255,.08)) !important;
    color: color-mix(in srgb, var(--set-paper) 90%, var(--set-accent)) !important;
  }

  html[data-page="members"] .profile-social-links .profile-youtube {
    border-color: rgba(255, 104, 104, .22) !important;
    color: color-mix(in srgb, var(--set-paper) 94%, #ff8a8a) !important;
  }

  html[data-page="members"] .profile-social-links .profile-instagram-icon,
  html[data-page="members"] .profile-social-links .profile-youtube-icon {
    width: 26px !important;
    height: 26px !important;
    flex: 0 0 26px !important;
    border-radius: 8px !important;
    box-shadow: none !important;
  }

  html[data-page="members"] .profile-social-links .profile-instagram-icon svg,
  html[data-page="members"] .profile-social-links .profile-youtube-icon svg {
    width: 14px !important;
    height: 14px !important;
  }

  html[data-page="members"] .profile-social-links .profile-instagram-handle,
  html[data-page="members"] .profile-social-links .profile-youtube-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  html[data-page="members"] .profile-social-links .profile-instagram-arrow,
  html[data-page="members"] .profile-social-links .profile-youtube-arrow {
    display: none !important;
  }

  html[data-page="members"] .dossier-copy > p:not(.eyebrow) {
    font-size: .9rem !important;
    line-height: 1.47 !important;
  }
}

@media (max-width: 340px) {
  html[data-page="members"] .profile-social-links {
    gap: 5px !important;
  }

  html[data-page="members"] .profile-social-links .profile-instagram,
  html[data-page="members"] .profile-social-links .profile-youtube {
    padding-right: 6px !important;
    gap: 5px !important;
    font-size: .54rem !important;
  }

  html[data-page="members"] .profile-social-links .profile-instagram-icon,
  html[data-page="members"] .profile-social-links .profile-youtube-icon {
    width: 24px !important;
    height: 24px !important;
    flex-basis: 24px !important;
  }
}
'''
profile_css.write_text(css)

Path('tools/compact-member-identity-v50.py').unlink(missing_ok=True)
Path('.github/workflows/compact-member-identity-v50.yml').unlink(missing_ok=True)
