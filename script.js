const members = [
  { name: 'Gaeul', code: 'STAR-01', signal: 'Quiet charisma with a sharp performance edge.', className: 'Precision', tone: 'Violet', frequency: '91.4', era: 'AFTER LIKE', a: 'rgba(182, 112, 255, .48)', b: 'rgba(80, 180, 255, .22)' },
  { name: 'Yujin', code: 'STAR-02', signal: 'Bright leadership energy at the center of the formation.', className: 'Command', tone: 'Magenta', frequency: '98.2', era: 'I AM', a: 'rgba(255, 113, 196, .46)', b: 'rgba(255, 178, 105, .18)' },
  { name: 'Rei', code: 'STAR-03', signal: 'Distinctive tone, playful style, and creative expression.', className: 'Expression', tone: 'Cyan', frequency: '94.7', era: 'LOVE DIVE', a: 'rgba(94, 218, 255, .4)', b: 'rgba(163, 102, 255, .22)' },
  { name: 'Wonyoung', code: 'STAR-04', signal: 'Refined confidence and unmistakable visual presence.', className: 'Radiance', tone: 'Rose', frequency: '99.1', era: 'LOVE DIVE', a: 'rgba(255, 159, 222, .48)', b: 'rgba(146, 107, 255, .2)' },
  { name: 'Liz', code: 'STAR-05', signal: 'Warm vocal color carried through a luminous stage aura.', className: 'Resonance', tone: 'Gold', frequency: '96.6', era: 'ELEVEN', a: 'rgba(255, 201, 115, .35)', b: 'rgba(255, 102, 191, .2)' },
  { name: 'Leeseo', code: 'STAR-06', signal: 'Fearless momentum and a fresh, high-energy spark.', className: 'Momentum', tone: 'Mint', frequency: '93.8', era: 'I AM', a: 'rgba(109, 255, 205, .3)', b: 'rgba(106, 121, 255, .22)' }
];

const eras = [
  { year: '2021', name: 'ELEVEN', copy: 'The first signal: elegant, mysterious, and impossible to ignore.', tags: ['Debut', 'Elegant', 'Hypnotic'], coordinate: 'ORBIT 001' },
  { year: '2022', name: 'LOVE DIVE', copy: 'A confident invitation into a polished world of self-love and allure.', tags: ['Iconic', 'Dreamlike', 'Confidence'], coordinate: 'ORBIT 002' },
  { year: '2022', name: 'AFTER LIKE', copy: 'Disco light, bold emotion, and an era built for celebration.', tags: ['Disco', 'Radiant', 'Festival'], coordinate: 'ORBIT 003' },
  { year: '2023', name: "I'VE IVE", copy: 'A wider universe—more colors, more dimensions, and unmistakable identity.', tags: ['Full album', 'Expansive', 'Editorial'], coordinate: 'ORBIT 004' },
  { year: '2023', name: "I'VE MINE", copy: 'Multiple perspectives converge in a cinematic chapter of the archive.', tags: ['Cinematic', 'Duality', 'Atmosphere'], coordinate: 'ORBIT 005' },
  { year: 'NOW', name: 'LATEST SIGNAL', copy: 'An editable destination reserved for the newest comeback and its visual world.', tags: ['Current era', 'Update me', 'Featured'], coordinate: 'ORBIT 006' }
];

const mediaItems = [
  { type: 'Performance', category: 'performance', title: 'Cosmic Stage Archive', time: '04:18', label: 'Featured transmission' },
  { type: 'Music video', category: 'music-video', title: 'Visual Signal 01', time: '03:24', label: 'Official embed placeholder' },
  { type: 'Dance practice', category: 'practice', title: 'Formation Log', time: '03:51', label: 'Movement transmission' },
  { type: 'Interview', category: 'interview', title: 'Member Frequency', time: '11:06', label: 'Conversation archive' }
];

const mediaVault = [
  ...mediaItems,
  { type: 'Performance', category: 'performance', title: 'Orbit Stage 02', time: '03:42', label: 'Stage placeholder' },
  { type: 'Music video', category: 'music-video', title: 'Visual Signal 02', time: '03:18', label: 'Official embed placeholder' },
  { type: 'Dance practice', category: 'practice', title: 'Formation Log 02', time: '04:02', label: 'Movement transmission' },
  { type: 'Interview', category: 'interview', title: 'Archive Conversation', time: '09:44', label: 'Conversation archive' }
];

