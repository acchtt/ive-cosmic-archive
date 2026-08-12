(() => {
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PAGE = document.documentElement.dataset.page;
  const PICKER_PAGES = new Set(['index', 'members']);
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const CARD_ASSET_VERSION = 'challengers-gaeul-liz-swap-v58';
  const LAUNCH_KEY = 'ive-cosmic-revive-launch-seen-cover-cards-v4';

  if (!MOBILE_QUERY.matches || !PICKER_PAGES.has(PAGE)) return;

  const THEMES = {
    bangers: {
      label: 'BANGERS',
      short: 'Signal red · icy cyan · acid lime',
      color: '#f20808',
      cover: 'https://shop.ive-starship.com/cdn/shop/files/BANGERS_IVE_2nd_Album_D2C_Thumbnail.jpg?v=1770661391&width=720'
    },
    challengers: {
      label: 'CHALLENGERS',
      short: 'Ivory · oxide red · concrete · sky blue',
      color: '#b62d24',
      cover: 'https://shop.ive-starship.com/cdn/shop/files/CHALLENGERS_IVE_2nd_Album_D2C_Thumbnail.jpg?v=1770661371&width=720'
    },
    spoilers: {
      label: 'SPOILERS',
      short: 'Press blue · powder cyan · acid yellow',
      color: '#2f70b5',
      cover: 'https://cafe24img.poxo.com/officialstarship/web/product/big/202602/62ddc2c37c217ea3156871fec3b7588d.jpg'
    },
    'loved-ive': {
      label: 'LOVED IVE',
      short: 'Deep navy · studio blue · warm cream',
      color: '#6fa6c8',
      cover: 'https://starship-square.com/web/product/big/202602/8f77f8217ed9a8a19d0dee343d5c386b.jpg'
    }
  };

  const ORDER = ['bangers', 'challengers', 'spoilers', 'loved-ive'];
  const MEMBER_KEYS = ['gaeul', 'yujin', 'rei', 'wonyoung', 'liz', 'leeseo'];
  const STAGE_NAMES = ['GAEUL', 'AN YUJIN', 'REI', 'JANG WONYOUNG', 'LIZ', 'LEESEO'];
  let root = null;
  let pendingId = readStoredTheme();
  let busy = false;

  function readStoredTheme() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return THEMES[stored] ? stored : 'bangers';
    } catch {
      return 'bangers';
    }
  }

  function launchRequired() {
    try {
      return window.sessionStorage.getItem(LAUNCH_KEY) !== 'true'
        || !THEMES[window.localStorage.getItem(STORAGE_KEY)];
    } catch {
      return true;
    }
  }

  function storeTheme(id) {
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
      window.sessionStorage.setItem(LAUNCH_KEY, 'true');
    } catch {
      // The current session still updates when storage is unavailable.
    }
  }

  function portraitUrl(id, index) {
    return `assets/revive/member-cards/${id}/${MEMBER_KEYS[index]}.jpg?v=${CARD_ASSET_VERSION}`;
  }

  function cssUrl(url) {
    return `url("${String(url).replaceAll('"', '\\"')}")`;
  }

  function installStageNameOnlyOverrides() {
    if (document.querySelector('style[data-mobile-stage-name-only]')) return;

    const style = document.createElement('style');
    style.dataset.mobileStageNameOnly = 'true';
    style.textContent = `
      @media (max-width: 640px) {
        html[data-page="index"] .revive-members .member-info h3 {
          gap: 0 !important;
        }

        html[data-page="index"] .revive-members .member-info h3::after {
          content: none !important;
          display: none !important;
        }

        html[data-page="index"] .revive-members .member-card:nth-child(2) .member-info h3::before {
          content: "AN YUJIN" !important;
        }

        html[data-page="index"] .revive-members .member-card:nth-child(4) .member-info h3::before {
          content: "JANG WONYOUNG" !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function syncCampaignStageLabels() {
    if (PAGE !== 'index') return;
    document.querySelectorAll('[data-campaign-board] .campaign-photo figcaption').forEach((caption, index) => {
      if (STAGE_NAMES[index]) caption.textContent = STAGE_NAMES[index];
    });
  }

  // One local fallback sync only. The version-card renderer owns final artwork.
  function syncLocalFallback(id) {
    const resolved = THEMES[id] ? id : 'bangers';
    document.documentElement.dataset.memberSet = resolved;

    document.querySelectorAll('[data-member-grid] .member-card .member-art').forEach((art, index) => {
      if (!MEMBER_KEYS[index]) return;
      art.style.setProperty('--member-portrait', cssUrl(portraitUrl(resolved, index)));
      art.setAttribute('role', 'img');
      art.setAttribute('aria-label', `${STAGE_NAMES[index]} — ${THEMES[resolved].label} concept card`);
    });

    if (PAGE === 'index') {
      document.querySelectorAll('[data-campaign-board] .campaign-photo img').forEach((image, index) => {
        if (!MEMBER_KEYS[index]) return;
        image.src = portraitUrl(resolved, index);
        image.alt = `${STAGE_NAMES[index]} in the REVIVE+ ${THEMES[resolved].label} concept-photo set`;
      });
      syncCampaignStageLabels();
    }

    if (PAGE === 'members') {
      const panel = document.querySelector('[data-member-profile]');
      const visual = document.querySelector('[data-profile-visual]');
      const parsed = Number(panel?.dataset.activeMember ?? 0);
      const index = Number.isInteger(parsed) && parsed >= 0 && parsed < MEMBER_KEYS.length ? parsed : 0;
      if (visual) visual.style.setProperty('--dossier-portrait', cssUrl(portraitUrl(resolved, index)));
    }

    document.documentElement.dataset.mobileSyncedMemberSet = resolved;
  }

  function createPicker() {
    const existing = document.querySelector('[data-mobile-theme-picker]');
    if (existing) return existing;

    const picker = document.createElement('aside');
    picker.className = 'mobile-theme-picker';
    picker.dataset.mobileThemePicker = '';
    picker.dataset.open = 'true';
    picker.dataset.launch = 'true';
    picker.dataset.pending = pendingId;
    picker.setAttribute('aria-label', 'REVIVE+ mobile version selector');
    picker.innerHTML = `
      <div class="mobile-theme-screen" role="dialog" aria-modal="true" aria-labelledby="mobile-theme-title">
        <div class="mobile-theme-surface">
          <header class="mobile-theme-header">
            <span>REVIVE+ archive theme</span>
            <h2 id="mobile-theme-title">Choose your version</h2>
            <p class="mobile-theme-hint">Choose the album version for this archive session.</p>
          </header>

          <div class="mobile-theme-options" role="radiogroup" aria-label="REVIVE+ versions">
            ${ORDER.map((id, index) => `
              <button type="button" role="radio" data-mobile-theme-option="${id}" aria-label="${THEMES[id].label} version" aria-checked="${id === pendingId}">
                <span class="mobile-theme-option-index">0${index + 1}</span>
                <span class="mobile-theme-option-cover" aria-hidden="true">
                  <img src="${THEMES[id].cover}" alt="" loading="eager" decoding="async" draggable="false" referrerpolicy="no-referrer" />
                </span>
                <strong>${THEMES[id].label}</strong>
                <span class="mobile-theme-option-swatch" aria-hidden="true"><i></i><i></i><i></i></span>
              </button>
            `).join('')}
          </div>

          <div class="mobile-theme-summary" aria-live="polite">
            <span>Selected version</span>
            <strong data-mobile-theme-summary>${THEMES[pendingId].label}</strong>
            <p data-mobile-theme-description>${THEMES[pendingId].short}</p>
          </div>

          <footer class="mobile-theme-footer">
            <button class="mobile-theme-confirm" type="button" data-mobile-theme-confirm>
              Continue with ${THEMES[pendingId].label}
            </button>
          </footer>
        </div>
      </div>
    `;

    document.body.appendChild(picker);
    return picker;
  }

  function revealWhenStyled() {
    let attempts = 0;

    const check = () => {
      if (!root) return;
      attempts += 1;

      if (window.getComputedStyle(root).position === 'fixed' || attempts >= 45) {
        document.documentElement.dataset.mobileThemePickerReady = 'true';
        return;
      }

      window.requestAnimationFrame(check);
    };

    window.requestAnimationFrame(check);
  }

  function renderSelection() {
    if (!root || !THEMES[pendingId]) return;
    root.dataset.pending = pendingId;

    root.querySelectorAll('[data-mobile-theme-option]').forEach((button) => {
      const selected = button.dataset.mobileThemeOption === pendingId;
      button.setAttribute('aria-checked', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });

    const summary = root.querySelector('[data-mobile-theme-summary]');
    const description = root.querySelector('[data-mobile-theme-description]');
    const confirm = root.querySelector('[data-mobile-theme-confirm]');

    if (summary) summary.textContent = THEMES[pendingId].label;
    if (description) description.textContent = THEMES[pendingId].short;
    if (confirm) {
      confirm.textContent = busy ? 'Applying…' : `Continue with ${THEMES[pendingId].label}`;
      confirm.disabled = busy;
    }
  }

  function selectTheme(id, sourceButton = null) {
    if (busy || !THEMES[id]) return;
    pendingId = id;
    renderSelection();
    sourceButton?.blur();
  }

  function commitSelection() {
    if (busy || !root || !THEMES[pendingId]) return;
    busy = true;
    root.dataset.busy = 'true';
    renderSelection();

    const id = pendingId;
    storeTheme(id);
    syncLocalFallback(id);
    window.dispatchEvent(new CustomEvent('revive-member-set-change', {
      detail: { id, label: THEMES[id].label, themeColor: THEMES[id].color }
    }));

    delete document.documentElement.dataset.themeLaunchPending;
    delete document.documentElement.dataset.mobileThemePickerOpen;
    delete document.documentElement.dataset.mobileThemePickerReady;
    delete document.documentElement.dataset.mobileThemePickerManual;

    const picker = root;
    root = null;
    busy = false;
    picker.remove();
  }

  function bindPress(element, action) {
    if (!element) return;
    let lastPointerActivation = -1000;

    const activate = (event) => {
      event.preventDefault();
      event.stopPropagation();
      action(element);
    };

    if ('PointerEvent' in window) {
      element.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        lastPointerActivation = performance.now();
        activate(event);
      }, { passive: false });
    }

    element.addEventListener('click', (event) => {
      if (performance.now() - lastPointerActivation < 500) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      activate(event);
    });
  }

  function bindEvents() {
    root.querySelectorAll('[data-mobile-theme-option]').forEach((button) => {
      bindPress(button, (target) => selectTheme(target.dataset.mobileThemeOption, target));
    });

    bindPress(root.querySelector('[data-mobile-theme-confirm]'), commitSelection);

    root.querySelectorAll('.mobile-theme-option-cover img').forEach((image) => {
      image.addEventListener('error', () => {
        image.closest('[data-mobile-theme-option]')?.setAttribute('data-cover-error', 'true');
      }, { once: true });
    });
  }

  function initialize() {
    installStageNameOnlyOverrides();
    syncCampaignStageLabels();
    syncLocalFallback(readStoredTheme());

    const manualOpen = document.documentElement.dataset.mobileThemePickerManual === 'true';

    if (PAGE === 'members' && !manualOpen) {
      delete document.documentElement.dataset.themeLaunchPending;
      delete document.documentElement.dataset.mobileThemePickerOpen;
      delete document.documentElement.dataset.mobileThemePickerReady;
      return;
    }

    if (!manualOpen && !launchRequired()) {
      delete document.documentElement.dataset.themeLaunchPending;
      return;
    }

    root = createPicker();
    delete document.documentElement.dataset.mobileThemePickerManual;
    bindEvents();
    renderSelection();
    document.documentElement.dataset.themeLaunchPending = 'true';
    document.documentElement.dataset.mobileThemePickerOpen = 'true';
    revealWhenStyled();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();