(() => {
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PICKER_PAGES = new Set(['index', 'members']);
  const MOBILE_ASSET_VERSION = 'd753358';

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

  function loadMobilePicker() {
    const page = document.documentElement.dataset.page;
    if (!MOBILE_QUERY.matches || !PICKER_PAGES.has(page)) return;

    appendStylesheet('mobile-theme-picker.css');
    appendStylesheet('mobile-theme-picker-input.css');
    appendStylesheet('mobile-theme-picker-luxe.css');

    if (!document.querySelector('script[data-mobile-picker-script]')) {
      const script = document.createElement('script');
      script.dataset.mobilePickerScript = 'true';
      script.src = `mobile-theme-picker.js?v=${MOBILE_ASSET_VERSION}`;
      script.async = false;
      document.head.appendChild(script);
    }
  }

  loadMobilePicker();
  apply();

  window.addEventListener('revive-member-set-change', (event) => {
    const id = event.detail?.id;
    window.requestAnimationFrame(() => apply(id));
    window.setTimeout(() => apply(id), 80);
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
    [0, 180, 650].forEach((delay) => window.setTimeout(() => syncCopy(id), delay));
  }, { once: true });
})();