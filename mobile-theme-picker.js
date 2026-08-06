(() => {
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PAGE = document.documentElement.dataset.page;
  const PICKER_PAGES = new Set(['index', 'members']);
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const LAUNCH_KEY = 'ive-cosmic-revive-launch-seen-clean-v2';

  if (!MOBILE_QUERY.matches || !PICKER_PAGES.has(PAGE)) return;

  const THEMES = {
    bangers: {
      label: 'BANGERS',
      short: 'Signal red · icy cyan · acid lime',
      color: '#f20808'
    },
    challengers: {
      label: 'CHALLENGERS',
      short: 'Ivory · oxide red · concrete · sky blue',
      color: '#b62d24'
    },
    spoilers: {
      label: 'SPOILERS',
      short: 'Press blue · powder cyan · acid yellow',
      color: '#2f70b5'
    },
    'loved-ive': {
      label: 'LOVED IVE',
      short: 'Deep navy · studio blue · warm cream',
      color: '#6fa6c8'
    }
  };

  const ORDER = ['bangers', 'challengers', 'spoilers', 'loved-ive'];
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

  function createPicker() {
    const existing = document.querySelector('[data-mobile-theme-picker]');
    if (existing) return existing;

    const picker = document.createElement('aside');
    picker.className = 'mobile-theme-picker';
    picker.dataset.mobileThemePicker = '';
    picker.dataset.open = 'true';
    picker.dataset.launch = 'true';
    picker.dataset.pending = pendingId;
    picker.setAttribute('aria-label', 'REVIVE+ mobile edition selector');
    picker.innerHTML = `
      <div class="mobile-theme-screen" role="dialog" aria-modal="true" aria-labelledby="mobile-theme-title">
        <div class="mobile-theme-surface">
          <header class="mobile-theme-header">
            <div>
              <span>REVIVE+ archive theme</span>
              <h2 id="mobile-theme-title">Choose your edition</h2>
              <p class="mobile-theme-hint">Pick the cover palette that should shape your archive.</p>
            </div>
          </header>

          <div class="mobile-theme-summary" aria-live="polite">
            <span>Palette preview</span>
            <strong data-mobile-theme-summary>${THEMES[pendingId].label}</strong>
            <p data-mobile-theme-description>${THEMES[pendingId].short}</p>
          </div>

          <div class="mobile-theme-options" role="radiogroup" aria-label="REVIVE+ editions">
            ${ORDER.map((id, index) => `
              <button type="button" role="radio" data-mobile-theme-option="${id}" aria-label="${THEMES[id].label} edition" aria-checked="${id === pendingId}">
                <span class="mobile-theme-option-index">0${index + 1}</span>
                <strong>${THEMES[id].label}</strong>
                <span class="mobile-theme-option-swatch" aria-hidden="true"><i></i><i></i><i></i></span>
              </button>
            `).join('')}
          </div>

          <footer class="mobile-theme-footer">
            <button class="mobile-theme-confirm" type="button" data-mobile-theme-confirm>
              Use ${THEMES[pendingId].label}
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

      if (window.getComputedStyle(root).position === 'fixed' || attempts >= 120) {
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
      confirm.textContent = busy ? 'Applying…' : `Use ${THEMES[pendingId].label}`;
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
    if (busy || !THEMES[pendingId]) return;
    busy = true;
    root.dataset.busy = 'true';
    renderSelection();

    const id = pendingId;
    storeTheme(id);
    document.documentElement.dataset.memberSet = id;
    window.dispatchEvent(new CustomEvent('revive-member-set-change', {
      detail: { id, label: THEMES[id].label, themeColor: THEMES[id].color }
    }));

    delete document.documentElement.dataset.themeLaunchPending;
    delete document.documentElement.dataset.mobileThemePickerOpen;
    delete document.documentElement.dataset.mobileThemePickerReady;

    root.remove();
    root = null;
    busy = false;
  }

  function bindClick(element, action) {
    if (!element) return;
    element.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      action(event.currentTarget);
    });
  }

  function bindEvents() {
    root.querySelectorAll('[data-mobile-theme-option]').forEach((button) => {
      bindClick(button, (target) => selectTheme(target.dataset.mobileThemeOption, target));
    });

    bindClick(root.querySelector('[data-mobile-theme-confirm]'), commitSelection);
  }

  function initialize() {
    if (!launchRequired()) return;

    root = createPicker();
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
