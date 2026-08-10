(() => {
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PAGE = document.documentElement.dataset.page;
  const PAGES = new Set(['index', 'members']);
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const ASSET_VERSION = 'mobile-spoilers-hires-sync-v42';
  const MEMBER_KEYS = ['gaeul', 'yujin', 'rei', 'wonyoung', 'liz', 'leeseo'];
  const STAGE_NAMES = ['GAEUL', 'AN YUJIN', 'REI', 'JANG WONYOUNG', 'LIZ', 'LEESEO'];
  const FAILED = new Set();

  if (!MOBILE_QUERY.matches || !PAGES.has(PAGE)) return;

  const SETS = {
    bangers: {
      label: 'BANGERS',
      featureIndex: 3,
      portraits: [
        'https://i.imgur.com/4hsGTOs.jpg',
        'https://i.imgur.com/KCZkQiX.jpg',
        'https://i.imgur.com/m1ERSWg.jpg',
        'https://i.imgur.com/IHBkZIr.jpg',
        'https://i.imgur.com/vQ9l4no.jpg',
        'https://i.imgur.com/YfLymCh.jpg'
      ]
    },
    challengers: {
      label: 'CHALLENGERS',
      featureIndex: 1,
      portraits: [
        'https://i.imgur.com/U9c80gv.jpg',
        'https://i.imgur.com/ZVnaaYc.jpg',
        'https://i.imgur.com/V5MRKib.jpg',
        'https://i.imgur.com/fk5Pt1u.jpg',
        'https://i.imgur.com/j6WvOG4.jpg',
        'https://i.imgur.com/6o4i2dg.jpg'
      ]
    },
    spoilers: {
      label: 'SPOILERS',
      featureIndex: 4,
      // Same position (09) in each member's verified 15-image SPOILERS block.
      // These are separate original-size images, not crops from a six-member composite.
      portraits: [
        'https://f.ptcdn.info/433/090/000/mkwpec2th1WB52os1Ad-o.jpg',
        'https://f.ptcdn.info/433/090/000/mkwpauqviaeDbRQe21n-o.jpg',
        'https://f.ptcdn.info/433/090/000/mkwpjwq4o00Q5nvmppc-o.jpg',
        'https://f.ptcdn.info/433/090/000/mkwpravrhpijb87Y2f8-o.jpg',
        'https://f.ptcdn.info/433/090/000/mkwpgjojoSD3a7wmO3B-o.jpg',
        'https://f.ptcdn.info/433/090/000/mkwpmimmhaO92R4tVCC-o.jpg'
      ]
    },
    'loved-ive': {
      label: 'LOVED IVE',
      featureIndex: 0,
      portraits: MEMBER_KEYS.map((key) => `assets/revive/member-cards/loved-ive/${key}.jpg?v=${ASSET_VERSION}`)
    }
  };

  function activeSet() {
    const root = document.documentElement.dataset.memberSet;
    if (SETS[root]) return root;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return SETS[stored] ? stored : 'bangers';
    } catch {
      return 'bangers';
    }
  }

  function localPortrait(set, index) {
    return `assets/revive/member-cards/${set}/${MEMBER_KEYS[index]}.jpg?v=${ASSET_VERSION}`;
  }

  function failureKey(set, index) {
    return `${set}:${index}`;
  }

  function resolvedPortrait(set, index) {
    const source = SETS[set]?.portraits[index];
    if (!source || FAILED.has(failureKey(set, index))) return localPortrait(set, index);
    return source;
  }

  function cssUrl(url) {
    return `url("${String(url).replaceAll('"', '\\"')}")`;
  }

  function cssPortrait(set, index) {
    const source = SETS[set]?.portraits[index];
    const fallback = localPortrait(set, index);
    if (!source || source.startsWith('assets/')) return cssUrl(source || fallback);
    return `${cssUrl(source)}, ${cssUrl(fallback)}`;
  }

  function clearLegacyInlineArt(node) {
    if (!node) return;
    node.style.removeProperty('background-image');
    node.style.removeProperty('background-size');
    node.style.removeProperty('background-position');
    node.style.removeProperty('background-repeat');
    node.style.removeProperty('--version-card-background-size');
    node.style.removeProperty('--version-card-background-position');
    node.style.removeProperty('--version-card-background-repeat');
  }

  function usePortrait(image, set, index) {
    if (!image || !SETS[set]?.portraits[index]) return;
    clearLegacyInlineArt(image);
    image.referrerPolicy = 'no-referrer';
    image.onerror = () => {
      FAILED.add(failureKey(set, index));
      image.onerror = null;
      image.src = localPortrait(set, index);
    };
    image.src = resolvedPortrait(set, index);
  }

  function applyArtPortrait(art, set, index, variableName) {
    if (!art) return;
    clearLegacyInlineArt(art);
    art.style.setProperty(variableName, cssPortrait(set, index));
  }

  function activeMemberIndex() {
    const panel = document.querySelector('[data-member-profile]');
    const parsed = Number(panel?.dataset.activeMember ?? 0);
    return Number.isInteger(parsed) && parsed >= 0 && parsed < MEMBER_KEYS.length ? parsed : 0;
  }

  function applyVersionCards() {
    const set = activeSet();
    const config = SETS[set];
    if (!config) return;

    document.querySelectorAll('[data-campaign-board] .campaign-photo img').forEach((image, index) => {
      if (!MEMBER_KEYS[index]) return;
      usePortrait(image, set, index);
      image.alt = `${STAGE_NAMES[index]} in the REVIVE+ ${config.label} concept-card set`;
      image.style.objectPosition = 'center center';
    });

    document.querySelectorAll('[data-member-grid] .member-card .member-art').forEach((art, index) => {
      if (!MEMBER_KEYS[index]) return;
      applyArtPortrait(art, set, index, '--member-portrait');
      art.setAttribute('role', 'img');
      art.setAttribute('aria-label', `${STAGE_NAMES[index]} — ${config.label} concept card`);
    });

    if (PAGE === 'members') {
      const visual = document.querySelector('[data-profile-visual]');
      const index = activeMemberIndex();
      applyArtPortrait(visual, set, index, '--dossier-portrait');
    }

    if (PAGE === 'index') {
      const feature = document.querySelector('.concept-card.concept-campaign img');
      const index = config.featureIndex;
      if (feature && Number.isInteger(index)) {
        usePortrait(feature, set, index);
        feature.alt = `${STAGE_NAMES[index]} in the REVIVE+ ${config.label} concept-card set`;
        feature.style.objectPosition = 'center center';
      }
    }

    document.documentElement.dataset.versionCards = ASSET_VERSION;
  }

  function scheduleSync() {
    window.requestAnimationFrame(applyVersionCards);
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