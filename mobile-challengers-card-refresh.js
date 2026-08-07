(() => {
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PAGE = document.documentElement.dataset.page;
  const PAGES = new Set(['index', 'members']);
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const ASSET_VERSION = 'mobile-site-rollback-v34';
  const MEMBER_KEYS = ['gaeul', 'yujin', 'rei', 'wonyoung', 'liz', 'leeseo'];
  const STAGE_NAMES = ['GAEUL', 'AN YUJIN', 'REI', 'JANG WONYOUNG', 'LIZ', 'LEESEO'];
  const FAILED = new Set();

  if (!MOBILE_QUERY.matches || !PAGES.has(PAGE)) return;

  // Official CHALLENGERS ALERT! member series: one controlled visual system
  // across all six — black field, white/silver styling, neon-green flashlight.
  const PORTRAITS = [
    'https://i.imgur.com/U9c80gv.jpg',
    'https://i.imgur.com/ZVnaaYc.jpg',
    'https://i.imgur.com/V5MRKib.jpg',
    'https://i.imgur.com/fk5Pt1u.jpg',
    'https://i.imgur.com/j6WvOG4.jpg',
    'https://i.imgur.com/6o4i2dg.jpg'
  ];

  const POSITIONS = [
    'center center',
    'center center',
    'center center',
    'center center',
    'center center',
    'center center'
  ];

  function activeSet() {
    const fromRoot = document.documentElement.dataset.memberSet;
    if (fromRoot) return fromRoot;
    try {
      return window.localStorage.getItem(STORAGE_KEY) || 'bangers';
    } catch {
      return 'bangers';
    }
  }

  function localPortrait(index) {
    return `assets/revive/member-cards/challengers/${MEMBER_KEYS[index]}.jpg`;
  }

  function resolvedPortrait(index) {
    return FAILED.has(index) ? localPortrait(index) : PORTRAITS[index];
  }

  function cssUrl(url) {
    return `url("${String(url).replaceAll('"', '\\"')}")`;
  }

  function cssPortrait(index) {
    return `${cssUrl(PORTRAITS[index])}, ${cssUrl(localPortrait(index))}`;
  }

  function usePortrait(image, index) {
    if (!image || !PORTRAITS[index]) return;
    image.referrerPolicy = 'no-referrer';
    image.onerror = () => {
      FAILED.add(index);
      image.onerror = null;
      image.src = localPortrait(index);
    };
    image.src = resolvedPortrait(index);
  }

  function resetFraming() {
    document.querySelectorAll('[data-campaign-board] .campaign-photo img').forEach((image) => {
      image.style.removeProperty('object-position');
      image.onerror = null;
    });

    document.querySelectorAll('[data-member-grid] .member-card .member-art').forEach((art) => {
      art.style.removeProperty('background-position');
    });

    const feature = document.querySelector('.concept-card.concept-campaign img');
    if (feature) {
      feature.style.removeProperty('object-position');
      feature.onerror = null;
    }
  }

  function applyChallengersPortraits() {
    if (activeSet() !== 'challengers') {
      resetFraming();
      return;
    }

    document.querySelectorAll('[data-campaign-board] .campaign-photo img').forEach((image, index) => {
      if (!PORTRAITS[index]) return;
      usePortrait(image, index);
      image.alt = `${STAGE_NAMES[index]} in the REVIVE+ CHALLENGERS ALERT concept-photo set`;
      image.style.objectPosition = POSITIONS[index];
    });

    document.querySelectorAll('[data-member-grid] .member-card .member-art').forEach((art, index) => {
      if (!PORTRAITS[index]) return;
      art.style.setProperty('--member-portrait', cssPortrait(index));
      art.style.backgroundPosition = POSITIONS[index];
      art.setAttribute('role', 'img');
      art.setAttribute('aria-label', `${STAGE_NAMES[index]} — CHALLENGERS ALERT concept card`);
    });

    if (PAGE === 'members') {
      const panel = document.querySelector('[data-member-profile]');
      const visual = document.querySelector('[data-profile-visual]');
      const parsed = Number(panel?.dataset.activeMember ?? 0);
      const index = Number.isInteger(parsed) && parsed >= 0 && parsed < PORTRAITS.length ? parsed : 0;
      if (visual) visual.style.setProperty('--dossier-portrait', cssPortrait(index));
    }

    if (PAGE === 'index') {
      const feature = document.querySelector('.concept-card.concept-campaign img');
      if (feature) {
        usePortrait(feature, 1);
        feature.alt = 'AN YUJIN in the REVIVE+ CHALLENGERS ALERT concept-photo set';
        feature.style.objectPosition = POSITIONS[1];
      }
    }

    document.documentElement.dataset.challengersCards = ASSET_VERSION;
  }

  function scheduleSync() {
    [0, 40, 120, 320, 800, 1600].forEach((delay) => {
      window.setTimeout(applyChallengersPortraits, delay);
    });
  }

  window.addEventListener('revive-member-set-change', scheduleSync);

  new MutationObserver(scheduleSync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-member-set']
  });

  function observeSurfaces() {
    const grid = document.querySelector('[data-member-grid]');
    if (grid) new MutationObserver(scheduleSync).observe(grid, { childList: true });

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
