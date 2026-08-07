(() => {
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PAGE = document.documentElement.dataset.page;
  const PAGES = new Set(['index', 'members']);
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const ASSET_VERSION = 'mobile-members-redesign-v31';
  const MEMBER_KEYS = ['gaeul', 'yujin', 'rei', 'wonyoung', 'liz', 'leeseo'];
  const STAGE_NAMES = ['GAEUL', 'AN YUJIN', 'REI', 'JANG WONYOUNG', 'LIZ', 'LEESEO'];

  if (!MOBILE_QUERY.matches || !PAGES.has(PAGE)) return;

  function activeSet() {
    const fromRoot = document.documentElement.dataset.memberSet;
    if (fromRoot) return fromRoot;
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
    [0, 40, 120, 320, 800, 1600].forEach((delay) => {
      window.setTimeout(applyLovedIvePortraits, delay);
    });
  }

  window.addEventListener('revive-member-set-change', scheduleSync);

  const rootObserver = new MutationObserver(scheduleSync);
  rootObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-member-set']
  });

  function observeSurfaces() {
    const grid = document.querySelector('[data-member-grid]');
    if (grid) {
      new MutationObserver(scheduleSync).observe(grid, { childList: true });
    }

    const panel = document.querySelector('[data-member-profile]');
    if (panel) {
      new MutationObserver(scheduleSync).observe(panel, {
        attributes: true,
        attributeFilter: ['data-active-member']
      });
    }

    scheduleSync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeSurfaces, { once: true });
  } else {
    observeSurfaces();
  }
})();