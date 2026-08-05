(() => {
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PAGE = document.documentElement.dataset.page;
  const PICKER_PAGES = new Set(['index', 'members']);
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const LAUNCH_KEY = 'ive-cosmic-revive-launch-seen';

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
  let appliedId = readStoredTheme();
  let pendingId = appliedId;
  let launchMode = launchRequired();
  let busy = false;
  let lastPointerAction = 0;

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
    picker.dataset.open = 'false';
    picker.dataset.launch = String(launchMode);
    picker.dataset.pending = pendingId;
    picker.setAttribute('aria-label', 'REVIVE+ mobile edition selector');
    picker.innerHTML = `
      <button class="mobile-theme-dock" type="button" data-mobile-theme-open aria-label="Change REVIVE+ edition">
        <span aria-hidden="true"></span>
        <small>REVIVE+ edition</small>
        <strong data-mobile-theme-dock-label>${THEMES[appliedId].label}</strong>
      </button>

      <div class="mobile-theme-screen" role="dialog" aria-modal="true" aria-labelledby="mobile-theme-title">
        <div class="mobile-theme-surface">
          <header class="mobile-theme-header">
            <div>
              <span>REVIVE+ archive theme</span>
              <h2 id="mobile-theme-title">Choose your edition</h2>
            </div>
            <button class="mobile-theme-close" type="button" data-mobile-theme-close aria-label="Close edition selector">×</button>
          </header>

          <div class="mobile-theme-options" role="radiogroup" aria-label="REVIVE+ editions">
            ${ORDER.map((id, index) => `
              <button type="button" role="radio" data-mobile-theme-option="${id}" aria-checked="${id === pendingId}">
                <span class="mobile-theme-option-index">0${index + 1}</span>
                <strong>${THEMES[id].label}</strong>
                <span class="mobile-theme-option-swatch" aria-hidden="true"><i></i><i></i><i></i></span>
              </button>
            `).join('')}
          </div>

          <div class="mobile-theme-summary" aria-live="polite">
            <span>Selected edition</span>
            <strong data-mobile-theme-summary>${THEMES[pendingId].label}</strong>
            <p data-mobile-theme-description>${THEMES[pendingId].short}</p>
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

  function selectTheme(id) {
    if (busy || !THEMES[id]) return;
    pendingId = id;
    renderSelection();
  }

  function openPicker(asLaunch = false) {
    if (!root) return;
    launchMode = asLaunch || launchMode;
    pendingId = appliedId;
    root.dataset.launch = String(launchMode);
    root.dataset.open = 'true';
    document.documentElement.dataset.mobileThemePickerOpen = 'true';
    renderSelection();
  }

  function closePicker() {
    if (!root || launchMode || busy) return;
    root.dataset.open = 'false';
    delete document.documentElement.dataset.mobileThemePickerOpen;
  }

  function waitForDesktopOption(id, timeout = 1800) {
    return new Promise((resolve) => {
      const started = performance.now();
      const find = () => {
        const option = document.querySelector(`.member-set-switcher-popup [data-member-set="${id}"]`);
        if (option) return resolve(option);
        if (performance.now() - started >= timeout) return resolve(null);
        window.setTimeout(find, 40);
      };
      find();
    });
  }

  async function commitSelection() {
    if (busy || !THEMES[pendingId]) return;
    busy = true;
    root.dataset.busy = 'true';
    renderSelection();

    const id = pendingId;
    const desktopOption = await waitForDesktopOption(id);

    if (desktopOption) {
      desktopOption.click();
    } else {
      document.documentElement.dataset.memberSet = id;
      window.dispatchEvent(new CustomEvent('revive-member-set-change', {
        detail: { id, label: THEMES[id].label, themeColor: THEMES[id].color }
      }));
    }

    appliedId = id;
    pendingId = id;
    storeTheme(id);
    launchMode = false;
    delete document.documentElement.dataset.themeLaunchPending;
    delete document.documentElement.dataset.mobileThemePickerOpen;

    const dockLabel = root.querySelector('[data-mobile-theme-dock-label]');
    if (dockLabel) dockLabel.textContent = THEMES[id].label;

    root.dataset.launch = 'false';
    root.dataset.open = 'false';
    root.dataset.busy = 'false';
    busy = false;
    renderSelection();
  }

  function bindAction(element, action) {
    if (!element) return;

    element.addEventListener('pointerup', (event) => {
      if (event.pointerType === 'mouse') return;
      event.preventDefault();
      event.stopPropagation();
      lastPointerAction = performance.now();
      action();
    }, { passive: false });

    element.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (performance.now() - lastPointerAction < 500) return;
      action();
    });
  }

  function bindEvents() {
    root.querySelectorAll('[data-mobile-theme-option]').forEach((button) => {
      bindAction(button, () => selectTheme(button.dataset.mobileThemeOption));
    });

    bindAction(root.querySelector('[data-mobile-theme-confirm]'), commitSelection);
    bindAction(root.querySelector('[data-mobile-theme-open]'), () => openPicker(false));
    bindAction(root.querySelector('[data-mobile-theme-close]'), closePicker);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && root.dataset.open === 'true') closePicker();
    });

    window.addEventListener('revive-member-set-change', (event) => {
      const id = event.detail?.id;
      if (!THEMES[id]) return;
      appliedId = id;
      if (root.dataset.open !== 'true') pendingId = id;
      const dockLabel = root.querySelector('[data-mobile-theme-dock-label]');
      if (dockLabel) dockLabel.textContent = THEMES[id].label;
      renderSelection();
    });
  }

  function initialize() {
    root = createPicker();
    bindEvents();
    renderSelection();

    if (launchMode) {
      document.documentElement.dataset.themeLaunchPending = 'true';
      openPicker(true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
