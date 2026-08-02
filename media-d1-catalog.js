(() => {
  if (document.documentElement.dataset.page !== 'media') return;

  const state = { videos: [], activeFilter: 'all', search: '' };
  const $ = (selector, scope = document) => scope?.querySelector(selector) ?? null;
  const $$ = (selector, scope = document) => scope ? [...scope.querySelectorAll(selector)] : [];

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function thumbnail(id, quality = 'mqdefault') {
    return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
  }

  function youtubeUrl(id) {
    return `https://www.youtube.com/watch?v=${id}`;
  }

  function videoCard(video) {
    return `
      <article class="official-media-card">
        <button class="official-media-thumb" type="button" data-open-video="${video.id}" aria-label="Play ${escapeHtml(video.title)}">
          <img src="${thumbnail(video.id)}" alt="" loading="lazy" decoding="async" fetchpriority="low" />
          <span class="official-media-play" aria-hidden="true"></span>
        </button>
        <div class="official-media-copy">
          <p class="official-media-meta"><span>${escapeHtml(video.type)}</span><time datetime="${video.releaseDate}">${escapeHtml(video.date)}</time></p>
          <h3>${escapeHtml(video.title)}</h3>
          <p>${escapeHtml(video.era)}</p>
        </div>
      </article>`;
  }

  function railCard(video) {
    return `
      <button class="media-latest-card" type="button" role="listitem" data-open-video="${video.id}" aria-label="Play ${escapeHtml(video.title)}">
        <img src="${thumbnail(video.id)}" alt="" loading="lazy" decoding="async" fetchpriority="low" />
        <span><strong>${escapeHtml(video.title)}</strong><small>${escapeHtml(video.type)} · ${escapeHtml(video.date)}</small></span>
      </button>`;
  }

  function openVideo(video, trigger) {
    const modal = $('[data-media-modal]');
    const player = $('[data-media-player]');
    const title = $('[data-media-modal-title]');
    const meta = $('[data-media-modal-meta]');
    const external = $('[data-media-modal-youtube]');
    if (!modal || !player || !video) return;

    if (title) title.textContent = video.title;
    if (meta) meta.textContent = `${video.type} · ${video.date} · ${video.era}`;
    if (external) external.href = youtubeUrl(video.id);

    const expected = `/embed/${video.id}`;
    const currentFrame = player.querySelector('iframe');
    if (!currentFrame || !currentFrame.src.includes(expected)) {
      player.innerHTML = `
        <iframe
          src="https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0"
          title="${escapeHtml(video.title)}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen></iframe>`;
    }

    if (!modal.open) {
      modal.showModal();
      document.documentElement.style.overflow = 'hidden';
    }

    if (trigger instanceof HTMLElement) trigger.blur();
  }

  function renderFeature() {
    const featured = state.videos.find((video) => video.featured)
      || state.videos.find((video) => video.categories.includes('music-video'))
      || state.videos[0];
    if (!featured) return;

    const image = $('[data-media-feature-image]');
    if (image) {
      image.src = thumbnail(featured.id, 'maxresdefault');
      image.onerror = () => {
        image.onerror = null;
        image.src = thumbnail(featured.id, 'hqdefault');
      };
      image.alt = `${featured.title} official video thumbnail`;
    }

    if ($('[data-media-feature-title]')) $('[data-media-feature-title]').textContent = featured.title;
    if ($('[data-media-feature-description]')) $('[data-media-feature-description]').textContent = featured.description || '';
    if ($('[data-media-feature-type]')) $('[data-media-feature-type]').textContent = featured.type;
    if ($('[data-media-feature-date]')) $('[data-media-feature-date]').textContent = featured.date;
    if ($('[data-media-feature-code]')) $('[data-media-feature-code]').textContent = `${featured.era} · official transmission`;

    const youtube = $('[data-media-feature-youtube]');
    if (youtube) youtube.href = youtubeUrl(featured.id);
    $$('[data-media-feature-open]').forEach((button) => {
      button.dataset.openVideo = featured.id;
      button.setAttribute('aria-label', `Play ${featured.title}`);
    });
  }

  function renderRail() {
    const rail = $('[data-media-latest]');
    if (!rail) return;
    const musicVideos = state.videos.filter((video) => video.categories.includes('music-video'));
    rail.innerHTML = musicVideos.map(railCard).join('');
  }

  function renderGrid() {
    const grid = $('[data-official-media-grid]');
    const count = $('[data-media-count]');
    const empty = $('[data-media-empty]');
    if (!grid) return;

    const filtered = state.videos.filter((video) => {
      const categoryMatch = state.activeFilter === 'all' || video.categories.includes(state.activeFilter);
      const haystack = `${video.title} ${video.type} ${video.era} ${video.date}`.toLowerCase();
      return categoryMatch && (!state.search || haystack.includes(state.search));
    });

    grid.innerHTML = filtered.map(videoCard).join('');
    if (count) count.textContent = `${filtered.length} transmission${filtered.length === 1 ? '' : 's'}`;
    if (empty) empty.hidden = filtered.length > 0;
  }

  function renderAll() {
    renderFeature();
    renderRail();
    renderGrid();
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-video]');
    if (!trigger || !state.videos.length) return;
    const video = state.videos.find((item) => item.id === trigger.dataset.openVideo);
    if (!video) return;
    openVideo(video, trigger);
  });

  $$('[data-official-media-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeFilter = button.dataset.officialMediaFilter || 'all';
      window.queueMicrotask(renderGrid);
    });
  });

  $('[data-media-search]')?.addEventListener('input', (event) => {
    state.search = event.currentTarget.value.trim().toLowerCase();
    window.queueMicrotask(renderGrid);
  });

  fetch('/api/videos', { headers: { accept: 'application/json' } })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Live catalog unavailable (${response.status})`);
      return response.json();
    })
    .then((payload) => {
      if (!Array.isArray(payload.videos) || !payload.videos.length) return;
      state.videos = payload.videos;
      renderAll();
    })
    .catch(() => {
      // The hardcoded catalog remains active until D1 is configured.
    });
})();
