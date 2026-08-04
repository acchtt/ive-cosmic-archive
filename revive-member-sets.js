(() => {
  const page = document.documentElement.dataset.page;
  if (page !== 'index' && page !== 'members') return;

  const MEMBER_NAMES = ['Gaeul', 'Yujin', 'Rei', 'Wonyoung', 'Liz', 'Leeseo'];
  const STORAGE_KEY = 'ive-cosmic-revive-member-set';

  const SETS = {
    bangers: {
      label: 'BANGERS',
      description: 'High-impact color, styling, and performance energy.',
      portraits: [
        'https://i.imgur.com/WuNitxa.jpg',
        'https://i.imgur.com/bx3bimk.jpg',
        'https://i.imgur.com/4UCnYQC.jpg',
        'https://i.imgur.com/QJEOoxJ.jpg',
        'https://i.imgur.com/X9GMWnT.jpg',
        'https://i.imgur.com/dCKfure.jpg'
      ]
    },
    challengers: {
      label: 'CHALLENGERS',
      description: 'Sharper silhouettes and a confident competitive coordinate.',
      portraits: [
        'https://preview.redd.it/260201-ive-the-2nd-album-revive-concept-photo-1-gaeul-rei-v0-9pbetg8u3wgg1.jpg?auto=webp&crop=smart&s=261987b04f07d9e67a6e085dffceb56f0bce13f8&width=640',
        'https://preview.redd.it/260203-ive-the-2nd-album-revive-concept-photo-2-yujin-gaeul-v0-sl3c9mxfjahg1.jpg?auto=webp&crop=smart&s=091ebbebb1b4169b927c1a90ed4863413587278b&width=640',
        'https://preview.redd.it/260201-ive-the-2nd-album-revive-concept-photo-1-gaeul-rei-v0-cmr7ai8u3wgg1.jpg?auto=webp&crop=smart&s=24038a8a9426913116d065c2197d1c9e62271ad8&width=640',
        'https://preview.redd.it/260203-ive-the-2nd-album-revive-concept-photo-2-wonyoung-v0-aaiju3fdeahg1.jpg?auto=webp&crop=smart&s=e75ae8520946d7405e4ff06f49cb876f07623d51&width=640',
        'https://preview.redd.it/260201-ive-the-2nd-album-revive-concept-photo-1-gaeul-rei-v0-vznhvh8u3wgg1.jpg?auto=webp&crop=smart&s=cf0f095e3cf415934d5371852186074e50158389&width=640',
        'https://preview.redd.it/260201-ive-the-2nd-album-revive-concept-photo-1-gaeul-rei-v0-g12qli8u3wgg1.jpg?auto=webp&crop=smart&s=42282195c9321f4e094df619abb79ab30b40defb&width=640'
      ]
    },
    spoilers: {
      label: 'SPOILERS',
      description: 'Lavender press-room styling with polished editorial tension.',
      portraits: [
        'https://preview.redd.it/ive-the-2nd-album-revive-concept-photos-v0-z0aaaboklifg1.jpg?auto=webp&crop=smart&s=9f4bd76d7e4fe49ae05c9ebd1cd4545ddace0a4d&width=640',
        'https://preview.redd.it/ive-the-2nd-album-revive-concept-photos-v0-bo3j99sklifg1.jpg?auto=webp&crop=smart&s=81790309817a735ff4754bb8a5e064ac1f99b769&width=640',
        'https://preview.redd.it/ive-the-2nd-album-revive-concept-photos-v0-tnyksxtklifg1.jpg?auto=webp&crop=smart&s=e66bddba6c850953253b4257fd0d27bc4ce70d98&width=640',
        'https://preview.redd.it/ive-the-2nd-album-revive-concept-photos-v0-uy5csgvklifg1.jpg?auto=webp&crop=smart&s=f08d98cf87b0b75d6ca3b64bc99f2345e622da5b&width=640',
        'https://preview.redd.it/ive-the-2nd-album-revive-concept-photos-v0-s5hrsixklifg1.jpg?auto=webp&crop=smart&s=64e99c20ea1b730a46f7d7b3c26f9dc1169365d3&width=640',
        'https://preview.redd.it/ive-the-2nd-album-revive-concept-photos-v0-aatv6czklifg1.jpg?auto=webp&crop=smart&s=eb90de34790e775126cab930539799168c81fb0a&width=640'
      ]
    },
    'loved-ive': {
      label: 'LOVED IVE',
      description: 'A softer graduation-inspired set built around warmth and connection.',
      portraits: [
        'https://preview.redd.it/ive-the-2nd-album-revive-graduation-concept-photos-v0-ixebybt9c2lg1.jpg?auto=webp&crop=smart&s=e6f9d55ee1353bd1f730fbf892249ba5e0901576&width=640',
        'https://preview.redd.it/ive-the-2nd-album-revive-graduation-concept-photos-v0-kaphjbnac2lg1.jpg?auto=webp&crop=smart&s=38cf38601f51ee45a6b8aef7078c38bfe8adac8f&width=640',
        'https://preview.redd.it/ive-the-2nd-album-revive-graduation-concept-photos-v0-gi5cnonac2lg1.jpg?auto=webp&crop=smart&s=fee771799979dd5e7d5abdf3631423ff36c8508e&width=640',
        'https://preview.redd.it/ive-the-2nd-album-revive-graduation-concept-photos-v0-e1w72gsac2lg1.jpg?auto=webp&crop=smart&s=a96bc42b14b1a34a8001e54f26e355e7f53a2319&width=640',
        'https://preview.redd.it/ive-the-2nd-album-revive-graduation-concept-photos-v0-jxkapl0bc2lg1.jpg?auto=webp&crop=smart&s=bf98804257f311ca40be595b9e982a3f5539c755&width=640',
        'https://preview.redd.it/ive-the-2nd-album-revive-graduation-concept-photos-v0-fjg2cr2bc2lg1.jpg?auto=webp&crop=smart&s=c8d379aeb2085e50ba54538a62bc24d147aaa82d&width=640'
      ]
    }
  };

  const SET_ORDER = ['bangers', 'challengers', 'spoilers', 'loved-ive'];
  const resolvedPortraits = new Map();
  let activeSetId = readStoredSet();
  let selectionVersion = 0;

  function readStoredSet() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return SETS[stored] ? stored : 'bangers';
    } catch {
      return 'bangers';
    }
  }

  function storeSet(setId) {
    try {
      window.localStorage.setItem(STORAGE_KEY, setId);
    } catch {
      // The selector still works when storage is unavailable.
    }
  }

  function cssUrl(url) {
    return `url("${String(url).replaceAll('"', '\\"')}")`;
  }

  function ensureStylesheet() {
    if (document.querySelector('link[href="revive-member-sets.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'revive-member-sets.css';
    document.head.appendChild(link);
  }

  function createSwitcher() {
    const existing = document.querySelector('[data-member-set-switcher]');
    if (existing) return existing;

    const grid = document.querySelector('[data-member-grid]');
    const dossierLayout = document.querySelector('.dossier-layout');
    const anchor = grid || dossierLayout;
    if (!anchor) return null;

    const switcher = document.createElement('div');
    switcher.className = 'member-set-switcher reveal visible';
    switcher.dataset.memberSetSwitcher = '';
    switcher.innerHTML = `
      <div class="member-set-switcher-copy">
        <span>REVIVE+ card archive</span>
        <strong data-member-set-title>${SETS[activeSetId].label}</strong>
      </div>
      <div class="member-set-options" role="group" aria-label="Choose a REVIVE+ member-card set">
        ${SET_ORDER.map((setId) => `
          <button type="button" data-member-set="${setId}" aria-pressed="${setId === activeSetId}">
            ${SETS[setId].label}
          </button>`).join('')}
      </div>
      <p data-member-set-description>${SETS[activeSetId].description}</p>`;

    anchor.insertAdjacentElement('beforebegin', switcher);
    switcher.addEventListener('click', (event) => {
      const button = event.target.closest('[data-member-set]');
      if (!button || !SETS[button.dataset.memberSet]) return;
      setActiveSet(button.dataset.memberSet);
    });

    return switcher;
  }

  function updateSwitcher() {
    const set = SETS[activeSetId];
    document.documentElement.dataset.memberSet = activeSetId;

    document.querySelectorAll('[data-member-set]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.memberSet === activeSetId));
    });

    const title = document.querySelector('[data-member-set-title]');
    const description = document.querySelector('[data-member-set-description]');
    if (title) title.textContent = set.label;
    if (description) description.textContent = set.description;
  }

  function updateMembersPageCopy() {
    if (page !== 'members') return;
    const set = SETS[activeSetId];
    const headingCopy = document.querySelector('.page-section .section-heading > p');
    const credit = document.querySelector('.photo-credit');

    if (headingCopy) {
      headingCopy.innerHTML = `Browse all four standard <em>REVIVE+</em> concept-card sets. Current coordinate: <strong>${set.label}</strong>. Image rights remain with Starship Entertainment and the original campaign sources.`;
    }

    if (credit) {
      credit.innerHTML = `REVIVE+ “${set.label}” concept photos · <a href="https://x.com/IVEstarship" target="_blank" rel="noreferrer">IVE Official</a> · <a href="https://www.starship-ent.com/musician/ive" target="_blank" rel="noreferrer">Starship Entertainment</a>`;
    }
  }

  function preloadPortrait(url, fallbackUrl) {
    if (resolvedPortraits.has(url)) return Promise.resolve(resolvedPortraits.get(url));

    return new Promise((resolve) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        resolvedPortraits.set(url, url);
        resolve(url);
      };
      image.onerror = () => {
        resolvedPortraits.set(url, fallbackUrl);
        resolve(fallbackUrl);
      };
      image.src = url;
    });
  }

  function applyPortraitToCard(index, url) {
    const art = document.querySelectorAll('[data-member-grid] .member-card .member-art')[index];
    if (!art) return;
    art.style.setProperty('--member-portrait', cssUrl(url));
    art.setAttribute('role', 'img');
    art.setAttribute('aria-label', `${MEMBER_NAMES[index]} — ${SETS[activeSetId].label} concept card`);
  }

  function activeMemberIndex() {
    const panel = document.querySelector('[data-member-profile]');
    const parsed = Number(panel?.dataset.activeMember ?? 0);
    return Number.isInteger(parsed) && parsed >= 0 && parsed < MEMBER_NAMES.length ? parsed : 0;
  }

  function applyPortraitToDossier(index, url) {
    const visual = document.querySelector('[data-profile-visual]');
    if (!visual) return;
    visual.style.setProperty('--dossier-portrait', cssUrl(url));
  }

  function applyCurrentDossierPortrait() {
    const index = activeMemberIndex();
    const requested = SETS[activeSetId].portraits[index];
    const fallback = SETS.bangers.portraits[index];
    const version = selectionVersion;

    applyPortraitToDossier(index, requested);
    preloadPortrait(requested, fallback).then((resolved) => {
      if (version !== selectionVersion || index !== activeMemberIndex()) return;
      applyPortraitToDossier(index, resolved);
    });
  }

  function applyCurrentSet() {
    const set = SETS[activeSetId];
    const version = selectionVersion;

    set.portraits.forEach((requested, index) => {
      const fallback = SETS.bangers.portraits[index];
      applyPortraitToCard(index, requested);
      preloadPortrait(requested, fallback).then((resolved) => {
        if (version !== selectionVersion) return;
        applyPortraitToCard(index, resolved);
      });
    });

    applyCurrentDossierPortrait();
    updateSwitcher();
    updateMembersPageCopy();
  }

  function setActiveSet(setId) {
    if (!SETS[setId]) return;
    activeSetId = setId;
    selectionVersion += 1;
    storeSet(setId);
    applyCurrentSet();
    window.dispatchEvent(new CustomEvent('revive-member-set-change', {
      detail: { id: setId, label: SETS[setId].label }
    }));
  }

  function observeRenderedCards() {
    const grid = document.querySelector('[data-member-grid]');
    if (!grid) return;

    const observer = new MutationObserver(() => applyCurrentSet());
    observer.observe(grid, { childList: true });
  }

  function observeDossierSelection() {
    const panel = document.querySelector('[data-member-profile]');
    if (!panel) return;

    const observer = new MutationObserver(applyCurrentDossierPortrait);
    observer.observe(panel, {
      attributes: true,
      attributeFilter: ['data-active-member']
    });
  }

  function initialize() {
    ensureStylesheet();
    createSwitcher();
    observeRenderedCards();
    observeDossierSelection();
    applyCurrentSet();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
