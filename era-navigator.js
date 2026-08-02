(() => {
  const releases = [
    {
      title: 'ELEVEN', date: '2021.12.01', year: '2021', type: '1st Single Album', titleTrack: 'ELEVEN',
      description: 'The opening release of IVE’s Korean discography and the first statement of the group’s confident pop identity.',
      appleId: '1597404250', query: 'IVE ELEVEN', official: 'https://www.starship-ent.com/musician/ive'
    },
    {
      title: 'LOVE DIVE', date: '2022.04.05', year: '2022', type: '2nd Single Album', titleTrack: 'LOVE DIVE',
      description: 'A darker and more hypnotic second chapter built around self-assurance, elegance, and one of IVE’s defining title tracks.',
      appleId: '1616804151', query: 'IVE LOVE DIVE', official: 'https://www.starship-ent.com/musician/ive'
    },
    {
      title: 'After LIKE', date: '2022.08.22', year: '2022', type: '3rd Single Album', titleTrack: 'After LIKE',
      description: 'A bright disco-pop expansion that turned the group’s direct confidence into a celebratory summer-scale release.',
      appleId: '1639416895', query: 'IVE After LIKE', official: 'https://www.starship-ent.com/musician/ive'
    },
    {
      title: "I've IVE", date: '2023.04.10', year: '2023', type: '1st Full Album', titleTrack: 'I AM',
      description: 'IVE’s first full-length album broadens the group’s sound across eleven tracks while keeping self-belief at its center.',
      appleId: '1680047093', query: "IVE I've IVE", official: 'https://www.starship-ent.com/musician/ive'
    },
    {
      title: "I'VE MINE", date: '2023.10.13', year: '2023', type: '1st EP', titleTrack: 'Baddie · Off The Record · Either Way',
      description: 'A three-title-track EP exploring how identity changes depending on perspective, intimacy, and outside judgment.',
      appleId: '1709569466', query: "IVE I'VE MINE", official: 'https://www.starship-ent.com/musician/ive'
    },
    {
      title: 'IVE SWITCH', date: '2024.04.29', year: '2024', type: '2nd EP', titleTrack: 'HEYA · Accendio',
      description: 'A vivid switch in visual language that pairs Korean-inspired fantasy with a sharper, spell-like pop atmosphere.',
      query: 'IVE SWITCH EP', official: 'https://www.starship-ent.com/musician/ive'
    },
    {
      title: 'IVE EMPATHY', date: '2025.02.03', year: '2025', type: '3rd EP', titleTrack: 'REBEL HEART · ATTITUDE',
      description: 'An EP that extends IVE’s confidence outward, emphasizing solidarity, emotional connection, and shared perspective.',
      query: 'IVE EMPATHY EP', official: 'https://www.starship-ent.com/musician/ive'
    },
    {
      title: 'IVE SECRET', date: '2025.08.25', year: '2025', type: '4th EP', titleTrack: 'XOXZ',
      description: 'A secretive, high-gloss chapter that brings a more coded and theatrical edge to the group’s established identity.',
      query: 'IVE SECRET EP', official: 'https://www.starship-ent.com/musician/ive'
    },
    {
      title: 'REVIVE+', date: '2026.02.23', year: '2026', type: '2nd Full Album', titleTrack: 'BLACKHOLE',
      description: 'A 12-track re-ignition that moves from the confidence of “I” toward the connection of “we,” including six member solo tracks.',
      appleId: '1873882195', query: 'IVE REVIVE+', official: 'https://ive-official.com/disco/revive/'
    }
  ];

  const artworkCache = new Map();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function fallbackCover(release) {
    const safeTitle = release.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c96cff"/><stop offset=".52" stop-color="#ff75bd"/><stop offset="1" stop-color="#120b1c"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><circle cx="610" cy="180" r="240" fill="none" stroke="rgba(255,255,255,.24)"/><text x="70" y="650" fill="white" font-family="Arial,sans-serif" font-size="76" font-weight="800">${safeTitle}</text><text x="74" y="708" fill="rgba(255,255,255,.72)" font-family="Arial,sans-serif" font-size="24" letter-spacing="8">IVE · ${release.year}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  async function fetchArtwork(release) {
    if (artworkCache.has(release.title)) return artworkCache.get(release.title);
    const endpoint = release.appleId
      ? `https://itunes.apple.com/lookup?id=${release.appleId}&entity=album&country=US`
      : `https://itunes.apple.com/search?term=${encodeURIComponent(release.query)}&entity=album&limit=25&country=US`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Artwork request failed');
      const payload = await response.json();
      const candidates = payload.results.filter((item) => item.wrapperType === 'collection' && /IVE/i.test(item.artistName || ''));
      const normalizedTitle = release.title.replace(/[^a-z0-9]/gi, '').toLowerCase();
      const match = candidates.find((item) => (item.collectionName || '').replace(/[^a-z0-9]/gi, '').toLowerCase().includes(normalizedTitle)) || candidates[0];
      if (!match) throw new Error('No matching release');
      const result = {
        artwork: match.artworkUrl100?.replace('100x100bb', '800x800bb') || fallbackCover(release),
        url: match.collectionViewUrl || `https://music.apple.com/us/search?term=${encodeURIComponent(release.query)}`
      };
      artworkCache.set(release.title, result);
      return result;
    } catch (error) {
      const result = { artwork: fallbackCover(release), url: `https://music.apple.com/us/search?term=${encodeURIComponent(release.query)}` };
      artworkCache.set(release.title, result);
      return result;
    }
  }

  function wait(duration) {
    return new Promise((resolve) => window.setTimeout(resolve, duration));
  }

  function renderNavigator() {
    if (document.documentElement.dataset.page !== 'eras') return;
    const consoleElement = document.querySelector('.era-console-page');
    if (!consoleElement) return;

    const archiveGrid = document.querySelector('[data-era-archive]');
    archiveGrid?.closest('.page-section')?.remove();

    consoleElement.innerHTML = `
      <div class="disco-rail">
        <div class="disco-tabs" role="tablist" aria-label="IVE Korean releases">
          ${releases.map((release, index) => `
            <button class="disco-tab" type="button" role="tab" aria-selected="${index === releases.length - 1}" data-release-index="${index}">
              <span class="disco-tab-dot" aria-hidden="true"></span>
              <strong>${release.title}</strong>
              <small>${release.year}</small>
            </button>`).join('')}
        </div>
      </div>
      <article class="disco-detail" aria-live="polite" data-release-detail></article>`;

    const detail = consoleElement.querySelector('[data-release-detail]');
    const tabs = [...consoleElement.querySelectorAll('.disco-tab')];
    let transitionId = 0;
    let activeIndex = -1;

    async function selectRelease(index, focus = false) {
      if (index === activeIndex && detail.childElementCount) return;
      activeIndex = index;
      const requestId = ++transitionId;
      const release = releases[index];

      tabs.forEach((tab, tabIndex) => tab.setAttribute('aria-selected', String(tabIndex === index)));
      if (focus) tabs[index].scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });

      if (detail.childElementCount && !reducedMotion.matches) {
        detail.classList.add('is-leaving');
        await wait(170);
        if (requestId !== transitionId) return;
      }

      detail.innerHTML = `
        <div class="disco-cover-wrap">
          <img class="disco-cover is-loading" src="${fallbackCover(release)}" alt="${release.title} album artwork" data-release-cover />
        </div>
        <div class="disco-copy">
          <p class="disco-sequence">${String(index + 1).padStart(2, '0')} / ${release.date}</p>
          <h3>${release.title}</h3>
          <p class="disco-type">${release.type}</p>
          <p class="disco-title-track">Title track · ${release.titleTrack}</p>
          <p class="disco-description">${release.description}</p>
          <div class="disco-actions">
            <a href="https://music.apple.com/us/search?term=${encodeURIComponent(release.query)}" target="_blank" rel="noreferrer" data-tracklist-link>View tracklist ↗</a>
            <a href="${release.official}" target="_blank" rel="noreferrer">Official catalog ↗</a>
          </div>
        </div>`;

      detail.classList.remove('is-leaving');
      if (!reducedMotion.matches) {
        detail.classList.add('is-entering');
        requestAnimationFrame(() => requestAnimationFrame(() => detail.classList.remove('is-entering')));
      }

      const artwork = await fetchArtwork(release);
      if (requestId !== transitionId || tabs[index].getAttribute('aria-selected') !== 'true') return;
      const cover = detail.querySelector('[data-release-cover]');
      const tracklistLink = detail.querySelector('[data-tracklist-link]');
      if (tracklistLink) tracklistLink.href = artwork.url;
      if (!cover) return;

      const preload = new Image();
      preload.onload = () => {
        if (requestId !== transitionId) return;
        cover.classList.add('is-swapping');
        window.setTimeout(() => {
          if (requestId !== transitionId) return;
          cover.src = artwork.artwork;
          cover.classList.remove('is-loading', 'is-swapping');
        }, reducedMotion.matches ? 0 : 120);
      };
      preload.onerror = () => cover.classList.remove('is-loading');
      preload.src = artwork.artwork;
    }

    tabs.forEach((tab) => tab.addEventListener('click', () => selectRelease(Number(tab.dataset.releaseIndex), true)));
    selectRelease(releases.length - 1);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderNavigator, { once: true });
  else renderNavigator();
})();
