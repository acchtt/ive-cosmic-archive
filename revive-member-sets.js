(() => {
  const page = document.documentElement.dataset.page;
  if (page !== 'index' && page !== 'members') return;

  const MEMBER_NAMES = ['Gaeul', 'Yujin', 'Rei', 'Wonyoung', 'Liz', 'Leeseo'];
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const CARD_ASSET_VERSION = 'challengers-card-owner-sync-v54';
  const CORE_EVENT_SOURCE = 'revive-member-sets';
  const LAUNCH_KEY = 'ive-cosmic-revive-launch-seen';
  const ARCHIVE_VERSION = '0.20.0';
  const ARCHIVE_BUILD = '021';
  const RELOAD_NAVIGATION = (() => {
    try {
      const navigation = window.performance?.getEntriesByType?.('navigation')?.[0];
      return navigation?.type === 'reload' || window.performance?.navigation?.type === 1;
    } catch {
      return false;
    }
  })();

  if (RELOAD_NAVIGATION) {
    document.documentElement.dataset.themeLaunchPending = 'true';
  }

  const SETS = {
    bangers: {
      label: 'BANGERS',
      description: 'Color-block fashion energy in signal red, electric cyan, acid lime, and icy white.',
      themeColor: '#fd0100',
      tags: ['Signal red', 'Electric cyan', 'Acid lime', 'Color-block'],
      portraits: [
        'assets/revive/member-cards/bangers/gaeul.jpg',
        'assets/revive/member-cards/bangers/yujin.jpg',
        'assets/revive/member-cards/bangers/rei.jpg',
        'assets/revive/member-cards/bangers/wonyoung.jpg',
        'assets/revive/member-cards/bangers/liz.jpg',
        'assets/revive/member-cards/bangers/leeseo.jpg'
      ]
    },
    challengers: {
      label: 'CHALLENGERS',
      description: 'Black-stage portraits cut by laser green light and cold mint styling.',
      themeColor: '#10e68a',
      tags: ['Laser green', 'Black stage', 'Cold mint', 'Challenge mode'],
      portraits: [
        `assets/revive/member-cards/challengers/gaeul.jpg?v=${CARD_ASSET_VERSION}`,
        `assets/revive/member-cards/challengers/yujin.jpg?v=${CARD_ASSET_VERSION}`,
        `assets/revive/member-cards/challengers/rei.jpg?v=${CARD_ASSET_VERSION}`,
        `assets/revive/member-cards/challengers/wonyoung.jpg?v=${CARD_ASSET_VERSION}`,
        `assets/revive/member-cards/challengers/liz.jpg?v=${CARD_ASSET_VERSION}`,
        `assets/revive/member-cards/challengers/leeseo.jpg?v=${CARD_ASSET_VERSION}`
      ]
    },
    spoilers: {
      label: 'SPOILERS',
      description: 'Press-room blue, cool gray, powder cyan, and acid-yellow editorial details.',
      themeColor: '#3071b6',
      tags: ['Press blue', 'Cool gray', 'Powder cyan', 'Acid yellow'],
      portraits: [
        'assets/revive/member-cards/spoilers/gaeul.jpg',
        'assets/revive/member-cards/spoilers/yujin.jpg',
        'assets/revive/member-cards/spoilers/rei.jpg',
        'assets/revive/member-cards/spoilers/wonyoung.jpg',
        'assets/revive/member-cards/spoilers/liz.jpg',
        'assets/revive/member-cards/spoilers/leeseo.jpg'
      ]
    },
    'loved-ive': {
      label: 'LOVED IVE',
      description: 'School-portrait navy, studio blue, soft gray, and warm uniform neutrals.',
      themeColor: '#0a355e',
      tags: ['School portrait', 'Deep navy', 'Studio blue', 'Uniform neutrals'],
      portraits: [
        'assets/revive/member-cards/loved-ive/gaeul.jpg',
        'assets/revive/member-cards/loved-ive/yujin.jpg',
        'assets/revive/member-cards/loved-ive/rei.jpg',
        'assets/revive/member-cards/loved-ive/wonyoung.jpg',
        'assets/revive/member-cards/loved-ive/liz.jpg',
        'assets/revive/member-cards/loved-ive/leeseo.jpg'
      ]
    }
  };

  const SET_ORDER = ['bangers', 'challengers', 'spoilers', 'loved-ive'];
  const resolvedPortraits = new Map();
  const portraitLoads = new Map();
  const portraitImages = new Map();
  const setLoads = new Map();
  let activeSetId = readStoredSet();
  let selectionVersion = 0;

  document.documentElement.dataset.memberSet = activeSetId;
  document.documentElement.dataset.memberAssetsReady = 'loading';

  function readStoredSet() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return SETS[stored] ? stored : 'bangers';
    } catch {
      return 'bangers';
    }
  }

  function hasStoredSet() {
    try {
      return Boolean(SETS[window.localStorage.getItem(STORAGE_KEY)]);
    } catch {
      return false;
    }
  }

  function hasSeenLaunchPicker() {
    try {
      return window.sessionStorage.getItem(LAUNCH_KEY) === 'true';
    } catch {
      return false;
    }
  }

  function markLaunchPickerSeen() {
    try {
      window.sessionStorage.setItem(LAUNCH_KEY, 'true');
    } catch {
      // The launch picker still works when session storage is unavailable.
    }
  }

  function storeSet(setId) {
    try {
      window.localStorage.setItem(STORAGE_KEY, setId);
    } catch {
      // The selector still works when storage is unavailable.
    }
  }

  function cssUrl(url) {
    return `url("${String(url).replaceAll('"', '\\"')}")`;
  }

  function ensureStylesheet() {
    if (!document.querySelector('link[href="revive-member-sets.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'revive-member-sets.css';
      document.head.appendChild(link);
    }

    if (!document.querySelector('[data-instant-member-swap-style]')) {
      const style = document.createElement('style');
      style.dataset.instantMemberSwapStyle = '';
      style.textContent = `
        .member-card .member-art,
        html[data-page="members"] .dossier-panel .dossier-visual::before {
          transition: filter .18s ease, opacity .18s ease !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function injectPreloadHints() {
    const fragment = document.createDocumentFragment();
    SET_ORDER.forEach((setId) => {
      SETS[setId].portraits.forEach((url) => {
        if (document.querySelector(`link[rel="preload"][as="image"][href="${url}"]`)) return;
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        link.fetchPriority = 'high';
        fragment.appendChild(link);
      });
    });
    document.head.appendChild(fragment);
  }

  let changeHintTimer = 0;

  function setLaunchPending(pending) {
    if (pending) document.documentElement.dataset.themeLaunchPending = 'true';
    else delete document.documentElement.dataset.themeLaunchPending;
  }

  function setSwitcherOpen(switcher, open) {
    if (!switcher) return;
    switcher.dataset.open = String(open);
    if (open) switcher.dataset.hintVisible = 'false';
    const toggle = switcher.querySelector('[data-member-set-toggle]');
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
  }

  function showChangeHint(switcher) {
    if (!switcher) return;
    window.clearTimeout(changeHintTimer);
    switcher.dataset.hintVisible = 'true';
    changeHintTimer = window.setTimeout(() => {
      switcher.dataset.hintVisible = 'false';
    }, 6500);
  }

  function createSwitcher() {
    const existing = document.querySelector('[data-member-set-switcher]');
    if (existing) return existing;

    const switcher = document.createElement('aside');
    const launchOpen = RELOAD_NAVIGATION || !hasSeenLaunchPicker() || !hasStoredSet();
    setLaunchPending(launchOpen);
    switcher.className = 'member-set-switcher-popup';
    switcher.dataset.memberSetSwitcher = '';
    switcher.dataset.open = String(launchOpen);
    switcher.dataset.launch = String(launchOpen);
    switcher.dataset.hintVisible = 'false';
    switcher.setAttribute('aria-label', 'REVIVE+ album-version theme selector');
    switcher.innerHTML = `
      <div class="member-set-launch-backdrop" aria-hidden="true"></div>
      <button class="member-set-dock" type="button" data-member-set-toggle aria-expanded="${launchOpen}" aria-controls="revive-version-menu">
        <span class="member-set-dock-dot" aria-hidden="true"></span>
        <span class="member-set-dock-label">REVIVE+ edition</span>
        <strong data-member-set-title>${SETS[activeSetId].label}</strong>
        <span class="member-set-dock-action" aria-hidden="true">Change</span>
      </button>
      <div class="member-set-change-hint" role="status" aria-live="polite">
        <span>Theme set. You can change it anytime from this button.</span>
        <button type="button" data-member-set-hint-close aria-label="Dismiss theme-change tip">×</button>
      </div>
      <div class="member-set-popover" id="revive-version-menu" role="dialog" aria-modal="${launchOpen}" aria-label="Choose a REVIVE+ album version">
        <div class="member-set-popover-head">
<div>
  <span>REVIVE+ launch theme</span>
  <strong>Which edition do you want?</strong>
</div>
<button type="button" class="member-set-close" data-member-set-close aria-label="Close edition menu">×</button>
        </div>
        <p data-member-set-description>${SETS[activeSetId].description}</p>
        <div class="member-set-options" role="group" aria-label="Choose a REVIVE+ album-version theme and member-card set">
${SET_ORDER.map((setId) => `
  <button type="button" data-member-set="${setId}" aria-pressed="${setId === activeSetId}" aria-label="Use the ${SETS[setId].label} version theme">
    <span>${SETS[setId].label}</span>
    <small>06 cards</small>
  </button>`).join('')}
        </div>
      </div>`;

    document.body.appendChild(switcher);

    if (launchOpen) {
      requestAnimationFrame(() => {
        switcher.querySelector('[data-member-set]')?.focus();
      });
    }

    switcher.addEventListener('click', (event) => {
      if (event.target.closest('[data-member-set-hint-close]')) {
        switcher.dataset.hintVisible = 'false';
        window.clearTimeout(changeHintTimer);
        return;
      }

      const toggle = event.target.closest('[data-member-set-toggle]');
      if (toggle) {
        switcher.dataset.launch = 'false';
        switcher.querySelector('.member-set-popover')?.setAttribute('aria-modal', 'false');
        setSwitcherOpen(switcher, switcher.dataset.open !== 'true');
        return;
      }

      if (event.target.closest('[data-member-set-close]')) {
        if (switcher.dataset.launch === 'true') return;
        setSwitcherOpen(switcher, false);
        return;
      }

      const button = event.target.closest('[data-member-set]');
      if (!button || !SETS[button.dataset.memberSet]) return;

      const wasLaunch = switcher.dataset.launch === 'true';
      setActiveSet(button.dataset.memberSet);
      if (wasLaunch) markLaunchPickerSeen();
      setLaunchPending(false);
      switcher.dataset.launch = 'false';
      switcher.querySelector('.member-set-popover')?.setAttribute('aria-modal', 'false');
      setSwitcherOpen(switcher, false);
      showChangeHint(switcher);
      switcher.querySelector('[data-member-set-toggle]')?.focus();
    });

    document.addEventListener('pointerdown', (event) => {
      if (switcher.dataset.launch === 'true') return;
      if (switcher.dataset.open !== 'true' || switcher.contains(event.target)) return;
      setSwitcherOpen(switcher, false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || switcher.dataset.open !== 'true') return;
      if (switcher.dataset.launch === 'true') return;
      setSwitcherOpen(switcher, false);
      switcher.querySelector('[data-member-set-toggle]')?.focus();
    });

    return switcher;
  }

  function updateThemeColor() {
    const set = SETS[activeSetId];
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = set.themeColor;
  }

  function updateSwitcher() {
    const set = SETS[activeSetId];
    document.documentElement.dataset.memberSet = activeSetId;
    updateThemeColor();

    document.querySelectorAll('[data-member-set]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.memberSet === activeSetId));
    });

    const title = document.querySelector('[data-member-set-title]');
    const description = document.querySelector('[data-member-set-description]');
    if (title) title.textContent = set.label;
    if (description) description.textContent = set.description;
  }

  function updateFooterVersion() {
    const footer = document.querySelector('.footer-code');
    if (!footer) return;
    let base = footer.textContent.trim().replace(/\s*·\s*v\d+(?:\.\d+){1,2}.*$/, '');
    base = base.replace(/Archive build\s*·\s*\d+/, `Archive build · ${ARCHIVE_BUILD}`);
    footer.textContent = `${base} · v${ARCHIVE_VERSION}`;
  }

  function updateMembersPageCopy() {
    if (page !== 'members') return;
    const set = SETS[activeSetId];
    const headingCopy = document.querySelector('.page-section .section-heading > p');
    const credit = document.querySelector('.photo-credit');

    if (headingCopy) {
      headingCopy.innerHTML = `Browse all four standard <em>REVIVE+</em> concept-card sets. Current coordinate: <strong>${set.label}</strong>. The archive palette now follows the selected album version.`;
    }

    if (credit) {
      credit.innerHTML = `REVIVE+ “${set.label}” concept photos · <a href="https://x.com/IVEstarship" target="_blank" rel="noreferrer">IVE Official</a> · <a href="https://www.starship-ent.com/musician/ive" target="_blank" rel="noreferrer">Starship Entertainment</a>`;
    }
  }

  function updateHomeThemeCopy() {
    if (page !== 'index') return;
    const set = SETS[activeSetId];
    const tags = document.querySelectorAll('.revive-campaign-tags span');
    tags.forEach((tag, index) => {
      if (set.tags[index]) tag.textContent = set.tags[index];
    });

    const board = document.querySelector('[data-campaign-board]');
    if (board) {
      board.dataset.themeLabel = `REVIVE+ / ${set.label} VERSION / 2026`;
      board.setAttribute('aria-label', `${set.label} six-member REVIVE+ campaign board`);
    }
  }

  function preloadPortrait(url, fallbackUrl, priority = 'high') {
    if (resolvedPortraits.has(url)) return Promise.resolve(resolvedPortraits.get(url));
    if (portraitLoads.has(url)) return portraitLoads.get(url);

    const load = new Promise((resolve) => {
      const image = new Image();
      image.decoding = 'async';
      if ('fetchPriority' in image) image.fetchPriority = priority;

      image.onload = async () => {
        try {
          await image.decode();
        } catch {
          // A completed load is still usable when explicit decode is unsupported.
        }
        portraitImages.set(url, image);
        resolvedPortraits.set(url, url);
        resolve(url);
      };

      image.onerror = () => {
        if (url === fallbackUrl) {
          resolvedPortraits.set(url, fallbackUrl);
          resolve(fallbackUrl);
          return;
        }
        preloadPortrait(fallbackUrl, fallbackUrl, priority).then((resolved) => {
          resolvedPortraits.set(url, resolved);
          resolve(resolved);
        });
      };

      image.src = url;
    });

    portraitLoads.set(url, load);
    return load;
  }

  function preloadSetPortraits(setId, priority = 'high') {
    if (setLoads.has(setId)) return setLoads.get(setId);

    const load = Promise.all(SETS[setId].portraits.map((url, index) => {
      const fallback = SETS.bangers.portraits[index];
      return preloadPortrait(url, fallback, priority);
    }));

    setLoads.set(setId, load);
    return load;
  }

  function preloadAllPortraits() {
    const preloadOrder = [
      activeSetId,
      ...SET_ORDER.filter((setId) => setId !== activeSetId)
    ];

    return Promise.all(preloadOrder.map((setId) => preloadSetPortraits(setId, 'high')))
      .then(() => {
        document.documentElement.dataset.memberAssetsReady = 'true';
      });
  }

  function applyPortraitToCard(index, url) {
    const art = document.querySelectorAll('[data-member-grid] .member-card .member-art')[index];
    if (!art) return;
    art.style.setProperty('--member-portrait', cssUrl(url));
    art.setAttribute('role', 'img');
    art.setAttribute('aria-label', `${MEMBER_NAMES[index]} — ${SETS[activeSetId].label} concept card`);
  }

  function applyPortraitToCampaignBoard(index, url) {
    const image = document.querySelectorAll('[data-campaign-board] .campaign-photo img')[index];
    if (!image) return;
    image.src = url;
    image.alt = `${MEMBER_NAMES[index]} in the REVIVE+ ${SETS[activeSetId].label} concept-photo set`;
  }

  function activeMemberIndex() {
    const panel = document.querySelector('[data-member-profile]');
    const parsed = Number(panel?.dataset.activeMember ?? 0);
    return Number.isInteger(parsed) && parsed >= 0 && parsed < MEMBER_NAMES.length ? parsed : 0;
  }

  function applyPortraitToDossier(index, url) {
    const visual = document.querySelector('[data-profile-visual]');
    if (!visual) return;
    visual.style.setProperty('--dossier-portrait', cssUrl(url));
  }

  function applyCurrentDossierPortrait() {
    const index = activeMemberIndex();
    const setId = activeSetId;
    const version = selectionVersion;

    preloadSetPortraits(setId, 'high').then((portraits) => {
      if (version !== selectionVersion || setId !== activeSetId || index !== activeMemberIndex()) return;
      applyPortraitToDossier(index, portraits[index]);
    });
  }

  function applyResolvedSet(setId, portraits, version) {
    if (version !== selectionVersion || setId !== activeSetId) return;

    requestAnimationFrame(() => {
      if (version !== selectionVersion || setId !== activeSetId) return;

      portraits.forEach((url, index) => {
        applyPortraitToCard(index, url);
        if (page === 'index') applyPortraitToCampaignBoard(index, url);
      });

      const dossierIndex = activeMemberIndex();
      applyPortraitToDossier(dossierIndex, portraits[dossierIndex]);
      updateSwitcher();
      updateMembersPageCopy();
      updateHomeThemeCopy();
    });
  }

  function applyCurrentSet() {
    const setId = activeSetId;
    const version = selectionVersion;

    return preloadSetPortraits(setId, 'high').then((portraits) => {
      applyResolvedSet(setId, portraits, version);
    });
  }

  function setActiveSet(setId) {
    if (!SETS[setId]) return;

    storeSet(setId);
    if (setId === activeSetId) {
      updateSwitcher();
      return;
    }

    activeSetId = setId;
    selectionVersion += 1;
    applyCurrentSet();
    window.dispatchEvent(new CustomEvent('revive-member-set-change', {
      detail: { id: setId, label: SETS[setId].label, themeColor: SETS[setId].themeColor, source: CORE_EVENT_SOURCE }
    }));
  }

  function syncExternalMemberSet(event) {
    const setId = event.detail?.id;
    if (!SETS[setId] || event.detail?.source === CORE_EVENT_SOURCE) return;

    storeSet(setId);
    if (setId !== activeSetId) {
      activeSetId = setId;
      selectionVersion += 1;
    }

    document.documentElement.dataset.memberSet = setId;
    applyCurrentSet();
  }

  function observeRenderedCards() {
    const grid = document.querySelector('[data-member-grid]');
    if (!grid) return;

    const observer = new MutationObserver(() => applyCurrentSet());
    observer.observe(grid, { childList: true });
  }

  function observeDossierSelection() {
    const panel = document.querySelector('[data-member-profile]');
    if (!panel) return;
    const observer = new MutationObserver(applyCurrentDossierPortrait);
    observer.observe(panel, {
      attributes: true,
      attributeFilter: ['data-active-member']
    });
  }

  function initialize() {
    ensureStylesheet();
    injectPreloadHints();
    createSwitcher();
    updateFooterVersion();
    observeRenderedCards();
    observeDossierSelection();
    applyCurrentSet();
  }

  window.addEventListener('revive-member-set-change', syncExternalMemberSet);

  injectPreloadHints();
  preloadAllPortraits();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();