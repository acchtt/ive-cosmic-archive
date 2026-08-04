(() => {
  const page = document.documentElement.dataset.page;
  if (page !== 'index' && page !== 'members') return;

  const MEMBER_NAMES = ['Gaeul', 'Yujin', 'Rei', 'Wonyoung', 'Liz', 'Leeseo'];
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';

  const SETS = {
    bangers: {
      label: 'BANGERS',
      description: 'High-impact color, styling, and performance energy.',
      themeColor: '#ff435e',
      tags: ['Redline styling', 'High impact', 'Performance', 'Forward motion'],
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
      description: 'Sharper silhouettes and a confident competitive coordinate.',
      themeColor: '#69e5ff',
      tags: ['Competitive edge', 'Icy chrome', 'Precision', 'Momentum'],
      portraits: [
        'assets/revive/member-cards/challengers/gaeul.jpg',
        'assets/revive/member-cards/challengers/yujin.jpg',
        'assets/revive/member-cards/challengers/rei.jpg',
        'assets/revive/member-cards/challengers/wonyoung.jpg',
        'assets/revive/member-cards/challengers/liz.jpg',
        'assets/revive/member-cards/challengers/leeseo.jpg'
      ]
    },
    spoilers: {
      label: 'SPOILERS',
      description: 'Lavender press-room styling with polished editorial tension.',
      themeColor: '#c7a6ff',
      tags: ['Press room', 'Lavender flash', 'Editorial', 'Tension'],
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
      description: 'A softer graduation-inspired set built around warmth and connection.',
      themeColor: '#ffb7d2',
      tags: ['Graduation', 'Soft focus', 'Warmth', 'Connection'],
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
  let activeSetId = readStoredSet();
  let selectionVersion = 0;

  document.documentElement.dataset.memberSet = activeSetId;

  function readStoredSet() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return SETS[stored] ? stored : 'bangers';
    } catch {
      return 'bangers';
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
    if (document.querySelector('link[href="revive-member-sets.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'revive-member-sets.css';
    document.head.appendChild(link);
  }

  function createSwitcher() {
    const existing = document.querySelector('[data-member-set-switcher]');
    if (existing) return existing;

    const grid = document.querySelector('[data-member-grid]');
    const dossierLayout = document.querySelector('.dossier-layout');
    const anchor = grid || dossierLayout;
    if (!anchor) return null;

    const switcher = document.createElement('div');
    switcher.className = 'member-set-switcher reveal visible';
    switcher.dataset.memberSetSwitcher = '';
    switcher.innerHTML = `
      <div class="member-set-switcher-copy">
        <span>REVIVE+ version theme</span>
        <strong data-member-set-title>${SETS[activeSetId].label}</strong>
      </div>
      <div class="member-set-options" role="group" aria-label="Choose a REVIVE+ album-version theme and member-card set">
        ${SET_ORDER.map((setId) => `
          <button type="button" data-member-set="${setId}" aria-pressed="${setId === activeSetId}" aria-label="Use the ${SETS[setId].label} version theme">
            ${SETS[setId].label}
          </button>`).join('')}
      </div>
      <p data-member-set-description>${SETS[activeSetId].description}</p>`;

    anchor.insertAdjacentElement('beforebegin', switcher);
    switcher.addEventListener('click', (event) => {
      const button = event.target.closest('[data-member-set]');
      if (!button || !SETS[button.dataset.memberSet]) return;
      setActiveSet(button.dataset.memberSet);
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

  function preloadPortrait(url, fallbackUrl) {
    if (resolvedPortraits.has(url)) return Promise.resolve(resolvedPortraits.get(url));

    return new Promise((resolve) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        resolvedPortraits.set(url, url);
        resolve(url);
      };
      image.onerror = () => {
        resolvedPortraits.set(url, fallbackUrl);
        resolve(fallbackUrl);
      };
      image.src = url;
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
    const requested = SETS[activeSetId].portraits[index];
    const fallback = SETS.bangers.portraits[index];
    const version = selectionVersion;

    applyPortraitToDossier(index, requested);
    preloadPortrait(requested, fallback).then((resolved) => {
      if (version !== selectionVersion || index !== activeMemberIndex()) return;
      applyPortraitToDossier(index, resolved);
    });
  }

  function applyCampaignBoard() {
    if (page !== 'index') return;
    const set = SETS[activeSetId];
    const version = selectionVersion;

    set.portraits.forEach((requested, index) => {
      const fallback = SETS.bangers.portraits[index];
      applyPortraitToCampaignBoard(index, requested);
      preloadPortrait(requested, fallback).then((resolved) => {
        if (version !== selectionVersion) return;
        applyPortraitToCampaignBoard(index, resolved);
      });
    });
  }

  function applyCurrentSet() {
    const set = SETS[activeSetId];
    const version = selectionVersion;

    set.portraits.forEach((requested, index) => {
      const fallback = SETS.bangers.portraits[index];
      applyPortraitToCard(index, requested);
      preloadPortrait(requested, fallback).then((resolved) => {
        if (version !== selectionVersion) return;
        applyPortraitToCard(index, resolved);
      });
    });

    applyCurrentDossierPortrait();
    applyCampaignBoard();
    updateSwitcher();
    updateMembersPageCopy();
    updateHomeThemeCopy();
  }

  function setActiveSet(setId) {
    if (!SETS[setId]) return;
    activeSetId = setId;
    selectionVersion += 1;
    storeSet(setId);
    applyCurrentSet();
    window.dispatchEvent(new CustomEvent('revive-member-set-change', {
      detail: { id: setId, label: SETS[setId].label, themeColor: SETS[setId].themeColor }
    }));
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
    createSwitcher();
    observeRenderedCards();
    observeDossierSelection();
    applyCurrentSet();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
