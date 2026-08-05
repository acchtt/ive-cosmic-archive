(() => {
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const CONFIRMATION_STYLESHEET = 'mobile-theme-confirmation.css';
  const MOBILE_PICKER = window.matchMedia('(max-width: 640px)');
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
  const pickerPages = new Set(['index', 'members']);

  function storedTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return valid.has(stored) ? stored : 'bangers';
    } catch {
      return 'bangers';
    }
  }

  function currentTheme() {
    const current = document.documentElement.dataset.memberSet;
    return valid.has(current) ? current : storedTheme();
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
    const switcher = document.querySelector('[data-member-set-switcher]');
    const description = document.querySelector('[data-member-set-description]');
    if (description && !switcher?.dataset.confirmationPending) {
      description.textContent = theme.description;
    }

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

  function ensureConfirmationStyles() {
    if (!pickerPages.has(document.documentElement.dataset.page)) return;
    if (document.querySelector(`link[href="${CONFIRMATION_STYLESHEET}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CONFIRMATION_STYLESHEET;
    document.head.appendChild(link);
  }

  function setPendingTheme(switcher, id) {
    if (!switcher || !valid.has(id)) return;
    switcher.dataset.confirmationPending = id;

    switcher.querySelectorAll('.member-set-options [data-member-set]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.memberSet === id));
    });

    const description = switcher.querySelector('[data-member-set-description]');
    const label = switcher.querySelector('[data-member-set-confirm-label]');
    const confirm = switcher.querySelector('[data-member-set-confirm]');
    if (description) description.textContent = themes[id].description;
    if (label) label.textContent = `Selected: ${id === 'loved-ive' ? 'LOVED IVE' : id.toUpperCase()}`;
    if (confirm) {
      const edition = id === 'loved-ive' ? 'LOVED IVE' : id.toUpperCase();
      confirm.textContent = `Use ${edition}`;
      confirm.setAttribute('aria-label', `Confirm the ${edition} archive theme`);
    }
  }

  function clearPendingTheme(switcher, id = currentTheme()) {
    if (!switcher) return;
    delete switcher.dataset.confirmationPending;
    setPendingTheme(switcher, id);
    delete switcher.dataset.confirmationPending;
  }

  function installConfirmation() {
    if (!pickerPages.has(document.documentElement.dataset.page)) return false;
    const switcher = document.querySelector('[data-member-set-switcher]');
    if (!switcher) return false;
    if (switcher.dataset.confirmationReady === 'true') return true;

    const options = switcher.querySelector('.member-set-options');
    if (!options) return false;

    const row = document.createElement('div');
    row.className = 'member-set-confirm-row';
    row.innerHTML = `
      <span data-member-set-confirm-label>Selected theme</span>
      <button type="button" class="member-set-confirm" data-member-set-confirm>Use theme</button>
    `;
    options.insertAdjacentElement('afterend', row);

    let committing = false;

    switcher.addEventListener('click', (event) => {
      if (!MOBILE_PICKER.matches) return;

      const confirm = event.target.closest('[data-member-set-confirm]');
      if (confirm) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const id = switcher.dataset.confirmationPending || currentTheme();
        const option = switcher.querySelector(`.member-set-options [data-member-set="${id}"]`);
        if (!option) return;

        committing = true;
        delete switcher.dataset.confirmationPending;
        option.click();
        committing = false;
        window.setTimeout(() => clearPendingTheme(switcher, currentTheme()), 0);
        return;
      }

      const option = event.target.closest('.member-set-options [data-member-set]');
      if (option && !committing) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setPendingTheme(switcher, option.dataset.memberSet);
        return;
      }

      if (event.target.closest('[data-member-set-toggle], [data-member-set-close]')) {
        clearPendingTheme(switcher, currentTheme());
      }
    }, true);

    document.addEventListener('pointerdown', (event) => {
      if (!MOBILE_PICKER.matches || !switcher.dataset.confirmationPending) return;
      if (!switcher.contains(event.target)) {
        window.setTimeout(() => clearPendingTheme(switcher, currentTheme()), 0);
      }
    }, true);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && switcher.dataset.confirmationPending) {
        clearPendingTheme(switcher, currentTheme());
      }
    });

    const handleViewportChange = (event) => {
      if (!event.matches) clearPendingTheme(switcher, currentTheme());
    };
    if (typeof MOBILE_PICKER.addEventListener === 'function') {
      MOBILE_PICKER.addEventListener('change', handleViewportChange);
    } else if (typeof MOBILE_PICKER.addListener === 'function') {
      MOBILE_PICKER.addListener(handleViewportChange);
    }

    switcher.dataset.confirmationReady = 'true';
    clearPendingTheme(switcher, currentTheme());
    return true;
  }

  function watchForPicker() {
    if (!pickerPages.has(document.documentElement.dataset.page)) return;
    ensureConfirmationStyles();
    if (installConfirmation()) return;

    const observer = new MutationObserver(() => {
      if (installConfirmation()) observer.disconnect();
    });

    const begin = () => {
      if (installConfirmation()) return;
      observer.observe(document.body, { childList: true, subtree: true });
      [0, 80, 240, 700].forEach((delay) => window.setTimeout(installConfirmation, delay));
    };

    if (document.body) begin();
    else document.addEventListener('DOMContentLoaded', begin, { once: true });
  }

  ensureConfirmationStyles();
  apply();
  watchForPicker();

  window.addEventListener('revive-member-set-change', (event) => {
    const id = event.detail?.id;
    requestAnimationFrame(() => apply(id));
    setTimeout(() => apply(id), 80);
  });

  const observer = new MutationObserver(() => {
    const id = document.documentElement.dataset.memberSet;
    if (valid.has(id)) {
      syncMeta(id);
      if (document.body) syncCopy(id);
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-member-set'] });

  document.addEventListener('DOMContentLoaded', () => {
    const id = apply(document.documentElement.dataset.memberSet || storedTheme());
    [0, 180, 650].forEach((delay) => setTimeout(() => syncCopy(id), delay));
  }, { once: true });
})();
