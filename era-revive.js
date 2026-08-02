(() => {
  const styleSheets = ['era-korean-discography.css', 'ive-discography.css'];
  styleSheets.forEach((href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = href;
    document.head.appendChild(style);
  });

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

  const koreanReleases = [
    { date: '2026.02.23', title: 'REVIVE+', type: '2nd full album', lead: 'BLACKHOLE · BANG BANG' },
    { date: '2025.08.25', title: 'IVE SECRET', type: '4th EP', lead: 'XOXZ' },
    { date: '2025.02.03', title: 'IVE EMPATHY', type: '3rd EP', lead: 'REBEL HEART · ATTITUDE' },
    { date: '2024.04.29', title: 'IVE SWITCH', type: '2nd EP', lead: 'HEYA · Accendio' },
    { date: '2023.10.13', title: 'I’VE MINE', type: '1st EP', lead: 'Baddie · Off The Record · Either Way' },
    { date: '2023.04.10', title: 'I’ve IVE', type: '1st full album', lead: 'I AM · Kitsch' },
    { date: '2022.08.22', title: 'After LIKE', type: '3rd single album', lead: 'After LIKE' },
    { date: '2022.04.05', title: 'LOVE DIVE', type: '2nd single album', lead: 'LOVE DIVE' },
    { date: '2021.12.01', title: 'ELEVEN', type: '1st single album', lead: 'ELEVEN' }
  ];

  const japaneseReleases = [
    { date: '2026.05.27', title: 'LUCID DREAM', type: 'Japan 4th EP', lead: 'LUCID DREAM' },
    { date: '2025.07.30', title: 'Be Alright', type: 'Japan 3rd EP', lead: 'Be Alright' },
    { date: '2024.08.28', title: 'ALIVE', type: 'Japan 2nd EP', lead: 'CRUSH' },
    { date: '2023.05.31', title: 'WAVE', type: 'Japan 1st EP', lead: 'WAVE' },
    { date: '2022.10.19', title: 'ELEVEN -Japanese ver.-', type: 'Japan 1st single', lead: 'ELEVEN -Japanese ver.-' }
  ];

  const digitalSingles = [
    { date: '2026.04.03', title: 'Fashion', type: 'Japanese digital single', lead: 'LUCID DREAM pre-release' },
    { date: '2025.04.21', title: 'DARE ME', type: 'Japanese digital single', lead: 'Be Alright pre-release' },
    { date: '2024.11.08', title: 'Supernova Love', type: 'Collaboration single', lead: 'with David Guetta' },
    { date: '2024.06.28', title: 'SUMMER FESTA', type: 'Promotional single', lead: 'Pepsi campaign' },
    { date: '2024.04.12', title: 'Will', type: 'Japanese digital single', lead: 'Pokémon opening theme' },
    { date: '2024.01.19', title: 'All Night', type: 'English single', lead: 'feat. Saweetie' },
    { date: '2023.07.13', title: 'I WANT', type: 'Promotional single', lead: 'Pepsi campaign' },
    { date: '2023.01.16', title: 'LOVE DIVE -Japanese ver.-', type: 'Japanese digital single', lead: 'Digital release' }
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

  function releaseRows(releases) {
    return releases.map((release) => `
      <li class="discography-row">
        <time datetime="${release.date.replaceAll('.', '-')}">${release.date}</time>
        <div class="discography-release">
          <strong>${release.title}</strong>
          <span>${release.type}</span>
        </div>
        <div class="discography-lead">
          ${release.lead}
          <span>Lead release</span>
        </div>
      </li>`).join('');
  }

  function renderCompleteDiscography() {
    if (document.documentElement.dataset.page !== 'eras') return;
    if (document.querySelector('[data-complete-discography]')) return;

    const archiveSection = document.querySelector('[data-era-archive]')?.closest('section');
    if (!archiveSection) return;

    const section = document.createElement('section');
    section.className = 'page-section section-shell discography-section';
    section.dataset.completeDiscography = '';
    section.setAttribute('aria-labelledby', 'discography-title');
    section.innerHTML = `
      <div class="section-heading discography-heading reveal">
        <div>
          <p class="eyebrow"><span></span> Complete catalog</p>
          <h2 id="discography-title">Albums &amp; singles.</h2>
        </div>
        <p>A chronological release index covering IVE’s Korean catalog, Japanese physical releases, and official standalone digital or collaboration singles.</p>
      </div>

      <div class="discography-summary reveal" aria-label="Discography totals">
        <div><strong>${koreanReleases.length}</strong><span>Korean releases</span></div>
        <div><strong>${japaneseReleases.length}</strong><span>Japanese releases</span></div>
        <div><strong>${digitalSingles.length}</strong><span>Digital &amp; special singles</span></div>
      </div>

      <div class="discography-grid">
        <article class="discography-panel reveal">
          <header>
            <div>
              <h3>Korean catalog</h3>
              <p>Full albums, EPs, and single albums.</p>
            </div>
            <a class="discography-source" href="https://www.starship-ent.com/musician/ive" target="_blank" rel="noreferrer">Official source ↗</a>
          </header>
          <ol class="discography-list">${releaseRows(koreanReleases)}</ol>
        </article>

        <article class="discography-panel reveal">
          <header>
            <div>
              <h3>Japanese catalog</h3>
              <p>Physical singles and EPs.</p>
            </div>
            <a class="discography-source" href="https://ive-official.jp/mob/news/diarKiji.php?cd=DISCOGRAPHY&amp;site=DIVE" target="_blank" rel="noreferrer">Official source ↗</a>
          </header>
          <ol class="discography-list">${releaseRows(japaneseReleases)}</ol>
        </article>

        <article class="discography-panel discography-panel--wide reveal">
          <header>
            <div>
              <h3>Digital &amp; special singles</h3>
              <p>Standalone Japanese, English, promotional, and collaboration releases.</p>
            </div>
            <a class="discography-source" href="https://ive-official.jp/mob/news/diarKiji.php?cd=DISCOGRAPHY&amp;ct=DIGITAL&amp;site=DIVE" target="_blank" rel="noreferrer">Official source ↗</a>
          </header>
          <ol class="discography-list">${releaseRows(digitalSingles)}</ol>
          <p class="discography-note">Album tracks with an advance campaign but no separate official discography entry remain listed with their parent album rather than being duplicated here.</p>
        </article>
      </div>`;

    archiveSection.before(section);
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
    renderCompleteDiscography();
    setupReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshEraInterface, { once: true });
  } else {
    refreshEraInterface();
  }
})();
