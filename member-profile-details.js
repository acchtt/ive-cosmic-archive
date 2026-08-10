(() => {
  if (!document.querySelector('script[src^="revive-member-sets.js"]')) {
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
        <span class="profile-instagram-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <rect x="3.3" y="3.3" width="17.4" height="17.4" rx="5.1"></rect>
            <circle cx="12" cy="12" r="4.05"></circle>
            <circle class="instagram-icon-dot" cx="17.2" cy="6.8" r="1.15"></circle>
          </svg>
        </span>
        <span class="profile-instagram-handle">@${identity.instagram}</span>
        <span class="profile-instagram-arrow" aria-hidden="true">↗</span>`;
      instagramLink.setAttribute('aria-label', `Open ${identity.stage} on Instagram, @${identity.instagram}`);
      instagramLink.setAttribute('title', `@${identity.instagram}`);
    }

    if (youtubeLink) {
      const channel = identity.youtube;
      youtubeLink.hidden = !channel;
      if (channel) {
        youtubeLink.href = channel.href;
        youtubeLink.innerHTML = `
          <span class="profile-youtube-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <rect x="2.8" y="5.4" width="18.4" height="13.2" rx="4.1"></rect>
              <path d="M10 9.1 15.2 12 10 14.9Z"></path>
            </svg>
          </span>
          <span class="profile-youtube-label">${channel.label}</span>
          <span class="profile-youtube-arrow" aria-hidden="true">↗</span>`;
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
