(() => {
  if (document.documentElement.dataset.page !== 'index') return;

  if (!document.querySelector('link[href="home-revive-collage-fix.css"]')) {
    const collageFixStyles = document.createElement('link');
    collageFixStyles.rel = 'stylesheet';
    collageFixStyles.href = 'home-revive-collage-fix.css';
    document.head.appendChild(collageFixStyles);
  }

  const board = document.querySelector('[data-campaign-board]');
  const mediaCount = document.querySelector('[data-home-media-count]');
  const mvCount = document.querySelector('[data-home-mv-count]');
  const latestSignal = document.querySelector('[data-home-latest-signal]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-youtube-thumb]').forEach((image) => {
    image.addEventListener('error', () => {
      if (image.dataset.fallback === 'true') return;
      image.dataset.fallback = 'true';
      const videoId = image.dataset.youtubeThumb;
      if (videoId) image.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }, { once: true });
  });

  if (board && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    board.addEventListener('pointermove', (event) => {
      const rect = board.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
      board.style.setProperty('--mx', (x * .85).toFixed(3));
      board.style.setProperty('--my', (y * .85).toFixed(3));
    });

    board.addEventListener('pointerleave', () => {
      board.style.setProperty('--mx', '0');
      board.style.setProperty('--my', '0');
    });
  }

  fetch('/api/videos', { headers: { accept: 'application/json' } })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Catalog unavailable (${response.status})`);
      return response.json();
    })
    .then((payload) => {
      const videos = Array.isArray(payload.videos) ? payload.videos : [];
      if (!videos.length) return;

      const musicVideos = videos.filter((video) => Array.isArray(video.categories) && video.categories.includes('music-video'));
      const newest = [...videos].sort((a, b) => String(b.releaseDate || b.date || '').localeCompare(String(a.releaseDate || a.date || '')))[0];

      if (mediaCount) mediaCount.textContent = String(videos.length).padStart(2, '0');
      if (mvCount) mvCount.textContent = String(musicVideos.length).padStart(2, '0');
      if (latestSignal && newest?.title) latestSignal.textContent = newest.title;
    })
    .catch(() => {
      // Static values remain visible when the live catalog is unavailable.
    });
})();
