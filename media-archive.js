(() => {
  const videos = [
    {
      id: 'trlOTS4nKO4',
      title: 'LUCID DREAM',
      date: '2026.05.26',
      type: 'Japanese music video',
      categories: ['music-video', 'japanese'],
      era: 'LUCID DREAM',
      description: 'The latest Japanese visual transmission, built around the dreamlike lead track from IVE’s fourth Japanese EP.'
    },
    {
      id: '1Lmy7qwmSMc',
      title: 'BLACKHOLE',
      date: '2026.02.23',
      type: 'Music video',
      categories: ['music-video'],
      era: 'REVIVE+',
      featured: true,
      description: 'The title transmission for REVIVE+, presented through a cinematic science-fiction world of disappearance and rebirth.'
    },
    {
      id: 'mfj5OfIZu1I',
      title: 'BLACKHOLE · Behind The Scenes',
      date: '2026.03.02',
      type: 'Behind',
      categories: ['behind'],
      era: 'REVIVE+',
      description: 'The official making archive from the BLACKHOLE music-video production.'
    },
    {
      id: 'TNDF5Qr6ayo',
      title: 'BLACKHOLE · Dance Practice',
      date: '2026.02.28',
      type: 'Dance practice',
      categories: ['practice'],
      era: 'REVIVE+',
      description: 'A full choreography view focused on formations, transitions, and the six-member performance.'
    },
    {
      id: '9qkpcLK422o',
      title: 'BANG BANG',
      date: '2026.02.09',
      type: 'Music video',
      categories: ['music-video'],
      era: 'REVIVE+',
      description: 'The advance REVIVE+ transmission, driven by EDM and electronic production.'
    },
    {
      id: 'B1ShLiq3EVc',
      title: 'XOXZ',
      date: '2025.08.25',
      type: 'Music video',
      categories: ['music-video'],
      era: 'IVE SECRET',
      description: 'A coded dream-world visual for IVE SECRET, balancing polished pop imagery with a darker theatrical edge.'
    },
    {
      id: '38xYeot-ciM',
      title: 'ATTITUDE',
      date: '2025.02.03',
      type: 'Music video',
      categories: ['music-video'],
      era: 'IVE EMPATHY',
      description: 'The second IVE EMPATHY title transmission, centered on bright confidence and self-directed luck.'
    },
    {
      id: 'xMilZv-Clms',
      title: 'ATTITUDE · Behind The Scenes',
      date: '2025.02.17',
      type: 'Behind',
      categories: ['behind'],
      era: 'IVE EMPATHY',
      description: 'The official production archive from the ATTITUDE music-video set.'
    },
    {
      id: 'g36q0ZLvygQ',
      title: 'REBEL HEART',
      date: '2025.01.13',
      type: 'Music video',
      categories: ['music-video'],
      era: 'IVE EMPATHY',
      description: 'A solidarity-focused pre-release visual that expands IVE’s confidence from the individual toward the group.'
    },
    {
      id: 'es9MaJPb_U8',
      title: 'REBEL HEART · Performance Video',
      date: '2025.01.20',
      type: 'Performance',
      categories: ['performance'],
      era: 'IVE EMPATHY',
      description: 'A performance-first presentation of REBEL HEART with the choreography and formation work at the center.'
    },
    {
      id: 'TT1rdIBPfmY',
      title: 'REBEL HEART · Dance Practice',
      date: '2025.01.21',
      type: 'Dance practice',
      categories: ['practice'],
      era: 'IVE EMPATHY',
      description: 'The official practice-room view of the REBEL HEART choreography.'
    },
    {
      id: 'D-geLVTaBAo',
      title: 'CRUSH',
      date: '2024.08.07',
      type: 'Japanese music video',
      categories: ['music-video', 'japanese'],
      era: 'ALIVE',
      description: 'The lead visual from IVE’s second Japanese EP, ALIVE.'
    }
  ];

  const latestIds = ['trlOTS4nKO4', '1Lmy7qwmSMc', '9qkpcLK422o', 'B1ShLiq3EVc'];
  const featured = videos.find((video) => video.featured) || videos[0];
  let activeFilter = 'all';
  let searchTerm = '';
  let lastTrigger = null;

  const $ = (selector, scope = document) => scope?.querySelector(selector) ?? null;
  const $$ = (selector, scope = document) => scope ? [...scope.querySelectorAll(selector)] : [];

  function thumbnail(id, quality = 'mqdefault') {
    return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
  }

  function youtubeUrl(id) {
    return `https://www.youtube.com/watch?v=${id}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function videoCard(video) {
    return `
      <article class="official-media-card">
        <button class="official-media-thumb" type="button" data-open-video="${video.id}" aria-label="Play ${escapeHtml(video.title)}">
          <img src="${thumbnail(video.id)}" alt="" loading="lazy" decoding="async" fetchpriority="low" />
          <span class="official-media-play" aria-hidden="true"></span>
        </button>
        <div class="official-media-copy">
          <p class="official-media-meta"><span>${escapeHtml(video.type)}</span><time datetime="${video.date.replaceAll('.', '-')}">${video.date}</time></p>
          <h3>${escapeHtml(video.title)}</h3>
          <p>${escapeHtml(video.era)}</p>
        </div>
      </article>`;
  }

  function renderFeature() {
    const image = $('[data-media-feature-image]');
    const title = $('[data-media-feature-title]');
    const description = $('[data-media-feature-description]');
    const type = $('[data-media-feature-type]');
    const date = $('[data-media-feature-date]');
    const code = $('[data-media-feature-code]');
    const youtube = $('[data-media-feature-youtube]');

    if (image) {
      image.src = thumbnail(featured.id, 'hqdefault');
      image.alt = `${featured.title} official video thumbnail`;
    }
    if (title) title.textContent = featured.title;
    if (description) description.textContent = featured.description;
    if (type) type.textContent = featured.type;
    if (date) date.textContent = featured.date;
    if (code) code.textContent = `${featured.era} · official transmission`;
    if (youtube) youtube.href = youtubeUrl(featured.id);

    $$('[data-media-feature-open]').forEach((button) => {
      button.dataset.openVideo = featured.id;
      button.setAttribute('aria-label', `Play ${featured.title}`);
    });
  }

  function renderLatest() {
    const container = $('[data-media-latest]');
    if (!container) return;
    const latest = latestIds.map((id) => videos.find((video) => video.id === id)).filter(Boolean);
    container.innerHTML = latest.map((video) => `
      <button class="media-latest-card" type="button" data-open-video="${video.id}" aria-label="Play ${escapeHtml(video.title)}">
        <img src="${thumbnail(video.id)}" alt="" loading="lazy" decoding="async" fetchpriority="low" />
        <span><strong>${escapeHtml(video.title)}</strong><small>${escapeHtml(video.type)} · ${video.date}</small></span>
      </button>`).join('');
  }

  function matches(video) {
    const inCategory = activeFilter === 'all' || video.categories.includes(activeFilter);
    if (!inCategory) return false;
    if (!searchTerm) return true;
    const haystack = `${video.title} ${video.type} ${video.era} ${video.date}`.toLowerCase();
    return haystack.includes(searchTerm);
  }

  function renderGrid() {
    const grid = $('[data-official-media-grid]');
    const count = $('[data-media-count]');
    const empty = $('[data-media-empty]');
    if (!grid) return;

    const filtered = videos.filter(matches);
    grid.innerHTML = filtered.map(videoCard).join('');
    if (count) count.textContent = `${filtered.length} transmission${filtered.length === 1 ? '' : 's'}`;
    if (empty) empty.hidden = filtered.length > 0;
  }

  function openVideo(video, trigger) {
    const modal = $('[data-media-modal]');
    const player = $('[data-media-player]');
    const title = $('[data-media-modal-title]');
    const meta = $('[data-media-modal-meta]');
    const external = $('[data-media-modal-youtube]');
    if (!modal || !player || !video) return;

    lastTrigger = trigger || document.activeElement;
    if (title) title.textContent = video.title;
    if (meta) meta.textContent = `${video.type} · ${video.date} · ${video.era}`;
    if (external) external.href = youtubeUrl(video.id);
    player.innerHTML = `
      <iframe
        src="https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0"
        title="${escapeHtml(video.title)}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen></iframe>`;

    modal.showModal();
    document.documentElement.style.overflow = 'hidden';
  }

  function closeVideo() {
    const modal = $('[data-media-modal]');
    if (!modal?.open) return;
    modal.close();
  }

  function setupControls() {
    const search = $('[data-media-search]');
    const modal = $('[data-media-modal]');

    search?.addEventListener('input', () => {
      searchTerm = search.value.trim().toLowerCase();
      renderGrid();
    });

    $$('[data-official-media-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.officialMediaFilter;
        $$('[data-official-media-filter]').forEach((node) => {
          node.setAttribute('aria-pressed', String(node === button));
        });
        renderGrid();
      });
    });

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-open-video]');
      if (!trigger) return;
      const video = videos.find((item) => item.id === trigger.dataset.openVideo);
      openVideo(video, trigger);
    });

    $('[data-media-modal-close]')?.addEventListener('click', closeVideo);

    modal?.addEventListener('click', (event) => {
      if (event.target === modal) closeVideo();
    });

    modal?.addEventListener('close', () => {
      const player = $('[data-media-player]');
      if (player) player.replaceChildren();
      document.documentElement.style.overflow = '';
      if (lastTrigger instanceof HTMLElement) lastTrigger.focus({ preventScroll: true });
      lastTrigger = null;
    });
  }

  function initMediaArchive() {
    if (document.documentElement.dataset.page !== 'media') return;
    renderFeature();
    renderLatest();
    renderGrid();
    setupControls();
  }

  initMediaArchive();
})();