const songs = ['ELEVEN', 'LOVE DIVE', 'AFTER LIKE', 'I AM', 'Kitsch', 'Either Way', 'Off The Record', 'Baddie', 'HEYA', 'Accendio'];

const fanSignals = [
  { message: 'Every era feels like opening a new room in the same universe.', user: 'DIVE_011', location: 'Seoul signal' },
  { message: 'The archive needs a styling timeline next. Every look deserves its own coordinate.', user: 'ORBIT_602', location: 'Tokyo signal' },
  { message: 'Six different colors, but the constellation always feels complete.', user: 'STAR_204', location: 'Paris signal' },
  { message: 'Waiting for the next transmission with my lightstick fully charged.', user: 'DIVE_404', location: 'Manila signal' }
];

const $ = (selector, scope = document) => scope?.querySelector(selector) ?? null;
const $$ = (selector, scope = document) => scope ? [...scope.querySelectorAll(selector)] : [];

function createStarfield() {
  const field = $('#starfield');
  if (!field) return;
  const count = Math.min(100, Math.floor(window.innerWidth / 12));
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement('span');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--opacity', (Math.random() * 0.6 + 0.15).toFixed(2));
    star.style.setProperty('--duration', `${Math.random() * 5 + 3}s`);
    star.style.animationDelay = `${Math.random() * -5}s`;
    fragment.appendChild(star);
  }
  field.replaceChildren(fragment);
}

function setActiveRoute() {
  const page = document.documentElement.dataset.page || 'index';
  $$('[data-route]').forEach((link) => {
    if (link.dataset.route === page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function memberCard(member, index) {
  return `
    <article class="member-card reveal" style="--member-a:${member.a};--member-b:${member.b}">
      <div class="member-art" aria-hidden="true"></div>
      <div class="member-info">
        <div class="member-code"><span>${member.code}</span><span>0${index + 1}/06</span></div>
        <h3>${member.name}</h3>
        <div class="member-reveal"><p>${member.signal}</p></div>
      </div>
      <a class="member-focus" href="members.html?member=${index + 1}" aria-label="Open ${member.name} dossier"></a>
    </article>`;
}

function renderMembers() {
  const grid = $('[data-member-grid]');
  if (!grid) return;
  grid.innerHTML = members.map(memberCard).join('');
}

function renderDossierList() {
  const list = $('[data-dossier-list]');
  if (!list) return;
  list.innerHTML = members.map((member, index) => `
    <button class="dossier-button" type="button" role="listitem" aria-pressed="${index === 0}" data-dossier-index="${index}">
      <span>0${index + 1}</span>
      <strong>${member.name}</strong>
      <small>${member.code}</small>
    </button>`).join('');

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-dossier-index]');
    if (!button) return;
    selectMember(Number(button.dataset.dossierIndex));
  });

  const requested = Number(new URLSearchParams(window.location.search).get('member')) - 1;
  selectMember(Number.isInteger(requested) && requested >= 0 && requested < members.length ? requested : 0);
}

function selectMember(index) {
  const member = members[index];
  const panel = $('[data-member-profile]');
  if (!member || !panel) return;

  $$('.dossier-button').forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === index)));
  $('[data-profile-name]')?.replaceChildren(document.createTextNode(member.name));
  $('[data-profile-code]')?.replaceChildren(document.createTextNode(member.code));
  $('[data-profile-coordinate]')?.replaceChildren(document.createTextNode(`Coordinate 0${index + 1} / 06`));
  $('[data-profile-signal]')?.replaceChildren(document.createTextNode(member.signal));
  $('[data-profile-class]')?.replaceChildren(document.createTextNode(member.className));
  $('[data-profile-tone]')?.replaceChildren(document.createTextNode(member.tone));
  $('[data-profile-frequency]')?.replaceChildren(document.createTextNode(member.frequency));
  const visual = $('[data-profile-visual]');
  if (visual) {
    visual.style.setProperty('--profile-a', member.a);
    visual.style.setProperty('--profile-b', member.b);
  }
  const result = $('[data-profile-result]');
  if (result) result.textContent = 'Profile synchronized.';
  panel.dataset.activeMember = String(index);
}

