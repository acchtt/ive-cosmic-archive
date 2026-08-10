from pathlib import Path

OLD = 'mobile-spoilers-matched-press-v44'
NEW = 'member-youtube-links-v45'

for name in ('album-theme-sync.js', 'mobile-version-cardsets.js', 'mobile-members-redesign.js', 'home-revive.js', 'index.html', 'members.html'):
    path = Path(name)
    text = path.read_text()
    if OLD not in text:
        raise SystemExit(f'Missing old version token in {name}')
    path.write_text(text.replace(OLD, NEW))

members = Path('members.html')
text = members.read_text()
text = text.replace(
    '<link rel="stylesheet" href="member-profile-details.css" />',
    '<link rel="stylesheet" href="member-profile-details.css?v=member-youtube-links-v45" />'
)
text = text.replace(
    '<script src="member-profile-details.js" defer></script>',
    '<script src="member-profile-details.js?v=member-youtube-links-v45" defer></script>'
)
members.write_text(text)

Path('member-profile-details.js').write_text("""(() => {
  if (!document.querySelector('script[src^=\"revive-member-sets.js\"]')) {
    const memberSetScript = document.createElement('script');
    memberSetScript.src = 'revive-member-sets.js';
    memberSetScript.async = false;
    document.head.appendChild(memberSetScript);
  }

  const identities = [
    {
      stage: 'GAEUL',
      english: 'Kim Gaeul',
      korean: '김가을',
      instagram: 'fallingin__fall',
      youtube: { label: '가을의 온도', href: 'https://www.youtube.com/@gaeul_mood' }
    },
    { stage: 'YUJIN', english: 'An Yujin', korean: '안유진', instagram: '_yujin_an' },
    {
      stage: 'REI',
      english: 'Naoi Rei',
      korean: '나오이 레이',
      japanese: '直井怜',
      instagram: 'reinyourheart',
      youtube: { label: '따라해볼레이', href: 'https://www.youtube.com/@Follow_Rei' }
    },
    { stage: 'WONYOUNG', english: 'Jang Wonyoung', korean: '장원영', instagram: 'for_everyoung10' },
    { stage: 'LIZ', english: 'Kim Jiwon', korean: '김지원', instagram: 'liz.yeyo' },
    { stage: 'LEESEO', english: 'Lee Hyunseo', korean: '이현서', instagram: 'eeseooes' }
  ];

  function fullIdentity(identity) {
    return [identity.english, identity.korean, identity.japanese].filter(Boolean).join(' · ');
  }

  function instagramUrl(handle) {
    return `https://www.instagram.com/${handle}/`;
  }

  function decorateDirectory() {
    document.querySelectorAll('[data-dossier-index]').forEach((button, index) => {
      const identity = identities[index];
      if (!identity) return;

      const stageName = button.querySelector('strong');
      if (stageName) stageName.textContent = identity.stage;

      let fullName = button.querySelector('.dossier-full-name');
      if (!fullName) {
        fullName = document.createElement('em');
        fullName.className = 'dossier-full-name';
        button.appendChild(fullName);
      }

      button.querySelector('.dossier-instagram')?.remove();
      fullName.textContent = fullIdentity(identity);
      button.setAttribute('aria-label', `${identity.stage}, ${fullIdentity(identity)}`);
    });
  }

  function ensureSocialLinks(identityGroup) {
    if (!identityGroup) return null;

    let group = document.querySelector('[data-profile-social-links]');
    if (!group) {
      group = document.createElement('div');
      group.className = 'profile-social-links';
      group.dataset.profileSocialLinks = '';
      identityGroup.insertAdjacentElement('afterend', group);
    }
    return group;
  }

  function ensureInstagramLink(socialLinks) {
    if (!socialLinks) return null;

    let link = socialLinks.querySelector('[data-profile-instagram]');
    if (!link) {
      link = document.createElement('a');
      link.className = 'profile-instagram';
      link.dataset.profileInstagram = '';
      link.target = '_blank';
      link.rel = 'noreferrer';
      socialLinks.appendChild(link);
    }
    return link;
  }

  function ensureYoutubeLink(socialLinks) {
    if (!socialLinks) return null;

    let link = socialLinks.querySelector('[data-profile-youtube]');
    if (!link) {
      link = document.createElement('a');
      link.className = 'profile-youtube';
      link.dataset.profileYoutube = '';
      link.target = '_blank';
      link.rel = 'noreferrer';
      socialLinks.appendChild(link);
    }
    return link;
  }

  function updateActiveIdentity() {
    const panel = document.querySelector('[data-member-profile]');
    if (!panel) return;

    const index = Number(panel.dataset.activeMember || 0);
    const identity = identities[index] || identities[0];
    const stageName = document.querySelector('[data-profile-name]');
    const englishName = document.querySelector('[data-profile-english-name]');
    const koreanName = document.querySelector('[data-profile-korean-name]');
    const japaneseName = document.querySelector('[data-profile-japanese-name]');
    const identityGroup = document.querySelector('.profile-identity');
    const socialLinks = ensureSocialLinks(identityGroup);
    const instagramLink = ensureInstagramLink(socialLinks);
    const youtubeLink = ensureYoutubeLink(socialLinks);

    if (stageName) stageName.textContent = identity.stage;
    if (englishName) englishName.textContent = identity.english;
    if (koreanName) koreanName.textContent = identity.korean;

    if (japaneseName) {
      japaneseName.textContent = identity.japanese || '';
      japaneseName.hidden = !identity.japanese;
    }

    if (identityGroup) {
      identityGroup.setAttribute('aria-label', `Full member name: ${fullIdentity(identity)}`);
    }

    if (instagramLink) {
      instagramLink.href = instagramUrl(identity.instagram);
      instagramLink.innerHTML = `
        <span class=\"profile-instagram-icon\" aria-hidden=\"true\">
          <svg viewBox=\"0 0 24 24\" role=\"img\">
            <rect x=\"3.3\" y=\"3.3\" width=\"17.4\" height=\"17.4\" rx=\"5.1\"></rect>
            <circle cx=\"12\" cy=\"12\" r=\"4.05\"></circle>
            <circle class=\"instagram-icon-dot\" cx=\"17.2\" cy=\"6.8\" r=\"1.15\"></circle>
          </svg>
        </span>
        <span class=\"profile-instagram-handle\">@${identity.instagram}</span>
        <span class=\"profile-instagram-arrow\" aria-hidden=\"true\">↗</span>`;
      instagramLink.setAttribute('aria-label', `Open ${identity.stage} on Instagram, @${identity.instagram}`);
      instagramLink.setAttribute('title', `@${identity.instagram}`);
    }

    if (youtubeLink) {
      const channel = identity.youtube;
      youtubeLink.hidden = !channel;
      if (channel) {
        youtubeLink.href = channel.href;
        youtubeLink.innerHTML = `
          <span class=\"profile-youtube-icon\" aria-hidden=\"true\">
            <svg viewBox=\"0 0 24 24\" role=\"img\">
              <rect x=\"2.8\" y=\"5.4\" width=\"18.4\" height=\"13.2\" rx=\"4.1\"></rect>
              <path d=\"M10 9.1 15.2 12 10 14.9Z\"></path>
            </svg>
          </span>
          <span class=\"profile-youtube-label\">${channel.label}</span>
          <span class=\"profile-youtube-arrow\" aria-hidden=\"true\">↗</span>`;
        youtubeLink.setAttribute('aria-label', `Open ${identity.stage}'s YouTube channel, ${channel.label}`);
        youtubeLink.setAttribute('title', channel.label);
      } else {
        youtubeLink.removeAttribute('href');
        youtubeLink.replaceChildren();
        youtubeLink.removeAttribute('aria-label');
        youtubeLink.removeAttribute('title');
      }
    }
  }

  function initializeIdentityDetails() {
    const panel = document.querySelector('[data-member-profile]');
    if (!panel) return;

    decorateDirectory();
    updateActiveIdentity();

    const observer = new MutationObserver(updateActiveIdentity);
    observer.observe(panel, {
      attributes: true,
      attributeFilter: ['data-active-member']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeIdentityDetails, { once: true });
  } else {
    initializeIdentityDetails();
  }
})();
""")

