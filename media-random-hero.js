(() => {
  if (document.documentElement.dataset.page !== 'media') return;

  const panel = document.querySelector('.page-hero-media .media-orb');
  const rail = document.querySelector('[data-media-latest]');
  if (!panel || !rail) return;

  const LAST_RANDOM_MV_KEY = 'ive-last-random-hero-mv';
  let settled = false;
  let fallbackTimer = 0;

  function readMusicVideos() {
    return [...rail.querySelectorAll('.media-latest-card[data-open-video]')]
      .map((card) => ({
        id: card.dataset.openVideo || '',
        title: card.querySelector('strong')?.textContent?.trim() || 'Official IVE music video',
        meta: card.querySelector('small')?.textContent?.trim() || 'Official M/V'
      }))
      .filter((video) => video.id);
  }

  function randomIndex(length) {
    if (length <= 1) return 0;
    if (window.crypto?.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function chooseVideo(videos) {
    let previousId = '';
    try {
      previousId = sessionStorage.getItem(LAST_RANDOM_MV_KEY) || '';
    } catch {
      // Session storage is optional.
    }

    const pool = videos.length > 1
      ? videos.filter((video) => video.id !== previousId)
      : videos;
    const selected = pool[randomIndex(pool.length)] || videos[0];

    try {
      sessionStorage.setItem(LAST_RANDOM_MV_KEY, selected.id);
    } catch {
      // The selection still works when storage is unavailable.
    }

    return selected;
  }

  function renderVideo(video) {
    const image = document.createElement('img');
    image.className = 'media-random-thumb';
    image.src = `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;
    image.alt = `${video.title} official music video thumbnail`;
    image.loading = 'eager';
    image.decoding = 'async';
    image.fetchPriority = 'high';
    image.addEventListener('error', () => {
      if (image.dataset.fallback === 'true') return;
      image.dataset.fallback = 'true';
      image.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
    }, { once: true });

    const play = document.createElement('span');
    play.className = 'media-random-play';
    play.setAttribute('aria-hidden', 'true');
    play.textContent = '▶';

    const copy = document.createElement('div');
    copy.className = 'media-random-copy';
    const title = document.createElement('strong');
    title.textContent = video.title;
    const meta = document.createElement('small');
    meta.textContent = `${video.meta} · Random transmission`;
    copy.append(title, meta);

    panel.replaceChildren(image, play, copy);
    panel.classList.add('is-random-ready');
    panel.removeAttribute('aria-hidden');
    panel.dataset.openVideo = video.id;
    panel.setAttribute('role', 'button');
    panel.setAttribute('tabindex', '0');
    panel.setAttribute('aria-label', `Play random music video: ${video.title}`);
  }

  function finish(videos) {
    if (settled || !videos.length) return;
    settled = true;
    window.clearTimeout(fallbackTimer);
    observer.disconnect();
    renderVideo(chooseVideo(videos));
  }

  const observer = new MutationObserver(() => {
    const videos = readMusicVideos();
    if (videos.length) finish(videos);
  });
  observer.observe(rail, { childList: true });

  // The live D1 catalog normally replaces the built-in rail shortly after load.
  // Wait briefly for that replacement, then fall back to the built-in M/V list.
  fallbackTimer = window.setTimeout(() => finish(readMusicVideos()), 750);

  panel.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    panel.click();
  });
})();
