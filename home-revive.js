(() => {
  if (document.documentElement.dataset.page !== 'index') return;

  const STORAGE_KEY = 'ive-cosmic-revive-member-set';
  const VERSION_CARD = {
    bangers: {
      kicker: '01 · BANGERS version',
      title: 'BANGERS',
      body: 'Signal-red color blocking, icy cyan, acid-lime accents, and high-impact styling tuned to the BANGERS version.',
      image: 'https://i.imgur.com/IHBkZIr.jpg',
      alt: 'JANG WONYOUNG in the REVIVE+ BANGERS concept-card set',
      link: 'Explore BANGERS members ↗'
    },
    challengers: {
      kicker: '01 · CHALLENGERS version',
      title: 'CHALLENGERS',
      body: 'Sharper editorial contrast, oxide-red accents, cool tailoring, and the confident campaign energy of the CHALLENGERS version.',
      image: 'https://i.imgur.com/ZVnaaYc.jpg',
      alt: 'AN YUJIN in the REVIVE+ CHALLENGERS concept-card set',
      link: 'Explore CHALLENGERS members ↗'
    },
    spoilers: {
      kicker: '01 · SPOILERS version',
      title: 'SPOILERS',
      body: 'Press blue, powder cyan, cool gray, and acid-yellow editorial details define the clean visual language of the SPOILERS version.',
      image: 'https://pbs.twimg.com/media/G_rOkQMbAAAQ3UB?format=jpg&name=orig',
      alt: 'LIZ in the REVIVE+ official SPOILERS concept-photo set',
      link: 'Explore SPOILERS members ↗'
    },
    'loved-ive': {
      kicker: '01 · LOVED IVE version',
      title: 'LOVED IVE',
      body: 'Deep navy, studio blue, soft gray, and warm uniform tones shape the quieter portrait mood of the LOVED IVE version.',
      image: 'assets/revive/member-cards/loved-ive/gaeul.jpg?v=challengers-gaeul-align-v59',
      alt: 'GAEUL in the REVIVE+ LOVED IVE concept-card set',
      link: 'Explore LOVED IVE members ↗'
    }
  };

  if (!document.querySelector('link[href="home-revive-collage-fix.css"]')) {
    const collageFixStyles = document.createElement('link');
    collageFixStyles.rel = 'stylesheet';
    collageFixStyles.href = 'home-revive-collage-fix.css';
    document.head.appendChild(collageFixStyles);
  }

  if (!document.querySelector('script[src="revive-member-sets.js"]')) {
    const memberSetScript = document.createElement('script');
    memberSetScript.src = 'revive-member-sets.js';
    memberSetScript.async = false;
    document.head.appendChild(memberSetScript);
  }

  const board = document.querySelector('[data-campaign-board]');
  const mediaCount = document.querySelector('[data-home-media-count]');
  const mvCount = document.querySelector('[data-home-mv-count]');
  const latestSignal = document.querySelector('[data-home-latest-signal]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function readStoredVersion() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return VERSION_CARD[stored] ? stored : 'bangers';
    } catch {
      return 'bangers';
    }
  }

  function syncVersionCard(id = readStoredVersion()) {
    const resolved = VERSION_CARD[id] ? id : 'bangers';
    const data = VERSION_CARD[resolved];
    const card = document.querySelector('.concept-card.concept-campaign');
    if (!card) return;

    const image = card.querySelector('img');
    const kicker = card.querySelector('.concept-copy > span');
    const title = card.querySelector('.concept-copy > h3');
    const body = card.querySelector('.concept-copy > p');
    const link = card.querySelector('.concept-copy > a');

    card.dataset.version = resolved;
    if (image) {
      image.referrerPolicy = 'no-referrer';
      image.src = data.image;
      image.alt = data.alt;
    }
    if (kicker) kicker.textContent = data.kicker;
    if (title) title.textContent = data.title;
    if (body) body.textContent = data.body;
    if (link) {
      link.href = 'members.html';
      link.textContent = data.link;
    }
  }

  syncVersionCard();

  window.addEventListener('revive-member-set-change', (event) => {
    syncVersionCard(event.detail?.id);
  });

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