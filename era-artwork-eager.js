(() => {
  if (document.documentElement.dataset.page !== 'eras') return;

  const ARTWORK_SIZE = 1000;
  const CACHE_KEY = 'ive-discography-artwork-v2';
  const releases = [
    { title: 'ELEVEN', appleId: '1597404250', query: 'IVE ELEVEN' },
    { title: 'LOVE DIVE', appleId: '1616804151', query: 'IVE LOVE DIVE' },
    { title: 'After LIKE', appleId: '1639416895', query: 'IVE After LIKE' },
    { title: "I've IVE", appleId: '1680047093', query: "IVE I've IVE" },
    { title: "I'VE MINE", appleId: '1709569466', query: "IVE I'VE MINE" },
    { title: 'IVE SWITCH', query: 'IVE SWITCH EP' },
    { title: 'IVE EMPATHY', query: 'IVE EMPATHY EP' },
    { title: 'IVE SECRET', query: 'IVE SECRET EP' },
    { title: 'REVIVE+', appleId: '1873882195', query: 'IVE REVIVE+' }
  ];

  function readCache() {
    try {
      return JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function writeCache(cache) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      // Session storage is optional; the browser image cache still benefits.
    }
  }

  function artworkUrl(url) {
    return url?.replace(/\d+x\d+bb/u, `${ARTWORK_SIZE}x${ARTWORK_SIZE}bb`);
  }

  function warmImage(src) {
    if (!src) return;
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = 'high';
    image.src = src;
  }

  function upgradeRenderedCover(image) {
    if (!(image instanceof HTMLImageElement) || !image.matches('.disco-cover')) return;
    const upgraded = artworkUrl(image.src);
    if (!upgraded || upgraded === image.src) return;
    image.loading = 'eager';
    image.decoding = 'async';
    image.fetchPriority = 'high';
    image.src = upgraded;
  }

  const coverObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        upgradeRenderedCover(mutation.target);
        return;
      }
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches('.disco-cover')) upgradeRenderedCover(node);
        node.querySelectorAll?.('.disco-cover').forEach(upgradeRenderedCover);
      });
    });
  });
  if (document.body) {
    coverObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });
  }

  async function resolveArtwork(release, cache) {
    const cached = cache[release.title];
    if (cached?.artwork) {
      cached.artwork = artworkUrl(cached.artwork);
      writeCache(cache);
      warmImage(cached.artwork);
      return;
    }

    const endpoint = release.appleId
      ? `https://itunes.apple.com/lookup?id=${release.appleId}&entity=album&country=US`
      : `https://itunes.apple.com/search?term=${encodeURIComponent(release.query)}&entity=album&limit=8&country=US`;

    try {
      const response = await fetch(endpoint, { cache: 'force-cache' });
      if (!response.ok) return;
      const payload = await response.json();
      const candidates = (payload.results || []).filter((item) => item.wrapperType === 'collection' && /IVE/i.test(item.artistName || ''));
      const normalizedTitle = release.title.replace(/[^a-z0-9]/gi, '').toLowerCase();
      const match = candidates.find((item) => (item.collectionName || '').replace(/[^a-z0-9]/gi, '').toLowerCase().includes(normalizedTitle)) || candidates[0];
      if (!match?.artworkUrl100) return;

      const result = {
        artwork: artworkUrl(match.artworkUrl100),
        url: match.collectionViewUrl || `https://music.apple.com/us/search?term=${encodeURIComponent(release.query)}`
      };
      cache[release.title] = result;
      writeCache(cache);
      warmImage(result.artwork);
    } catch {
      // The navigator retains its generated fallback when the lookup is unavailable.
    }
  }

  const cache = readCache();
  const queue = [...releases];
  const worker = async () => {
    while (queue.length) {
      const release = queue.shift();
      if (release) await resolveArtwork(release, cache);
    }
  };

  window.__iveArtworkWarmup = Promise.all([worker(), worker(), worker(), worker()]);
})();
