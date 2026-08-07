(() => {
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PAGE = document.documentElement.dataset.page;
  const PAGES = new Set(['index', 'members']);
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const ASSET_VERSION = 'mobile-challengers-concept2-v27';
  const MEMBER_KEYS = ['gaeul', 'yujin', 'rei', 'wonyoung', 'liz', 'leeseo'];
  const STAGE_NAMES = ['GAEUL', 'AN YUJIN', 'REI', 'JANG WONYOUNG', 'LIZ', 'LEESEO'];
  const FAILED = new Set();

  if (!MOBILE_QUERY.matches || !PAGES.has(PAGE)) return;

  // CHALLENGERS CONCEPT PHOTO 2: the second official editorial/poster series.
  // One matching hero image per member keeps the six-card system cohesive.
  const PORTRAITS = [
    'https://blogger.googleusercontent.com/img/a/AVvXsEhgV9_rkDOVY6gK2PwWD40xAfbLtiysKMv-TsGFnRwpOUmj5UppWl75_sxQrQhbkBpJZAym9RhZH4uuCoxOqFWPnaLOYOdpve0Vn51_GTWKcci0JK8RWFjb2wTjcCeU8BC6uvtkfPm5i7-S7JIHefmUs3_-Es4UiqQrgk1emh40WRw2S_sIIyxz-GIM46Cg',
    'https://blogger.googleusercontent.com/img/a/AVvXsEjjeynLY8Ypr6XP3l4BE_iirXCAYkPObbXbaY_Aps1z77M0NAXKQmy5krafm2sglAzW4-7vF9i_cPipRbhmKAHduN83K4pbzv93aSIV4xYKb-rJpXrho4xmrnRlJ7fuEBdA4TB3nAFmKS21iV7kDqx8IJRb_RIWE3IfhQL7r4c9-io2WmAQbM1L6iIEltA8',
    'https://blogger.googleusercontent.com/img/a/AVvXsEj99OH4Vbe3TmKg4YH_EXA5avOfOH_AJ7sTt0cHwlxtegYoGt0ZX93bCfwrWTJBhDCBxurx4lZAP8WdqQAwV1z6nvReB46Jtj93PcT9sREKLMr4rmHDJJ5b1PQqXbDPZwOAUrPWIyJfamtbAukOS6GOIdKth64lFZUfcPXxZV675GXD_6I5Y22m5WnPCqhP',
    'https://blogger.googleusercontent.com/img/a/AVvXsEjrK1AQ9FVa2W1mYCybq273VndYSZUgditIdQUsuI2MfONKq1X9jPv8ohYjILZnDjLUhkQTA6WvnVHYJ-6kLSB51zKk7d6Jmf6KgXKJ_zeyIa9PL-rL3f1-f-pGV6fCvO7e43Vy4Kyfzg9qn3z5sh3mIagDbFKa1HqCm7oUEZWSTUdOWoAqx9VS9dIWWmBG',
    'https://blogger.googleusercontent.com/img/a/AVvXsEjEBHw2GS78pmn7dseng2eI1ToEFqK6w64urcSAKexayG5CDdCcCXmlQqb3t79BRsDgceEU9s-6Nf2tB9we5gC498Ps3L3t0Mj0oU8AA-AAaApewS7C1D9G7eREFqLOR0DceDuvxm76xIcYlqdqRu8QfNV7gk6Z4KHTugFgpWtWwpEHcDtL4lPx5VBkphrn',
    'https://blogger.googleusercontent.com/img/a/AVvXsEisTjCpozQIMBLJMXHxiMmpIWAIpeFQwTp7C0QDrM17xcgDlrmRpkZ5hWdfss_QZ_N3vjY837wdRFsue7iqNeqFI0tMKyj9upbIN-he8qjc--8RQ7Lck_gRaCdkGUqgyiksc9qCGyLe4gdjt4-oBLzZmx46GVXXf2FmF35JO7_PZiv_jZFgs9QFjuWIZ9QF'
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
      image.alt = `${STAGE_NAMES[index]} in REVIVE+ CHALLENGERS CONCEPT PHOTO 2`;
      image.style.objectPosition = POSITIONS[index];
    });

    document.querySelectorAll('[data-member-grid] .member-card .member-art').forEach((art, index) => {
      if (!PORTRAITS[index]) return;
      art.style.setProperty('--member-portrait', cssPortrait(index));
      art.style.backgroundPosition = POSITIONS[index];
      art.setAttribute('role', 'img');
      art.setAttribute('aria-label', `${STAGE_NAMES[index]} — CHALLENGERS CONCEPT PHOTO 2 card`);
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
        feature.alt = 'AN YUJIN in REVIVE+ CHALLENGERS CONCEPT PHOTO 2';
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
