(() => {
  const identities = [
    { stage: 'GAEUL', english: 'Kim Gaeul', korean: '김가을', instagram: 'fallingin__fall' },
    { stage: 'YUJIN', english: 'An Yujin', korean: '안유진', instagram: '_yujin_an' },
    { stage: 'REI', english: 'Naoi Rei', korean: '나오이 레이', japanese: '直井怜', instagram: 'reinyourheart' },
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

      let instagram = button.querySelector('.dossier-instagram');
      if (!instagram) {
        instagram = document.createElement('span');
        instagram.className = 'dossier-instagram';
        button.appendChild(instagram);
      }

      fullName.textContent = fullIdentity(identity);
      instagram.textContent = `@${identity.instagram}`;
      button.setAttribute('aria-label', `${identity.stage}, ${fullIdentity(identity)}, Instagram @${identity.instagram}`);
    });
  }

  function ensureInstagramLink(identityGroup) {
    if (!identityGroup) return null;

    let link = document.querySelector('[data-profile-instagram]');
    if (!link) {
      link = document.createElement('a');
      link.className = 'profile-instagram';
      link.dataset.profileInstagram = '';
      link.target = '_blank';
      link.rel = 'noreferrer';
      identityGroup.insertAdjacentElement('afterend', link);
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
    const instagramLink = ensureInstagramLink(identityGroup);

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
      instagramLink.textContent = `Instagram · @${identity.instagram} ↗`;
      instagramLink.setAttribute('aria-label', `Open ${identity.stage} on Instagram, @${identity.instagram}`);
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