function renderEras() {
  const tabs = $('[data-era-tabs]');
  if (!tabs) return;
  tabs.innerHTML = eras.map((era, index) => `
    <button class="era-tab" type="button" role="tab" aria-selected="${index === 0}" data-era-index="${index}">
      <span class="era-tab-dot" aria-hidden="true"></span>
      <strong>${era.name}</strong>
      <small>${era.year}</small>
    </button>`).join('');

  tabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-era-index]');
    if (!button) return;
    selectEra(Number(button.dataset.eraIndex));
  });
  selectEra(0);
}

function selectEra(index) {
  const era = eras[index];
  if (!era || !$('[data-era-name]')) return;
  $$('.era-tab').forEach((tab, tabIndex) => tab.setAttribute('aria-selected', String(tabIndex === index)));
  const indexNode = $('[data-era-number]') || $('.era-index');
  if (indexNode) indexNode.textContent = String(index + 1).padStart(2, '0');
  $('[data-era-year]')?.replaceChildren(document.createTextNode(era.year));
  $('[data-era-name]')?.replaceChildren(document.createTextNode(era.name));
  $('[data-era-copy]')?.replaceChildren(document.createTextNode(era.copy));
  $('[data-era-planet]')?.replaceChildren(document.createTextNode(String(index + 1).padStart(2, '0')));
  const tags = $('[data-era-tags]');
  if (tags) tags.innerHTML = era.tags.map((tag) => `<span>${tag}</span>`).join('');
}

function renderEraArchive() {
  const grid = $('[data-era-archive]');
  if (!grid) return;
  grid.innerHTML = eras.map((era, index) => `
    <article class="era-archive-card reveal">
      <div class="archive-card-orb" aria-hidden="true"><span>0${index + 1}</span></div>
      <p>${era.coordinate} · ${era.year}</p>
      <h3>${era.name}</h3>
      <p>${era.copy}</p>
      <div class="era-tags">${era.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
      <button type="button" data-jump-era="${index}">Load coordinate ↗</button>
    </article>`).join('');

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-jump-era]');
    if (!button) return;
    selectEra(Number(button.dataset.jumpEra));
    $('[data-era-tabs]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function updateFeaturedMedia(item, index = 0) {
  if (!item) return;
  $$('.media-item').forEach((node, nodeIndex) => node.setAttribute('aria-current', String(nodeIndex === index)));
  $('[data-featured-type]')?.replaceChildren(document.createTextNode(item.type));
  $('[data-featured-title]')?.replaceChildren(document.createTextNode(item.title));
  $('[data-featured-time]')?.replaceChildren(document.createTextNode(item.time));
  $('[data-featured-label]')?.replaceChildren(document.createTextNode(item.label));
}

function renderMedia() {
  const list = $('[data-media-list]');
  if (!list) return;
  list.innerHTML = mediaItems.map((item, index) => `
    <button class="media-item" type="button" role="listitem" aria-current="${index === 0}" data-media-index="${index}">
      <span class="media-item-index">0${index + 1}</span>
      <span><strong>${item.title}</strong><small>${item.type}</small></span>
      <span class="media-item-time">${item.time}</span>
    </button>`).join('');

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-media-index]');
    if (!button) return;
    updateFeaturedMedia(mediaItems[Number(button.dataset.mediaIndex)], Number(button.dataset.mediaIndex));
  });
}

function renderVault(filter = 'all') {
  const grid = $('[data-vault-grid]');
  if (!grid) return;
  const items = filter === 'all' ? mediaVault : mediaVault.filter((item) => item.category === filter);
  grid.innerHTML = items.map((item, index) => `
    <article class="vault-card reveal">
      <div class="vault-visual" aria-hidden="true"><span>${String(index + 1).padStart(2, '0')}</span></div>
      <p>${item.type} · ${item.time}</p>
      <h3>${item.title}</h3>
      <button type="button" data-vault-title="${item.title}">Queue transmission ↗</button>
    </article>`).join('');
  setupReveal();
}

function renderBiasOptions() {
  const select = $('[data-bias-select]');
  if (!select) return;
  select.innerHTML = `<option value="">Choose a member</option>${members.map((member) => `<option value="${member.name}">${member.name}</option>`).join('')}`;
}

