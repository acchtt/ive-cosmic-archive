const members = [
  { name: 'Gaeul', code: 'STAR-01', signal: 'Quiet charisma with a sharp performance edge.', a: 'rgba(182, 112, 255, .48)', b: 'rgba(80, 180, 255, .22)' },
  { name: 'Yujin', code: 'STAR-02', signal: 'Bright leadership energy at the center of the formation.', a: 'rgba(255, 113, 196, .46)', b: 'rgba(255, 178, 105, .18)' },
  { name: 'Rei', code: 'STAR-03', signal: 'Distinctive tone, playful style, and creative expression.', a: 'rgba(94, 218, 255, .4)', b: 'rgba(163, 102, 255, .22)' },
  { name: 'Wonyoung', code: 'STAR-04', signal: 'Refined confidence and unmistakable visual presence.', a: 'rgba(255, 159, 222, .48)', b: 'rgba(146, 107, 255, .2)' },
  { name: 'Liz', code: 'STAR-05', signal: 'Warm vocal color carried through a luminous stage aura.', a: 'rgba(255, 201, 115, .35)', b: 'rgba(255, 102, 191, .2)' },
  { name: 'Leeseo', code: 'STAR-06', signal: 'Fearless momentum and a fresh, high-energy spark.', a: 'rgba(109, 255, 205, .3)', b: 'rgba(106, 121, 255, .22)' }
];

const eras = [
  { year: '2021', name: 'ELEVEN', copy: 'The first signal: elegant, mysterious, and impossible to ignore.', tags: ['Debut', 'Elegant', 'Hypnotic'] },
  { year: '2022', name: 'LOVE DIVE', copy: 'A confident invitation into a polished world of self-love and allure.', tags: ['Iconic', 'Dreamlike', 'Confidence'] },
  { year: '2022', name: 'AFTER LIKE', copy: 'Disco light, bold emotion, and an era built for celebration.', tags: ['Disco', 'Radiant', 'Festival'] },
  { year: '2023', name: "I'VE IVE", copy: 'A wider universe—more colors, more dimensions, and unmistakable identity.', tags: ['Full album', 'Expansive', 'Editorial'] },
  { year: '2023', name: "I'VE MINE", copy: 'Multiple perspectives converge in a cinematic chapter of the archive.', tags: ['Cinematic', 'Duality', 'Atmosphere'] },
  { year: 'NOW', name: 'LATEST SIGNAL', copy: 'An editable destination reserved for the newest comeback and its visual world.', tags: ['Current era', 'Update me', 'Featured'] }
];

const mediaItems = [
  { type: 'Performance', title: 'Cosmic Stage Archive', time: '04:18', label: 'Featured transmission' },
  { type: 'Music video', title: 'Visual Signal 01', time: '03:24', label: 'Official embed placeholder' },
  { type: 'Dance practice', title: 'Formation Log', time: '03:51', label: 'Movement transmission' },
  { type: 'Interview', title: 'Member Frequency', time: '11:06', label: 'Conversation archive' }
];

const songs = ['ELEVEN', 'LOVE DIVE', 'AFTER LIKE', 'I AM', 'Kitsch', 'Either Way', 'Off The Record', 'Baddie', 'HEYA', 'Accendio'];

const fanSignals = [
  { message: 'Every era feels like opening a new room in the same universe.', user: 'DIVE_011', location: 'Seoul signal' },
  { message: 'The archive needs a styling timeline next. Every look deserves its own coordinate.', user: 'ORBIT_602', location: 'Tokyo signal' },
  { message: 'Six different colors, but the constellation always feels complete.', user: 'STAR_204', location: 'Paris signal' },
  { message: 'Waiting for the next transmission with my lightstick fully charged.', user: 'DIVE_404', location: 'Manila signal' }
];

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

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

