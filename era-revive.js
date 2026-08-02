(() => {
  if (!document.querySelector('link[href="era-korean-discography.css"]')) {
    const koreanDiscographyStyles = document.createElement('link');
    koreanDiscographyStyles.rel = 'stylesheet';
    koreanDiscographyStyles.href = 'era-korean-discography.css';
    document.head.appendChild(koreanDiscographyStyles);
  }

  const reviveEra = {
    year: '2026',
    name: 'REVIVE+',
    copy: 'IVE’s second full album widens its story from “me” toward “us,” presenting revival as a continued connection rather than a reset.',
    tags: ['정규 2집', '12 tracks', 'Current orbit'],
    coordinate: 'ORBIT 006'
  };

  const officialTracks = [
    { title: 'BLACKHOLE', role: 'Title track' },
    { title: 'BANG BANG', role: 'Pre-release' },
    { title: 'Hush', korean: '숨바꼭질' },
    { title: 'Stuck In Your Head', korean: '악성코드' },
    { title: 'Fireworks' },
    { title: 'HOT COFFEE' },
    { title: '8', korean: '장원영 솔로', role: 'WONYOUNG solo' },
    { title: 'Odd', korean: '가을 솔로', role: 'GAEUL solo' },
    { title: 'Super ICY', korean: '이서 솔로', role: 'LEESEO solo' },
    { title: 'Unreal', korean: '리즈 솔로', role: 'LIZ solo' },
    { title: 'In Your Heart', korean: '레이 솔로', role: 'REI solo' },
    { title: 'Force', korean: '안유진 솔로', role: 'YUJIN solo' }
  ];

  const latestIndex = eras.findIndex((era) => era.name === 'LATEST SIGNAL' || era.name === 'REVIVE+');
  if (latestIndex >= 0) eras.splice(latestIndex, 1, reviveEra);
  else eras.push(reviveEra);

  function applyKoreanDiscography() {
    if (document.documentElement.dataset.page !== 'eras') return;

    const lead = document.querySelector('.revive-lead');
    if (lead) {
      lead.textContent = 'IVE THE 2ND ALBUM <REVIVE+> expands the group’s perspective from “me” to “us.” Rather than resetting its identity, the album presents revival as a re-ignition that connects more emotions, viewpoints, and individual voices.';
    }

    const metaValues = document.querySelectorAll('.revive-meta strong');
    const metaLabels = document.querySelectorAll('.revive-meta span');
    if (metaLabels[0]) metaLabels[0].textContent = 'Album type';
    if (metaValues[0]) metaValues[0].textContent = '정규 2집 · 2nd full album';
    if (metaLabels[1]) metaLabels[1].textContent = 'Release';
    if (metaValues[1]) metaValues[1].textContent = '2026.02.23';
    if (metaLabels[2]) metaLabels[2].textContent = 'Title track';
    if (metaValues[2]) metaValues[2].textContent = 'BLACKHOLE';

    const conceptPills = document.querySelector('.revive-concepts');
    if (conceptPills) conceptPills.remove();

    const actions = document.querySelectorAll('.revive-actions a');
    if (actions[0]) {
      actions[0].href = 'https://ive-official.com/disco/revive/';
      actions[0].textContent = 'Official discography ↗';
      actions[0].setAttribute('aria-label', 'Open the official REVIVE+ discography');
    }

    const transmission = document.querySelector('.blackhole-label span:last-child');
    if (transmission) transmission.textContent = 'BLACKHOLE · 03:24';

    const trackHeader = document.querySelector('.revive-track-panel header span');
    if (trackHeader) trackHeader.textContent = 'IVE 공식 디스코그래피 · 2026';

    const tracklist = document.querySelector('.revive-tracklist');
    if (tracklist) {
      tracklist.innerHTML = officialTracks.map((track) => {
        const metadata = [
          track.korean ? `<span lang="ko">${track.korean}</span>` : '',
          track.role ? `<span>${track.role}</span>` : ''
        ].filter(Boolean).join('');

        return `
          <li>
            <span class="revive-track-name">${track.title}</span>
            ${metadata ? `<span class="revive-track-meta">${metadata}</span>` : ''}
          </li>`;
      }).join('');
    }

    const reviveCopy = document.querySelector('.revive-copy');
    if (reviveCopy && !reviveCopy.querySelector('.revive-source-note')) {
      const sourceNote = document.createElement('p');
      sourceNote.className = 'revive-source-note';
      sourceNote.innerHTML = 'Album information and track naming follow the <a href="https://ive-official.com/disco/revive/" target="_blank" rel="noreferrer">IVE Korean official discography</a>.';
      reviveCopy.appendChild(sourceNote);
    }
  }

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
    applyKoreanDiscography();
    setupReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshEraInterface, { once: true });
  } else {
    refreshEraInterface();
  }
})();
