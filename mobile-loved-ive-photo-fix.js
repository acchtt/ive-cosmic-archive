(() => {
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PAGE = document.documentElement.dataset.page;
  const PAGES = new Set(['index', 'members']);
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const ASSET_VERSION = 'mobile-member-cardsets-v36';
  const MEMBER_KEYS = ['gaeul', 'yujin', 'rei', 'wonyoung', 'liz', 'leeseo'];
  const STAGE_NAMES = ['GAEUL', 'AN YUJIN', 'REI', 'JANG WONYOUNG', 'LIZ', 'LEESEO'];

  if (!MOBILE_QUERY.matches || !PAGES.has(PAGE)) return;

  function activeSet() {
    const root = document.documentElement.dataset.memberSet;
    if (root) return root;
    try {
      return window.localStorage.getItem(STORAGE_KEY) || 'bangers';
    } catch {
      return 'bangers';
    }
  }

  function portraitUrl(index) {
    return `assets/revive/member-cards/loved-ive/${MEMBER_KEYS[index]}.jpg?v=${ASSET_VERSION}`;
  }

  function cssUrl(url) {
    return `url("${String(url).replaceAll('"', '\\"')}")`;
  }

  function applyLovedIvePortraits() {
    if (activeSet() !== 'loved-ive') return;

    document.querySelectorAll('[data-campaign-board] .campaign-photo img').forEach((image, index) => {
      if (!MEMBER_KEYS[index]) return;
      const url = portraitUrl(index);
      if (image.getAttribute('src') !== url) image.src = url;
      image.alt = `${STAGE_NAMES[index]} in the REVIVE+ LOVED IVE concept-photo set`;
    });

    document.querySelectorAll('[data-member-grid] .member-card .member-art').forEach((art, index) => {
      if (!MEMBER_KEYS[index]) return;
      art.style.setProperty('--member-portrait', cssUrl(portraitUrl(index)));
      art.setAttribute('aria-label', `${STAGE_NAMES[index]} — LOVED IVE concept card`);
    });

    if (PAGE === 'members') {
      const panel = document.querySelector('[data-member-profile]');
      const visual = document.querySelector('[data-profile-visual]');
      const parsed = Number(panel?.dataset.activeMember ?? 0);
      const index = Number.isInteger(parsed) && parsed >= 0 && parsed < MEMBER_KEYS.length ? parsed : 0;
      if (visual) visual.style.setProperty('--dossier-portrait', cssUrl(portraitUrl(index)));
    }

    if (PAGE === 'index') {
      const feature = document.querySelector('.concept-card.concept-campaign img');
      if (feature && feature.getAttribute('src') !== portraitUrl(0)) {
        feature.src = portraitUrl(0);
        feature.alt = 'GAEUL in the REVIVE+ LOVED IVE concept-photo set';
      }
    }
  }

  function scheduleSync() {
    window.requestAnimationFrame(() => window.setTimeout(applyLovedIvePortraits, 0));
  }

  window.addEventListener('revive-member-set-change', scheduleSync);
  document.addEventListener('click', (event) => {
    if (PAGE === 'members' && event.target.closest('[data-dossier-index]')) scheduleSync();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleSync, { once: true });
  } else {
    scheduleSync();
  }
})();