function renderMembers() {
  const grid = $('[data-member-grid]');
  if (!grid) return;
  grid.innerHTML = members.map((member, index) => `
    <article class="member-card reveal" style="--member-a:${member.a};--member-b:${member.b}">
      <div class="member-art" aria-hidden="true"></div>
      <div class="member-info">
        <div class="member-code"><span>${member.code}</span><span>0${index + 1}/06</span></div>
        <h3>${member.name}</h3>
        <div class="member-reveal"><p>${member.signal}</p></div>
      </div>
      <button class="member-focus" type="button" aria-label="Open ${member.name} profile preview"></button>
    </article>
  `).join('');
}

function renderEras() {
  const tabs = $('[data-era-tabs]');
  if (!tabs) return;
  tabs.innerHTML = eras.map((era, index) => `
    <button class="era-tab" type="button" role="tab" aria-selected="${index === 0}" data-era-index="${index}">
      <span class="era-tab-dot" aria-hidden="true"></span>
      <strong>${era.name}</strong>
      <small>${era.year}</small>
    </button>
  `).join('');

  tabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-era-index]');
    if (!button) return;
    selectEra(Number(button.dataset.eraIndex));
  });
}

function selectEra(index) {
  const era = eras[index];
  if (!era) return;
  $$('.era-tab').forEach((tab, tabIndex) => tab.setAttribute('aria-selected', String(tabIndex === index)));
  $('[data-era-index].era-index').textContent = String(index + 1).padStart(2, '0');
  $('[data-era-year]').textContent = era.year;
  $('[data-era-name]').textContent = era.name;
  $('[data-era-copy]').textContent = era.copy;
  $('[data-era-planet]').textContent = String(index + 1).padStart(2, '0');
  $('[data-era-tags]').innerHTML = era.tags.map((tag) => `<span>${tag}</span>`).join('');
}

function renderMedia() {
  const list = $('[data-media-list]');
  if (!list) return;
  list.innerHTML = mediaItems.map((item, index) => `
    <button class="media-item" type="button" role="listitem" aria-current="${index === 0}" data-media-index="${index}">
      <span class="media-item-index">0${index + 1}</span>
      <span><strong>${item.title}</strong><small>${item.type}</small></span>
      <span class="media-item-time">${item.time}</span>
    </button>
  `).join('');

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-media-index]');
    if (!button) return;
    const index = Number(button.dataset.mediaIndex);
    const item = mediaItems[index];
    $$('.media-item').forEach((node, nodeIndex) => node.setAttribute('aria-current', String(nodeIndex === index)));
    $('[data-featured-type]').textContent = item.type;
    $('[data-featured-title]').textContent = item.title;
    $('[data-featured-time]').textContent = item.time;
    $('[data-featured-label]').textContent = item.label;
  });
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
    </article>
  `).join('');
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
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  $$('a', nav).forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
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
    const current = result.textContent;
    const available = songs.filter((song) => song !== current);
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
    $('[data-quiz-result]').textContent = resultMap[button.dataset.quizValue];
  });

  $('[data-bias-generate]')?.addEventListener('click', () => {
    const selected = $('[data-bias-select]').value;
    const card = $('[data-bias-card]');
    if (!selected) {
      card.querySelector('strong').textContent = 'Choose a member';
      card.querySelector('small').textContent = 'Archive ID · 000000';
      return;
    }
    const id = String(Math.floor(100000 + Math.random() * 900000));
    card.querySelector('strong').textContent = `${selected} Signal`; 
    card.querySelector('small').textContent = `Archive ID · ${id}`;
  });

  $('[data-signal-form]')?.addEventListener('submit', (event) => event.preventDefault());
}

function setupReveal() {
  const targets = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach((target) => observer.observe(target));
}

function init() {
  createStarfield();
  renderMembers();
  renderEras();
  selectEra(0);
  renderMedia();
  renderBiasOptions();
  renderSignals();
  setupInteractions();
  setupReveal();
}

init();
