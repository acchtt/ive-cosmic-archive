(() => {
  const CURATED_IDS = new Set([
    'trlOTS4nKO4', '1Lmy7qwmSMc', 'TNDF5Qr6ayo', '9qkpcLK422o',
    'B1ShLiq3EVc', '38xYeot-ciM', 'g36q0ZLvygQ', 'es9MaJPb_U8',
    'TT1rdIBPfmY', 'D-geLVTaBAo'
  ]);
  const PAGE_SIZE = 24;

  let indexedVideos = [];
  let visibleLimit = PAGE_SIZE;
  let generatedAt = null;
  let loading = false;
  let lastDynamicTrigger = null;

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

  function normalizeVideo(video) {
    const id = String(video?.id || '');
    const categories = Array.isArray(video?.categories) ? video.categories.map(String) : [];
    if (!/^[A-Za-z0-9_-]{11}$/.test(id) || CURATED_IDS.has(id) || !categories.includes('music-video')) return null;
    return {
      id,
      title: String(video.title || 'Official IVE M/V'),
      date: String(video.date || 'Official upload'),
      type: String(video.type || 'Music video'),
      categories: ['music-video'],
      era: String(video.era || 'IVE official archive')
    };
  }

  function cardMarkup(video) {
    return `
      <article class="official-media-card is-synced">
        <button class="official-media-thumb" type="button" data-indexed-video="${video.id}" aria-label="Play ${escapeHtml(video.title)}">
          <img src="https://i.ytimg.com/vi/${video.id}/mqdefault.jpg" alt="" loading="lazy" decoding="async" fetchpriority="low" />
          <span class="official-media-play" aria-hidden="true"></span>
        </button>
        <div class="official-media-copy">
          <p class="official-media-meta"><span>${escapeHtml(video.type)}</span><span>${escapeHtml(video.date)}</span></p>
          <h3>${escapeHtml(video.title)}</h3>
          <p>${escapeHtml(video.era)}</p>
        </div>
      </article>`;
  }

  function activeFilter() {
    return $('[data-official-media-filter][aria-pressed="true"]')?.dataset.officialMediaFilter || 'all';
  }

  function matches(video) {
    const filter = activeFilter();
    const query = $('[data-media-search]')?.value.trim().toLowerCase() || '';
    if (filter !== 'all' && !video.categories.includes(filter)) return false;
    if (!query) return true;
    return `${video.title} ${video.type} ${video.era} ${video.date}`.toLowerCase().includes(query);
  }

  function formatGeneratedAt() {
    if (!generatedAt) return null;
    const date = new Date(generatedAt);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    }).format(date);
  }

  function setStatus(message, state = 'idle') {
    const status = $('[data-media-sync-status]');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  function updateLoadButton(filteredCount) {
    const button = $('[data-media-load-older]');
    if (!button) return;
    const remaining = Math.max(0, filteredCount - visibleLimit);
    button.disabled = loading || remaining === 0;
    button.hidden = indexedVideos.length === 0;
    button.textContent = loading
      ? 'Loading official M/V archive…'
      : remaining > 0
        ? `Show ${Math.min(PAGE_SIZE, remaining)} more M/Vs`
        : 'All matching M/Vs shown';
  }

  function renderIndexedVideos() {
    const grid = $('[data-official-media-grid]');
    const count = $('[data-media-count]');
    const empty = $('[data-media-empty]');
    if (!grid) return;

    $$('.official-media-card.is-synced', grid).forEach((card) => card.remove());
    const filtered = indexedVideos.filter(matches);
    const visible = filtered.slice(0, visibleLimit);
    grid.insertAdjacentHTML('beforeend', visible.map(cardMarkup).join(''));

    const curatedVisible = $$('.official-media-card:not(.is-synced)', grid).length;
    const shown = curatedVisible + visible.length;
    const indexedTotal = CURATED_IDS.size + indexedVideos.length;
    if (count) count.textContent = `${shown} shown · ${indexedTotal} indexed`;
    if (empty) empty.hidden = shown > 0;
    updateLoadButton(filtered.length);
  }

  async function loadIndex() {
    if (loading) return;
    loading = true;
    setStatus('Loading the generated official M/V index…', 'syncing');
    updateLoadButton(0);

    try {
      const response = await fetch('media-index.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Media index request failed (${response.status})`);
      const payload = await response.json();
      const seen = new Set();
      indexedVideos = (Array.isArray(payload.videos) ? payload.videos : [])
        .map(normalizeVideo)
        .filter((video) => {
          if (!video || seen.has(video.id)) return false;
          seen.add(video.id);
          return true;
        });
      generatedAt = payload.generatedAt || null;
      visibleLimit = PAGE_SIZE;
      renderIndexedVideos();

      const dateLabel = formatGeneratedAt();
      if (indexedVideos.length) {
        setStatus(
          `${indexedVideos.length} additional official M/Vs indexed${dateLabel ? ` · updated ${dateLabel}` : ''}.`,
          'ready'
        );
      } else {
        setStatus('No additional M/Vs are indexed yet; the curated archive remains available.', 'idle');
      }
    } catch (error) {
      setStatus('The expanded M/V index could not load; the curated archive remains available.', 'error');
    } finally {
      loading = false;
      renderIndexedVideos();
    }
  }

  function resetAndRender() {
    visibleLimit = PAGE_SIZE;
    renderIndexedVideos();
  }

  function openIndexedVideo(video, trigger) {
    const modal = $('[data-media-modal]');
    const player = $('[data-media-player]');
    if (!modal || !player || !video) return;

    lastDynamicTrigger = trigger;
    $('[data-media-modal-title]')?.replaceChildren(document.createTextNode(video.title));
    $('[data-media-modal-meta]')?.replaceChildren(document.createTextNode(`${video.type} · ${video.date} · ${video.era}`));
    const external = $('[data-media-modal-youtube]');
    if (external) external.href = `https://www.youtube.com/watch?v=${video.id}`;
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

  function setupInteractions() {
    $('[data-media-search]')?.addEventListener('input', resetAndRender);
    $$('[data-official-media-filter]').forEach((button) => {
      button.addEventListener('click', resetAndRender);
    });
    $('[data-media-load-older]')?.addEventListener('click', () => {
      visibleLimit += PAGE_SIZE;
      renderIndexedVideos();
    });

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-indexed-video]');
      if (!trigger) return;
      const video = indexedVideos.find((item) => item.id === trigger.dataset.indexedVideo);
      openIndexedVideo(video, trigger);
    });

    $('[data-media-modal]')?.addEventListener('close', () => {
      if (lastDynamicTrigger instanceof HTMLElement) lastDynamicTrigger.focus({ preventScroll: true });
      lastDynamicTrigger = null;
    });
  }

  function init() {
    if (document.documentElement.dataset.page !== 'media') return;
    setupInteractions();
    setStatus('Curated archive ready · loading official M/V index.', 'idle');
    loadIndex();
  }

  init();
})();
