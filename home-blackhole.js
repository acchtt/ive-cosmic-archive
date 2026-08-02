(() => {
  if (document.documentElement.dataset.page !== 'index') return;

  const heroImage = document.querySelector('[data-home-blackhole-image]');
  const heroVisual = document.querySelector('[data-home-blackhole-visual]');
  const mediaCount = document.querySelector('[data-home-media-count]');
  const mvCount = document.querySelector('[data-home-mv-count]');
  const latestSignal = document.querySelector('[data-home-latest-signal]');

  if (heroImage) {
    heroImage.addEventListener('error', () => {
      if (heroImage.dataset.fallback === 'true') return;
      heroImage.dataset.fallback = 'true';
      heroImage.src = 'https://i.ytimg.com/vi/1Lmy7qwmSMc/hqdefault.jpg';
    }, { once: true });
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroVisual && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    heroVisual.addEventListener('pointermove', (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
      heroVisual.style.setProperty('--mx', x.toFixed(3));
      heroVisual.style.setProperty('--my', y.toFixed(3));
    });

    heroVisual.addEventListener('pointerleave', () => {
      heroVisual.style.setProperty('--mx', '0');
      heroVisual.style.setProperty('--my', '0');
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
      // Static homepage values remain visible when the live catalog is unavailable.
    });
})();
