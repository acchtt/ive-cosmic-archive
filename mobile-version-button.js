(() => {
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PAGE = document.documentElement.dataset.page;
  const PICKER_PAGES = new Set(['index', 'members']);
  const LAUNCH_KEY = 'ive-cosmic-revive-launch-seen-cover-cards-v4';

  if (!MOBILE_QUERY.matches || !PICKER_PAGES.has(PAGE)) return;

  function reopenPicker() {
    if (document.querySelector('[data-mobile-theme-picker]')) return;

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
    document.head.appendChild(script);
  }

  function installButton() {
    if (document.querySelector('[data-mobile-version-button]')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-version-button';
    button.dataset.mobileVersionButton = '';
    button.setAttribute('aria-label', 'Change REVIVE+ version');
    button.title = 'Change REVIVE+ version';
    button.innerHTML = `
      <span class="mobile-version-button-icon" aria-hidden="true">
        <i></i><i></i><i></i><i></i>
      </span>
    `;
    button.addEventListener('click', reopenPicker);
    document.body.appendChild(button);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installButton, { once: true });
  } else {
    installButton();
  }
})();