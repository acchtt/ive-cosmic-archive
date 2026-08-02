(() => {
  const reviveEra = {
    year: '2026',
    name: 'REVIVE+',
    copy: 'IVE’s second full album expands the archive from individual confidence toward a wider story of becoming “we.”',
    tags: ['2nd full album', '12 tracks', 'Current orbit'],
    coordinate: 'ORBIT 006'
  };

  const latestIndex = eras.findIndex((era) => era.name === 'LATEST SIGNAL' || era.name === 'REVIVE+');
  if (latestIndex >= 0) eras.splice(latestIndex, 1, reviveEra);
  else eras.push(reviveEra);

  function refreshEraInterface() {
    if (document.documentElement.dataset.page !== 'eras') return;

    const tabs = document.querySelector('[data-era-tabs]');
    if (tabs) {
      const cleanTabs = tabs.cloneNode(false);
      tabs.replaceWith(cleanTabs);
    }

    const archive = document.querySelector('[data-era-archive]');
    if (archive) {
      const cleanArchive = archive.cloneNode(false);
      archive.replaceWith(cleanArchive);
    }

    renderEras();
    renderEraArchive();
    selectEra(eras.length - 1);
    setupReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshEraInterface, { once: true });
  } else {
    refreshEraInterface();
  }
})();