function renderSignals() {
  const feed = $('[data-signal-feed]');
  if (!feed) return;
  feed.innerHTML = fanSignals.map((signal, index) => `
    <article class="signal-card">
      <span class="eyebrow compact"><span></span>Signal 0${index + 1}</span>
      <p>“${signal.message}”</p>
      <footer><span>${signal.user}</span><span>${signal.location}</span></footer>
    </article>`).join('');
}

function setupInteractions() {
  const header = $('[data-header]');
  const menuToggle = $('[data-menu-toggle]');
  const nav = $('[data-nav]');
  const motionToggle = $('[data-motion-toggle]');
  const motionFooter = $('[data-motion-toggle-footer]');
  const motionLabel = $('[data-motion-label]');
  let motionOff = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateMotion = () => {
    document.documentElement.classList.toggle('motion-off', motionOff);
    motionToggle?.setAttribute('aria-pressed', String(motionOff));
    if (motionLabel) motionLabel.textContent = motionOff ? 'Motion off' : 'Motion on';
  };
  const toggleMotion = () => { motionOff = !motionOff; updateMotion(); };
  motionToggle?.addEventListener('click', toggleMotion);
  motionFooter?.addEventListener('click', toggleMotion);
  updateMotion();

  window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 16), { passive: true });

  menuToggle?.addEventListener('click', () => {
    if (!nav) return;
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  $$('a', nav).forEach((link) => link.addEventListener('click', () => {
    nav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  $('[data-play-button]')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    button.setAttribute('aria-label', 'Prototype preview selected');
    button.style.transform = 'scale(.92)';
    setTimeout(() => { button.style.transform = ''; }, 220);
  });

  $('[data-song-picker]')?.addEventListener('click', () => {
    const result = $('[data-song-result]');
    if (!result) return;
    const available = songs.filter((song) => song !== result.textContent);
    result.textContent = available[Math.floor(Math.random() * available.length)];
  });

  $('[data-quiz-options]')?.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    $$('.quiz-options button').forEach((node) => node.classList.toggle('active', node === button));
    const resultMap = {
      glamour: 'Your signal matches LOVE DIVE: poised, magnetic, and self-assured.',
      dream: "Your signal matches I'VE MINE: cinematic, reflective, and multidimensional.",
      power: 'Your signal matches I AM: ambitious, radiant, and ready for the highest point.'
    };
    const result = $('[data-quiz-result]');
    if (result) result.textContent = resultMap[button.dataset.quizValue];
  });

  $('[data-bias-generate]')?.addEventListener('click', () => {
    const selected = $('[data-bias-select]')?.value;
    const card = $('[data-bias-card]');
    if (!card) return;
    if (!selected) {
      $('strong', card).textContent = 'Choose a member';
      $('small', card).textContent = 'Archive ID · 000000';
      return;
    }
    const id = String(Math.floor(100000 + Math.random() * 900000));
    $('strong', card).textContent = `${selected} Signal`;
    $('small', card).textContent = `Archive ID · ${id}`;
  });

  $('[data-profile-era]')?.addEventListener('click', () => {
    const panel = $('[data-member-profile]');
    const member = members[Number(panel?.dataset.activeMember || 0)];
    const result = $('[data-profile-result]');
    if (result && member) result.textContent = `Signature scan: ${member.era}.`;
  });

  $$('.filter-bar [data-media-filter]').forEach((button) => button.addEventListener('click', () => {
    $$('.filter-bar [data-media-filter]').forEach((node) => node.classList.toggle('active', node === button));
    renderVault(button.dataset.mediaFilter);
  }));

  $('[data-vault-grid]')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-vault-title]');
    if (!button) return;
    button.textContent = 'Queued ✓';
    setTimeout(() => { button.textContent = 'Queue transmission ↗'; }, 1200);
  });

  $('[data-signal-form]')?.addEventListener('submit', (event) => event.preventDefault());
}

let revealObserver;
function setupReveal() {
  const targets = $$('.reveal:not(.visible)');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('visible'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }
  targets.forEach((target) => revealObserver.observe(target));
}

function init() {
  createStarfield();
  setActiveRoute();
  renderMembers();
  renderDossierList();
  renderEras();
  renderEraArchive();
  renderMedia();
  renderVault();
  renderBiasOptions();
  renderSignals();
  setupInteractions();
  setupReveal();
}

init();
