(() => {
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const LAUNCH_KEY = 'ive-cosmic-revive-launch-seen-cover-cards-v4';
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PICKER_PAGES = new Set(['index', 'members']);
  const MOBILE_ASSET_VERSION = 'mobile-bang-bang-title-v23';

  const themes = {
    bangers: {
      color: '#f20808',
      description: 'Signal red, icy cyan, acid lime, and white pulled from the BANGERS cover.',
      tags: ['Signal red', 'Icy cyan', 'Acid lime', 'Whiteout']
    },
    challengers: {
      color: '#b62d24',
      description: 'Ivory tailoring, oxide red, concrete gray, and open-sky blue from the CHALLENGERS cover and concept set.',
      tags: ['Ivory', 'Oxide red', 'Concrete', 'Sky blue']
    },
    spoilers: {
      color: '#2f70b5',
      description: 'Press blue, powder cyan, cool gray, and acid yellow from the SPOILERS cover.',
      tags: ['Press blue', 'Powder cyan', 'Cool gray', 'Acid yellow']
    },
    'loved-ive': {
      color: '#6fa6c8',
      description: 'Deep navy, studio blue, warm gray, and uniform cream from the LOVED IVE cover.',
      tags: ['Deep navy', 'Studio blue', 'Warm gray', 'Uniform cream']
    }
  };

  const valid = new Set(Object.keys(themes));

  function storedTheme() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return valid.has(stored) ? stored : 'bangers';
    } catch {
      return 'bangers';
    }
  }

  function mobileLaunchRequired() {
    try {
      return window.sessionStorage.getItem(LAUNCH_KEY) !== 'true'
        || !valid.has(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      return true;
    }
  }

  function installMobileLaunchGuard() {
    const page = document.documentElement.dataset.page;
    if (!MOBILE_QUERY.matches || !PICKER_PAGES.has(page)) return;

    if (mobileLaunchRequired()) {
      document.documentElement.dataset.themeLaunchPending = 'true';
    }

    if (document.querySelector('style[data-mobile-theme-launch-guard]')) return;

    const style = document.createElement('style');
    style.dataset.mobileThemeLaunchGuard = 'true';
    style.textContent = `
      @media (max-width: 640px) {
        html[data-theme-launch-pending="true"],
        html[data-theme-launch-pending="true"] body {
          min-height: 100%;
          background: #08080a !important;
        }

        html[data-theme-launch-pending="true"] body > :not(.mobile-theme-picker) {
          visibility: hidden !important;
        }

        html[data-theme-launch-pending="true"] body::before {
          content: "REVIVE+";
          position: fixed;
          inset: 0;
          z-index: 100000;
          display: grid;
          place-items: center;
          color: #f8f4f5;
          background: #08080a;
          font-family: Arial, Helvetica, sans-serif;
          font-size: clamp(1.35rem, 7vw, 2rem);
          font-weight: 900;
          letter-spacing: .08em;
        }

        html[data-theme-launch-pending="true"] body::after {
          content: "Preparing your archive theme";
          position: fixed;
          left: 0;
          right: 0;
          bottom: max(28px, env(safe-area-inset-bottom));
          z-index: 100001;
          color: #7e787f;
          font-family: Arial, Helvetica, sans-serif;
          font-size: .58rem;
          font-weight: 750;
          letter-spacing: .14em;
          text-align: center;
          text-transform: uppercase;
        }

        html[data-theme-launch-pending="true"][data-mobile-theme-picker-open="true"][data-mobile-theme-picker-ready="true"] body::before,
        html[data-theme-launch-pending="true"][data-mobile-theme-picker-open="true"][data-mobile-theme-picker-ready="true"] body::after {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function syncMeta(id) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = themes[id].color;
  }

  function syncCopy(id) {
    const theme = themes[id];
    const description = document.querySelector('[data-member-set-description]');
    if (description) description.textContent = theme.description;

    document.querySelectorAll('.revive-campaign-tags span').forEach((node, index) => {
      if (theme.tags[index]) node.textContent = theme.tags[index];
    });
  }

  function apply(id = storedTheme()) {
    const resolved = valid.has(id) ? id : 'bangers';
    document.documentElement.dataset.memberSet = resolved;
    syncMeta(resolved);
    if (document.body) syncCopy(resolved);
    return resolved;
  }

  function appendStylesheet(path) {
    if (document.querySelector(`link[data-mobile-picker-asset="${path}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.mobilePickerAsset = path;
    link.href = `${path}?v=${MOBILE_ASSET_VERSION}`;
    document.head.appendChild(link);
  }

  function appendScript(path, marker) {
    if (document.querySelector(`script[${marker}]`)) return;
    const script = document.createElement('script');
    script.setAttribute(marker, 'true');
    script.src = `${path}?v=${MOBILE_ASSET_VERSION}`;
    script.async = false;
    document.head.appendChild(script);
  }

  function purgeLegacyMobileControls() {
    const page = document.documentElement.dataset.page;
    if (!MOBILE_QUERY.matches || !PICKER_PAGES.has(page) || !document.body) return;

    document.querySelectorAll([
      '.mobile-theme-dock',
      '.mobile-theme-picker-toggle',
      '[data-mobile-theme-open]',
      '[data-mobile-theme-dock]',
      '[data-theme-dock]'
    ].join(',')).forEach((node) => {
      if (!node.closest('.mobile-theme-picker')) node.remove();
    });

    const legacyLabels = new Set(['REVIVE+ EDITION', 'REVIVE+ VERSION']);
    document.querySelectorAll('button, a, [role="button"], div').forEach((node) => {
      const label = node.textContent?.replace(/\s+/g, ' ').trim().toUpperCase();
      if (!legacyLabels.has(label)) return;
      if (window.getComputedStyle(node).position === 'fixed') node.remove();
    });

    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
  }

  function installLegacyMobileControlPurge() {
    const page = document.documentElement.dataset.page;
    if (!MOBILE_QUERY.matches || !PICKER_PAGES.has(page)) return;

    const start = () => {
      purgeLegacyMobileControls();
      const observer = new MutationObserver(purgeLegacyMobileControls);
      observer.observe(document.body, { childList: true, subtree: true });
      [250, 900, 2400, 5000].forEach((delay) => {
        window.setTimeout(purgeLegacyMobileControls, delay);
      });
      window.setTimeout(() => {
        purgeLegacyMobileControls();
        observer.disconnect();
      }, 9000);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }
  }

  function loadMobileAssets() {
    const page = document.documentElement.dataset.page;
    if (!MOBILE_QUERY.matches || !PICKER_PAGES.has(page)) return;

    appendStylesheet('mobile-page-shell-fix.css');
    if (page === 'index') appendStylesheet('mobile-home-campaign-v10.css');
    appendStylesheet('mobile-theme-picker-cover-grid.css');
    appendStylesheet('mobile-version-button.css');

    if (!document.querySelector('script[data-mobile-picker-script]')) {
      const picker = document.createElement('script');
      picker.dataset.mobilePickerScript = 'true';
      picker.src = `mobile-theme-picker.js?v=${MOBILE_ASSET_VERSION}`;
      picker.async = false;
      document.head.appendChild(picker);
    }

    appendScript('mobile-version-button.js', 'data-mobile-version-button-script');
    appendScript('mobile-loved-ive-photo-fix.js', 'data-mobile-loved-ive-photo-fix-script');
  }

  installMobileLaunchGuard();
  loadMobileAssets();
  installLegacyMobileControlPurge();
  apply();

  window.addEventListener('revive-member-set-change', (event) => {
    const id = event.detail?.id;
    window.requestAnimationFrame(() => {
      apply(id);
      purgeLegacyMobileControls();
    });
    window.setTimeout(() => {
      apply(id);
      purgeLegacyMobileControls();
    }, 80);
  });

  const observer = new MutationObserver(() => {
    const id = document.documentElement.dataset.memberSet;
    if (!valid.has(id)) return;
    syncMeta(id);
    if (document.body) syncCopy(id);
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-member-set']
  });

  document.addEventListener('DOMContentLoaded', () => {
    const id = apply(document.documentElement.dataset.memberSet || storedTheme());
    purgeLegacyMobileControls();
    [0, 180, 650].forEach((delay) => window.setTimeout(() => syncCopy(id), delay));
  }, { once: true });
})();