(() => {
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PAGE = document.documentElement.dataset.page;
  const PICKER_PAGES = new Set(['index', 'members']);
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const LAUNCH_KEY = 'ive-cosmic-revive-launch-seen-cover-cards-v4';
  const HINT_DURATION = 4200;
  const VERSION_LABELS = {
    bangers: 'BANGERS',
    challengers: 'CHALLENGERS',
    spoilers: 'SPOILERS',
    'loved-ive': 'LOVED IVE'
  };

  if (!MOBILE_QUERY.matches || !PICKER_PAGES.has(PAGE)) return;

  let control = null;
  let hintTimer = 0;

  function currentVersion() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return VERSION_LABELS[stored] ? stored : 'bangers';
    } catch {
      return 'bangers';
    }
  }

  function syncCurrentVersion() {
    if (!control) return;
    const id = currentVersion();
    control.dataset.version = id;
    const current = control.querySelector('[data-mobile-version-current]');
    if (current) current.textContent = VERSION_LABELS[id];
  }

  function hideHint() {
    if (!control) return;
    window.clearTimeout(hintTimer);
    control.dataset.hint = 'false';
  }

  function showHint() {
    if (!control || control.dataset.open === 'true') return;
    window.clearTimeout(hintTimer);
    control.dataset.hint = 'false';
    window.requestAnimationFrame(() => {
      if (!control || control.dataset.open === 'true') return;
      control.dataset.hint = 'true';
      hintTimer = window.setTimeout(() => {
        if (control) control.dataset.hint = 'false';
      }, HINT_DURATION);
    });
  }

  function setPopupOpen(open) {
    if (!control) return;
    const button = control.querySelector('[data-mobile-version-button]');
    const popup = control.querySelector('[data-mobile-version-popup]');
    if (open) hideHint();
    control.dataset.open = String(open);
    if (button) button.setAttribute('aria-expanded', String(open));
    if (popup) popup.hidden = !open;
    if (open) syncCurrentVersion();
  }

  function reopenPicker() {
    setPopupOpen(false);
    if (document.querySelector('[data-mobile-theme-picker]')) return;

    document.documentElement.dataset.mobileThemePickerManual = 'true';

    try {
      window.sessionStorage.removeItem(LAUNCH_KEY);
    } catch {
      // Re-executing the picker still gives the user another selection attempt.
    }

    const loader = document.querySelector('script[data-mobile-picker-script]');
    const src = loader?.src || 'mobile-theme-picker.js';
    const previous = document.querySelector('script[data-mobile-picker-reopen-run]');
    if (previous) previous.remove();

    const script = document.createElement('script');
    script.dataset.mobilePickerReopenRun = 'true';
    script.src = src;
    script.async = false;
    script.addEventListener('load', () => script.remove(), { once: true });
    script.addEventListener('error', () => {
      delete document.documentElement.dataset.mobileThemePickerManual;
      script.remove();
    }, { once: true });
    document.head.appendChild(script);
  }

  function installButton() {
    if (document.querySelector('[data-mobile-version-control]')) return;

    control = document.createElement('div');
    control.className = 'mobile-version-control';
    control.dataset.mobileVersionControl = '';
    control.dataset.open = 'false';
    control.dataset.hint = 'false';
    control.innerHTML = `
      <span class="mobile-version-hint" data-mobile-version-hint aria-hidden="true">Change REVIVE+ version</span>
      <div class="mobile-version-popup" data-mobile-version-popup hidden>
        <div class="mobile-version-popup-panel">
          <span class="mobile-version-popup-label">Current version</span>
          <strong data-mobile-version-current>${VERSION_LABELS[currentVersion()]}</strong>
          <button type="button" class="mobile-version-popup-action" data-mobile-version-change>
            <span>Change version</span><i aria-hidden="true">↗</i>
          </button>
        </div>
      </div>
      <button type="button" class="mobile-version-button" data-mobile-version-button aria-label="Version options" aria-expanded="false" aria-controls="mobile-version-popup">
        <span class="mobile-version-button-icon" aria-hidden="true">
          <i></i><i></i><i></i><i></i>
        </span>
      </button>
    `;

    const popup = control.querySelector('[data-mobile-version-popup]');
    if (popup) popup.id = 'mobile-version-popup';

    const button = control.querySelector('[data-mobile-version-button]');
    button?.addEventListener('click', (event) => {
      event.stopPropagation();
      setPopupOpen(control.dataset.open !== 'true');
    });

    control.querySelector('[data-mobile-version-change]')?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      reopenPicker();
    });

    document.addEventListener('pointerdown', (event) => {
      if (!control || control.dataset.open !== 'true' || control.contains(event.target)) return;
      setPopupOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !control || control.dataset.open !== 'true') return;
      setPopupOpen(false);
      control.querySelector('[data-mobile-version-button]')?.focus();
    });

    window.addEventListener('revive-member-set-change', () => {
      window.requestAnimationFrame(syncCurrentVersion);
      window.setTimeout(() => {
        syncCurrentVersion();
        showHint();
      }, 480);
    });

    document.body.appendChild(control);
    syncCurrentVersion();

    if (document.documentElement.dataset.themeLaunchPending !== 'true') {
      window.setTimeout(showHint, 650);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installButton, { once: true });
  } else {
    installButton();
  }
})();