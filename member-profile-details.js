(() => {
  const identities = [
    { stage: 'Gaeul', english: 'Kim Gaeul', korean: '김가을' },
    { stage: 'Yujin', english: 'An Yujin', korean: '안유진' },
    { stage: 'Rei', english: 'Naoi Rei', korean: '나오이 레이' },
    { stage: 'Wonyoung', english: 'Jang Wonyoung', korean: '장원영' },
    { stage: 'Liz', english: 'Kim Jiwon', korean: '김지원' },
    { stage: 'Leeseo', english: 'Lee Hyunseo', korean: '이현서' }
  ];

  function decorateDirectory() {
    document.querySelectorAll('[data-dossier-index]').forEach((button, index) => {
      const identity = identities[index];
      if (!identity) return;

      let fullName = button.querySelector('.dossier-full-name');
      if (!fullName) {
        fullName = document.createElement('em');
        fullName.className = 'dossier-full-name';
        button.appendChild(fullName);
      }

      fullName.textContent = `${identity.english} · ${identity.korean}`;
      button.setAttribute('aria-label', `${identity.stage}, ${identity.english}, ${identity.korean}`);
    });
  }

  function updateActiveIdentity() {
    const panel = document.querySelector('[data-member-profile]');
    if (!panel) return;

    const index = Number(panel.dataset.activeMember || 0);
    const identity = identities[index] || identities[0];
    const englishName = document.querySelector('[data-profile-english-name]');
    const koreanName = document.querySelector('[data-profile-korean-name]');

    if (englishName) englishName.textContent = identity.english;
    if (koreanName) koreanName.textContent = identity.korean;
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
