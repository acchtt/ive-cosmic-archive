(() => {
  const MOBILE_QUERY = window.matchMedia('(max-width: 640px)');
  const PAGE = document.documentElement.dataset.page;
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const ASSET_VERSION = 'mobile-members-polish-v32';
  const STAGE_NAMES = ['GAEUL', 'AN YUJIN', 'REI', 'JANG WONYOUNG', 'LIZ', 'LEESEO'];

  if (!MOBILE_QUERY.matches || PAGE !== 'members') return;

  const VERSION_COPY = {
    bangers: {
      label: 'BANGERS',
      description: 'Six member dossiers synchronized to the BANGERS concept-photo set.',
      credit: 'REVIVE+ “BANGERS” concept photos'
    },
    challengers: {
      label: 'CHALLENGERS',
      description: 'Six member dossiers synchronized to the CHALLENGERS concept-photo set.',
      credit: 'REVIVE+ “CHALLENGERS” concept photos'
    },
    spoilers: {
      label: 'SPOILERS',
      description: 'Six member dossiers synchronized to the SPOILERS concept-photo set.',
      credit: 'REVIVE+ “SPOILERS” concept photos'
    },
    'loved-ive': {
      label: 'LOVED IVE',
      description: 'Six member dossiers synchronized to the LOVED IVE concept-photo set.',
      credit: 'REVIVE+ “LOVED IVE” concept photos'
    }
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

  function moveMemberStylesLast() {
    const redesign = document.querySelector('link[data-mobile-picker-asset="mobile-members-redesign.css"]');
    const polish = document.querySelector('link[data-mobile-picker-asset="mobile-members-polish-v32.css"]');
    if (redesign?.parentNode === document.head) document.head.appendChild(redesign);
    if (polish?.parentNode === document.head) document.head.appendChild(polish);
  }

  function syncHero() {
    const title = document.querySelector('.page-hero-members #page-title');
    if (title && title.dataset.mobileTitle !== 'true') {
      title.innerHTML = 'Six signals.<br /><span>One constellation.</span>';
      title.dataset.mobileTitle = 'true';
    }

    const intro = document.querySelector('.page-hero-members .page-hero-copy > p:last-child');
    const mobileIntro = 'Choose a member to open a version-synchronized REVIVE+ dossier.';
    if (intro && intro.textContent !== mobileIntro) intro.textContent = mobileIntro;
  }

  function syncStageNames() {
    document.querySelectorAll('[data-dossier-index]').forEach((button, index) => {
      const name = button.querySelector('strong');
      const desired = STAGE_NAMES[index];
      if (name && desired && name.textContent !== desired) name.textContent = desired;
    });

    const panel = document.querySelector('[data-member-profile]');
    const parsed = Number(panel?.dataset.activeMember ?? 0);
    const index = Number.isInteger(parsed) && parsed >= 0 && parsed < STAGE_NAMES.length ? parsed : 0;
    const profileName = document.querySelector('[data-profile-name]');
    const desired = STAGE_NAMES[index];
    if (profileName && profileName.textContent !== desired) profileName.textContent = desired;
  }

  function syncVersionCopy() {
    const set = activeSet();
    const copy = VERSION_COPY[set];
    const heading = document.querySelector('.page-section > .section-heading');
    const description = heading?.querySelector(':scope > p');
    if (description && description.textContent !== copy.description) description.textContent = copy.description;

    const credit = document.querySelector('.photo-credit');
    if (credit && credit.dataset.mobileCreditSet !== set) {
      const official = credit.querySelector('a[href*="x.com/IVEstarship"]')?.outerHTML
        || '<a href="https://x.com/IVEstarship" target="_blank" rel="noreferrer">IVE Official</a>';
      const starship = credit.querySelector('a[href*="starship-ent.com"]')?.outerHTML
        || '<a href="https://www.starship-ent.com/musician/ive" target="_blank" rel="noreferrer">Starship Entertainment</a>';
      credit.innerHTML = `${copy.credit} · ${official} · ${starship}`;
      credit.dataset.mobileCreditSet = set;
    }

    document.documentElement.dataset.mobileMembersVersion = copy.label.toLowerCase().replaceAll(' ', '-');
    document.documentElement.dataset.mobileMembersUi = ASSET_VERSION;
  }

  function syncAll() {
    moveMemberStylesLast();
    syncHero();
    syncStageNames();
    syncVersionCopy();
  }

  function scheduleSync() {
    [0, 40, 120, 320, 900].forEach((delay) => window.setTimeout(syncAll, delay));
  }

  function install() {
    syncAll();

    const panel = document.querySelector('[data-member-profile]');
    if (panel) {
      new MutationObserver(scheduleSync).observe(panel, {
        attributes: true,
        attributeFilter: ['data-active-member']
      });
    }

    const list = document.querySelector('[data-dossier-list]');
    if (list) new MutationObserver(scheduleSync).observe(list, { childList: true, subtree: true });

    new MutationObserver(scheduleSync).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-member-set']
    });

    window.addEventListener('revive-member-set-change', scheduleSync);
    scheduleSync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
