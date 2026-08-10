(() => {
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PAGE = document.documentElement.dataset.page;
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const ASSET_VERSION = 'mobile-spoilers-matched-press-v44';
  const STAGE_NAMES = ['GAEUL', 'AN YUJIN', 'REI', 'JANG WONYOUNG', 'LIZ', 'LEESEO'];

  if (!MOBILE_QUERY.matches || PAGE !== 'members') return;

  const VERSION_COPY = {
    bangers: 'Six member dossiers synchronized to the BANGERS concept-card set.',
    challengers: 'Six member dossiers synchronized to the CHALLENGERS concept-card set.',
    spoilers: 'Six member dossiers synchronized to the SPOILERS concept-card set.',
    'loved-ive': 'Six member dossiers synchronized to the LOVED IVE graduation-card set.'
  };

  function activeSet() {
    const root = document.documentElement.dataset.memberSet;
    if (VERSION_COPY[root]) return root;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return VERSION_COPY[stored] ? stored : 'bangers';
    } catch {
      return 'bangers';
    }
  }

  function syncStageNames() {
    document.querySelectorAll('[data-dossier-index]').forEach((button, index) => {
      const name = button.querySelector('strong');
      if (name && STAGE_NAMES[index] && name.textContent !== STAGE_NAMES[index]) {
        name.textContent = STAGE_NAMES[index];
      }
    });

    const panel = document.querySelector('[data-member-profile]');
    const parsed = Number(panel?.dataset.activeMember ?? 0);
    const index = Number.isInteger(parsed) && parsed >= 0 && parsed < STAGE_NAMES.length ? parsed : 0;
    const profileName = document.querySelector('[data-profile-name]');
    if (profileName && profileName.textContent !== STAGE_NAMES[index]) {
      profileName.textContent = STAGE_NAMES[index];
    }
  }

  function syncVersionCopy() {
    const set = activeSet();
    const description = document.querySelector('.page-section > .section-heading > p');
    if (description && description.textContent !== VERSION_COPY[set]) {
      description.textContent = VERSION_COPY[set];
    }
    document.documentElement.dataset.mobileMembersVersion = set;
    document.documentElement.dataset.mobileMembersUi = ASSET_VERSION;
  }

  function syncAll() {
    syncStageNames();
    syncVersionCopy();
  }

  function install() {
    syncAll();

    document.querySelector('[data-dossier-list]')?.addEventListener('click', (event) => {
      if (!event.target.closest('[data-dossier-index]')) return;
      window.requestAnimationFrame(syncStageNames);
    });

    window.addEventListener('revive-member-set-change', () => {
      window.requestAnimationFrame(syncAll);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();