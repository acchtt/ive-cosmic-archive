(() => {
  const identities = [
    { stage: 'GAEUL', english: 'Kim Gaeul', korean: '김가을' },
    { stage: 'YUJIN', english: 'An Yujin', korean: '안유진' },
    { stage: 'REI', english: 'Naoi Rei', korean: '나오이 레이', japanese: '直井怜' },
    { stage: 'WONYOUNG', english: 'Jang Wonyoung', korean: '장원영' },
    { stage: 'LIZ', english: 'Kim Jiwon', korean: '김지원' },
    { stage: 'LEESEO', english: 'Lee Hyunseo', korean: '이현서' }
  ];

  function fullIdentity(identity) {
    return [identity.english, identity.korean, identity.japanese].filter(Boolean).join(' · ');
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

      fullName.textContent = fullIdentity(identity);
      button.setAttribute('aria-label', `${identity.stage}, ${fullIdentity(identity)}`);
    });
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