css = Path('member-profile-details.css')
text = css.read_text()
marker = '/* v45 member social channels */'
if marker not in text:
    text += """

/* v45 member social channels */
.profile-social-links {
  width: 100%;
  margin: 0 0 22px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.profile-social-links .profile-instagram {
  margin: 0;
}

.profile-youtube {
  width: fit-content;
  min-height: 44px;
  margin: 0;
  padding: 5px 12px 5px 6px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  border: 1px solid rgba(255, 122, 122, .28);
  border-radius: 999px;
  background:
    linear-gradient(145deg, rgba(255,255,255,.075), rgba(255,255,255,.018)),
    rgba(13, 8, 21, .7);
  color: #ffe0e0;
  box-shadow:
    0 10px 28px rgba(0,0,0,.24),
    inset 0 0 24px rgba(255,255,255,.025);
  font-size: .69rem;
  font-weight: 700;
  letter-spacing: .035em;
  text-decoration: none;
  transition: transform .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease;
}

.profile-youtube[hidden] { display: none !important; }

.profile-youtube-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  flex: 0 0 32px;
  border: 1px solid rgba(255, 113, 113, .5);
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 25%, rgba(255,255,255,.18), transparent 38%),
    linear-gradient(145deg, rgba(255, 61, 61, .25), rgba(167, 33, 64, .18));
  color: #ff7676;
  box-shadow:
    0 0 18px rgba(255, 72, 72, .16),
    inset 0 0 16px rgba(255,255,255,.035);
}

.profile-youtube-icon svg {
  width: 18px;
  height: 18px;
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
}

.profile-youtube-icon path { fill: currentColor; stroke: none; }
.profile-youtube-label { white-space: nowrap; }

.profile-youtube-arrow {
  color: #a99191;
  font-size: .82rem;
  transition: color .2s ease, transform .2s ease;
}

.profile-youtube:hover,
.profile-youtube:focus-visible {
  color: white;
  border-color: rgba(255, 132, 132, .58);
  box-shadow:
    0 13px 32px rgba(0,0,0,.3),
    0 0 24px rgba(255, 76, 76, .12),
    inset 0 0 24px rgba(255,255,255,.04);
  transform: translateY(-2px);
}

.profile-youtube:hover .profile-youtube-arrow,
.profile-youtube:focus-visible .profile-youtube-arrow {
  color: #ffe6e6;
  transform: translate(2px, -2px);
}

@media (max-width: 760px) {
  .profile-social-links {
    margin-bottom: 18px;
    gap: 8px;
  }
}
"""
css.write_text(text)

for temp in (
    '.github/workflows/finalize-member-youtube-v45.yml',
    '.github/workflows/finalize-member-youtube-v45-fixed.yml',
    '.github/scripts/finalize-member-youtube-v45.py',
):
    Path(temp).unlink(missing_ok=True)
