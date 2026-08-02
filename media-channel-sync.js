(() => {
  const CHANNEL_ID = 'UC-Fnix71vRP64WXeo0ikd0Q';
  const API_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.syncpundit.io',
    'https://api-piped.mha.fi'
  ];
  const CURATED_IDS = new Set([
    'trlOTS4nKO4', '1Lmy7qwmSMc', 'mfj5OfIZu1I', 'TNDF5Qr6ayo',
    '9qkpcLK422o', 'B1ShLiq3EVc', '38xYeot-ciM', 'xMilZv-Clms',
    'g36q0ZLvygQ', 'es9MaJPb_U8', 'TT1rdIBPfmY', 'D-geLVTaBAo'
  ]);

  const dynamicVideos = [];
  const indexedIds = new Set(CURATED_IDS);
  let currentInstance = null;
  let nextPage = null;
  let syncedPages = 0;
  let syncing = false;
  let exhausted = false;
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

  function inferEra(title) {
    const value = title.toUpperCase();
    if (/BLACKHOLE|BANG BANG|REVIVE\+/.test(value)) return 'REVIVE+';
    if (/XOXZ|IVE SECRET/.test(value)) return 'IVE SECRET';
    if (/ATTITUDE|REBEL HEART|IVE EMPATHY/.test(value)) return 'IVE EMPATHY';
    if (/HEYA|ACCENDIO|IVE SWITCH/.test(value)) return 'IVE SWITCH';
    if (/BADDIE|OFF THE RECORD|EITHER WAY|HOLY MOLY|I'VE MINE|I’VE MINE/.test(value)) return "I'VE MINE";
    if (/I AM|KITSCH|NOT YOUR GIRL|I'VE IVE|I’VE IVE/.test(value)) return "I'VE IVE";
    if (/AFTER LIKE/.test(value)) return 'AFTER LIKE';
    if (/LOVE DIVE|ROYAL/.test(value)) return 'LOVE DIVE';
    if (/ELEVEN|TAKE IT/.test(value)) return 'ELEVEN';
    return 'IVE official archive';
  }

  function classifyTitle(title, duration = 0) {
    const value = String(title || '').toUpperCase();
    if (!value || (duration > 0 && duration < 75)) return null;
    if (/TEASER|REACTION|CHEERING GUIDE|HIGHLIGHT MEDLEY|TRAILER|CHALLENGE|FANCAM|FACE ?CAM|FOCUS CAM|SHORTS/.test(value)) return null;

    if (/BEHIND|IVE ON|MAKING|PHOTOSHOOT|PHOTO ?SHOOT|JACKET|RECORDING/.test(value)) {
      return { type: 'Behind', categories: ['behind'] };
    }
    if (/DANCE PRACTICE|CHOREOGRAPHY PRACTICE|PRACTICE VIDEO/.test(value)) {
      return { type: 'Dance practice', categories: ['practice'] };
    }
    if (/PERFORMANCE|SPECIAL CLIP|LIVE CLIP|STUDIO CHOOM|BE ORIGINAL|RELAY DANCE|BAND LIVE|SHOWCASE|ONE TAKE|AMAZON MUSIC ORIGINAL|MOVE REC|IT'S LIVE|IT’S LIVE|DANCE VIDEO/.test(value)) {
      return { type: 'Performance', categories: ['performance'] };
    }
    if (/\bMV\b|M\/V|MUSIC VIDEO/.test(value)) {
      return { type: 'Music video', categories: ['music-video'] };
    }
    return null;
  }

  function extractVideoId(url) {
    return String(url || '').match(/[?&]v=([A-Za-z0-9_-]{11})/)?.[1] || null;
  }

  function normalizeStream(stream) {
    const id = extractVideoId(stream.url);
    const classification = classifyTitle(stream.title, Number(stream.duration) || 0);
    if (!id || !classification || indexedIds.has(id)) return null;
    return {
      id,
      title: stream.title,
      date: stream.uploadedDate || 'Official upload',
      type: classification.type,
      categories: classification.categories,
      era: inferEra(stream.title)
    };
  }

  function cardMarkup(video) {
    return `
      <article class="official-media-card is-synced">
        <button class="official-media-thumb" type="button" data-dynamic-video="${video.id}" aria-label="Play ${escapeHtml(video.title)}">
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

  function renderDynamicVideos() {
    const grid = $('[data-official-media-grid]');
    const count = $('[data-media-count]');
    const empty = $('[data-media-empty]');
    if (!grid) return;

    $$('.official-media-card.is-synced', grid).forEach((card) => card.remove());
    const filtered = dynamicVideos.filter(matches);
    grid.insertAdjacentHTML('beforeend', filtered.map(cardMarkup).join(''));

    const curatedVisible = $$('.official-media-card:not(.is-synced)', grid).length;
    const shown = curatedVisible + filtered.length;
    if (count) count.textContent = `${shown} shown · ${CURATED_IDS.size + dynamicVideos.length} indexed`;
    if (empty) empty.hidden = shown > 0;
  }

  function refreshLoadButton() {
    const button = $('[data-media-load-older]');
    if (!button) return;
    button.disabled = syncing || exhausted;
    button.textContent = exhausted
      ? 'Full indexed history reached'
      : syncing
        ? 'Syncing official uploads…'
        : syncedPages
          ? 'Load older official uploads'
          : 'Sync official channel archive';
  }

  function setSyncStatus(message, state = 'idle') {
    const status = $('[data-media-sync-status]');
    if (status) {
      status.textContent = message;
      status.dataset.state = state;
    }
    refreshLoadButton();
  }

  async function fetchJson(url, timeout = 12000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        mode: 'cors',
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Archive request failed (${response.status})`);
      return await response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function fetchChannelPage() {
    const path = syncedPages === 0
      ? `/channel/${CHANNEL_ID}`
      : `/nextpage/channel/${CHANNEL_ID}?nextpage=${encodeURIComponent(nextPage)}`;
    const instances = currentInstance
      ? [currentInstance, ...API_INSTANCES.filter((instance) => instance !== currentInstance)]
      : API_INSTANCES;
    let lastError;

    for (const instance of instances) {
      try {
        const payload = await fetchJson(`${instance}${path}`);
        currentInstance = instance;
        return payload;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('No channel index is reachable.');
  }

  function ingestStreams(streams = []) {
    const additions = streams.map(normalizeStream).filter(Boolean);
    additions.forEach((video) => {
      indexedIds.add(video.id);
      dynamicVideos.push(video);
    });
    return additions.length;
  }

  async function syncOfficialArchive(pageLimit = 4) {
    if (syncing || exhausted) return;
    syncing = true;
    setSyncStatus('Syncing long-form uploads from the official IVE channel…', 'syncing');
    let added = 0;

    try {
      for (let index = 0; index < pageLimit; index += 1) {
        if (syncedPages > 0 && !nextPage) {
          exhausted = true;
          break;
        }
        const payload = await fetchChannelPage();
        added += ingestStreams(payload.relatedStreams || []);
        nextPage = payload.nextpage || null;
        syncedPages += 1;
        renderDynamicVideos();
        setSyncStatus(`Indexed ${CURATED_IDS.size + dynamicVideos.length} matching uploads across ${syncedPages} channel page${syncedPages === 1 ? '' : 's'}…`, 'syncing');
        if (!nextPage) {
          exhausted = true;
          break;
        }
      }

      setSyncStatus(
        exhausted
          ? `Official channel index complete · ${CURATED_IDS.size + dynamicVideos.length} matching transmissions.`
          : `Official channel synced · ${added} new matches added this pass.`,
        'ready'
      );
    } catch (error) {
      setSyncStatus('Live channel sync is unavailable right now; the curated archive remains usable.', 'error');
    } finally {
      syncing = false;
      refreshLoadButton();
    }
  }

  function maybeExpandCategory() {
    const filter = activeFilter();
    if (!['performance', 'practice', 'behind'].includes(filter)) return;
    const count = dynamicVideos.filter((video) => video.categories.includes(filter)).length;
    if (count < 10 && !syncing && !exhausted) syncOfficialArchive(3);
  }

  function openDynamicVideo(video, trigger) {
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
    $('[data-media-search]')?.addEventListener('input', renderDynamicVideos);
    $$('[data-official-media-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        renderDynamicVideos();
        maybeExpandCategory();
      });
    });
    $('[data-media-load-older]')?.addEventListener('click', () => syncOfficialArchive(5));

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-dynamic-video]');
      if (!trigger) return;
      const video = dynamicVideos.find((item) => item.id === trigger.dataset.dynamicVideo);
      openDynamicVideo(video, trigger);
    });

    $('[data-media-modal]')?.addEventListener('close', () => {
      if (lastDynamicTrigger instanceof HTMLElement) lastDynamicTrigger.focus({ preventScroll: true });
      lastDynamicTrigger = null;
    });
  }

  function init() {
    if (document.documentElement.dataset.page !== 'media') return;
    setupInteractions();
    setSyncStatus('Curated archive ready · official channel sync queued.', 'idle');
    const start = () => syncOfficialArchive(4);
    if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 1800 });
    else window.setTimeout(start, 800);
  }

  init();
})();
