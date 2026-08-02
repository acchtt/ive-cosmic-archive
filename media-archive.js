(() => {
  const musicVideos = [
    { id: 'trlOTS4nKO4', title: 'LUCID DREAM', date: '2026.05.26', type: 'Japanese music video', categories: ['music-video', 'japanese'], era: 'LUCID DREAM' },
    { id: '1Lmy7qwmSMc', title: 'BLACKHOLE', date: '2026.02.23', type: 'Music video', categories: ['music-video'], era: 'REVIVE+', featured: true, description: 'The title transmission for REVIVE+, presented through a cinematic science-fiction world of disappearance and rebirth.' },
    { id: '9qkpcLK422o', title: 'BANG BANG', date: '2026.02.09', type: 'Music video', categories: ['music-video'], era: 'REVIVE+' },
    { id: 'B1ShLiq3EVc', title: 'XOXZ', date: '2025.08.25', type: 'Music video', categories: ['music-video'], era: 'IVE SECRET' },
    { id: 'gC7cURZsiH8', title: 'Be Alright', date: '2025.07.26', type: 'Japanese music video', categories: ['music-video', 'japanese'], era: 'Be Alright' },
    { id: '38xYeot-ciM', title: 'ATTITUDE', date: '2025.02.03', type: 'Music video', categories: ['music-video'], era: 'IVE EMPATHY' },
    { id: 'g36q0ZLvygQ', title: 'REBEL HEART', date: '2025.01.13', type: 'Music video', categories: ['music-video'], era: 'IVE EMPATHY' },
    { id: 'fyk6vjwI3wc', title: 'Supernova Love', date: '2024.11.08', type: 'Music video', categories: ['music-video'], era: 'Supernova Love' },
    { id: 'D-geLVTaBAo', title: 'CRUSH', date: '2024.08.07', type: 'Japanese music video', categories: ['music-video', 'japanese'], era: 'ALIVE' },
    { id: '9adnWMIVHQ0', title: 'SUMMER FESTA', date: '2024.06.28', type: 'Music video', categories: ['music-video'], era: 'SUMMER FESTA' },
    { id: 'PGLx4V680J8', title: 'Accendio', date: '2024.05.15', type: 'Music video', categories: ['music-video'], era: 'IVE SWITCH' },
    { id: '07EzMbVH3QE', title: 'HEYA', date: '2024.04.29', type: 'Music video', categories: ['music-video'], era: 'IVE SWITCH' },
    { id: 'xU8mQMLx0tk', title: 'All Night (Feat. Saweetie)', date: '2024.01.19', type: 'Music video', categories: ['music-video'], era: 'All Night' },
    { id: 'Da4P2uT4mVc', title: 'Baddie', date: '2023.10.13', type: 'Music video', categories: ['music-video'], era: "I'VE MINE" },
    { id: '_ApV7Lm87cg', title: 'Off The Record', date: '2023.10.06', type: 'Music video', categories: ['music-video'], era: "I'VE MINE" },
    { id: '_Hu4GYtye5U', title: 'Either Way', date: '2023.09.25', type: 'Music video', categories: ['music-video'], era: "I'VE MINE" },
    { id: 'okVTSehE414', title: 'I WANT', date: '2023.07.13', type: 'Music video', categories: ['music-video'], era: 'I WANT' },
    { id: 'qD1kP_nJU3o', title: 'WAVE', date: '2023.05.09', type: 'Japanese music video', categories: ['music-video', 'japanese'], era: 'WAVE' },
    { id: '6ZUIwj3FgUY', title: 'I AM', date: '2023.04.10', type: 'Music video', categories: ['music-video'], era: "I'VE IVE" },
    { id: 'pG6iaOMV46I', title: 'Kitsch', date: '2023.03.27', type: 'Music video', categories: ['music-video'], era: "I'VE IVE" },
    { id: 'XfEZzUtdINI', title: 'ELEVEN -Japanese ver.-', date: '2022.09.19', type: 'Japanese music video', categories: ['music-video', 'japanese'], era: 'ELEVEN -Japanese ver.-' },
    { id: 'F0B7HDiY-10', title: 'After LIKE', date: '2022.08.22', type: 'Music video', categories: ['music-video'], era: 'After LIKE' },
    { id: 'Y8JFxS1HlDo', title: 'LOVE DIVE', date: '2022.04.05', type: 'Music video', categories: ['music-video'], era: 'LOVE DIVE' },
    { id: '--FmExEAsM8', title: 'ELEVEN', date: '2021.12.01', type: 'Music video', categories: ['music-video'], era: 'ELEVEN' }
  ];

  const selectedArchive = [
    { id: 'vS4xzjHCI1o', title: 'Supernova Love · M/V BTS', date: '2024.11.29', type: 'Behind', categories: ['behind'], era: 'Supernova Love' },
    { id: 'es9MaJPb_U8', title: 'REBEL HEART · Performance Video', date: '2025.01.20', type: 'Performance', categories: ['performance'], era: 'IVE EMPATHY' },
    { id: 'TNDF5Qr6ayo', title: 'BLACKHOLE · Dance Practice', date: '2026.02.28', type: 'Dance practice', categories: ['practice'], era: 'REVIVE+' },
    { id: 'TT1rdIBPfmY', title: 'REBEL HEART · Dance Practice', date: '2025.01.21', type: 'Dance practice', categories: ['practice'], era: 'IVE EMPATHY' }
  ];

  const videos = [...musicVideos, ...selectedArchive];
  const featured = musicVideos.find((video) => video.featured) || musicVideos[0];
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

  function railCard(video) {
    return `
      <button class="media-latest-card" type="button" role="listitem" data-open-video="${video.id}" aria-label="Play ${escapeHtml(video.title)}">
        <img src="${thumbnail(video.id)}" alt="" loading="lazy" decoding="async" fetchpriority="low" />
        <span><strong>${escapeHtml(video.title)}</strong><small>${escapeHtml(video.type)} · ${video.date}</small></span>
      </button>`;
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
      image.src = thumbnail(featured.id, 'maxresdefault');
      image.onerror = () => {
        image.onerror = null;
        image.src = thumbnail(featured.id, 'hqdefault');
      };
      image.alt = `${featured.title} official video thumbnail`;
    }
    if (title) title.textContent = featured.title;
    if (description) description.textContent = featured.description || '';
    if (type) type.textContent = featured.type;
    if (date) date.textContent = featured.date;
    if (code) code.textContent = `${featured.era} · official transmission`;
    if (youtube) youtube.href = youtubeUrl(featured.id);

    $$('[data-media-feature-open]').forEach((button) => {
      button.dataset.openVideo = featured.id;
      button.setAttribute('aria-label', `Play ${featured.title}`);
    });
  }

  function renderMvRail() {
    const container = $('[data-media-latest]');
    if (!container) return;
    container.innerHTML = musicVideos.map(railCard).join('');
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
    const rail = $('[data-media-latest]');

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

    $$('[data-mv-scroll]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!rail) return;
        const direction = Number(button.dataset.mvScroll) || 1;
        rail.scrollBy({ left: direction * rail.clientWidth * 0.82, behavior: 'smooth' });
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
    renderMvRail();
    renderGrid();
    setupControls();
  }

  initMediaArchive();
})();
