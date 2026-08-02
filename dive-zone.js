(() => {
  if (document.documentElement.dataset.page !== 'dive-zone') return;

  const KEYS = {
    passport: 'ive-dive-passport-v1',
    quiz: 'ive-dive-resonance-v1',
    missions: 'ive-dive-missions-v1',
    signals: 'ive-dive-signal-log-v1'
  };

  const MEMBERS = ['All members', 'Gaeul', 'Yujin', 'Rei', 'Wonyoung', 'Liz', 'Leeseo'];
  const ERAS = ['ELEVEN', 'LOVE DIVE', 'AFTER LIKE', 'I’ve IVE', 'I’VE MINE', 'IVE SWITCH', 'IVE EMPATHY', 'IVE SECRET', 'REVIVE+'];
  const TONES = [
    { id: 'violet', label: 'Violet', a: '#b870ff', b: '#6bcfff' },
    { id: 'rose', label: 'Rose', a: '#ff79c8', b: '#a777ff' },
    { id: 'cyan', label: 'Cyan', a: '#61d9ff', b: '#746dff' },
    { id: 'gold', label: 'Gold', a: '#ffd07b', b: '#ff82bd' },
    { id: 'mint', label: 'Mint', a: '#74f0cf', b: '#74a6ff' },
    { id: 'silver', label: 'Silver', a: '#e6e2f2', b: '#8c82b8' }
  ];

  const FALLBACK_VIDEOS = [
    { id: '1Lmy7qwmSMc', title: 'BLACKHOLE', type: 'Music video', date: '2026.02.23', era: 'REVIVE+', categories: ['music-video'] },
    { id: '9qkpcLK422o', title: 'BANG BANG', type: 'Music video', date: '2026.02.09', era: 'REVIVE+', categories: ['music-video'] },
    { id: 'B1ShLiq3EVc', title: 'XOXZ', type: 'Music video', date: '2025.08.25', era: 'IVE SECRET', categories: ['music-video'] },
    { id: '38xYeot-ciM', title: 'ATTITUDE', type: 'Music video', date: '2025.02.03', era: 'IVE EMPATHY', categories: ['music-video'] },
    { id: 'g36q0ZLvygQ', title: 'REBEL HEART', type: 'Music video', date: '2025.01.13', era: 'IVE EMPATHY', categories: ['music-video'] },
    { id: 'PGLx4V680J8', title: 'Accendio', type: 'Music video', date: '2024.05.15', era: 'IVE SWITCH', categories: ['music-video'] },
    { id: '07EzMbVH3QE', title: 'HEYA', type: 'Music video', date: '2024.04.29', era: 'IVE SWITCH', categories: ['music-video'] },
    { id: 'Da4P2uT4mVc', title: 'Baddie', type: 'Music video', date: '2023.10.13', era: 'I’VE MINE', categories: ['music-video'] },
    { id: '6ZUIwj3FgUY', title: 'I AM', type: 'Music video', date: '2023.04.10', era: 'I’ve IVE', categories: ['music-video'] },
    { id: 'Y8JFxS1HlDo', title: 'LOVE DIVE', type: 'Music video', date: '2022.04.05', era: 'LOVE DIVE', categories: ['music-video'] }
  ];

  const QUIZ_QUESTIONS = [
    {
      prompt: 'Choose the opening scene that feels most like you.',
      answers: [
        ['A mirrored hall with perfect composure', 'allure'],
        ['A city skyline just before sunrise', 'ambition'],
        ['A glowing dance floor at midnight', 'radiance'],
        ['A strange new world coming back online', 'rebirth']
      ]
    },
    {
      prompt: 'What should the chorus make you feel?',
      answers: [
        ['Magnetic and untouchable', 'allure'],
        ['Fearless enough to go higher', 'ambition'],
        ['Bright enough to pull everyone in', 'radiance'],
        ['Recharged after disappearing for a while', 'rebirth']
      ]
    },
    {
      prompt: 'Pick the visual detail you notice first.',
      answers: [
        ['Elegant symmetry and sharp styling', 'allure'],
        ['A wide shot that makes the world feel huge', 'ambition'],
        ['Color, movement, and celebration', 'radiance'],
        ['Hidden codes and science-fiction details', 'rebirth']
      ]
    },
    {
      prompt: 'Your current signal is closest to…',
      answers: [
        ['Quiet confidence', 'allure'],
        ['Forward momentum', 'ambition'],
        ['Open-hearted energy', 'radiance'],
        ['A complete reset with memory intact', 'rebirth']
      ]
    }
  ];

  const QUIZ_RESULTS = {
    allure: {
      era: 'LOVE DIVE',
      copy: 'Poised, magnetic, and self-assured. Your signal is strongest when restraint and confidence work together.'
    },
    ambition: {
      era: 'I AM',
      copy: 'Expansive, fearless, and aimed upward. Your signal grows when the next step feels bigger than the last.'
    },
    radiance: {
      era: 'AFTER LIKE',
      copy: 'Open, celebratory, and impossible to keep still. Your signal is built to turn a room into a shared moment.'
    },
    rebirth: {
      era: 'REVIVE+',
      copy: 'Restorative, futuristic, and connected. Your signal returns stronger by keeping every version of itself in orbit.'
    }
  };

  const MISSION_PROMPTS = [
    'Watch the full M/V and save one visual detail you noticed in the signal log.',
    'Choose the scene that best represents this era and describe it in one sentence.',
    'Focus on the final chorus and identify the performance detail that changes the energy.',
    'Pick one styling detail you would place in the Cosmic Archive permanently.',
    'Watch once without multitasking, then record the first image you remember.'
  ];

  const q = (selector, scope = document) => scope?.querySelector(selector) ?? null;
  const qa = (selector, scope = document) => scope ? [...scope.querySelectorAll(selector)] : [];

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The dashboard remains usable when storage is unavailable.
    }
  }

  function removeStored(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage is optional.
    }
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function toneById(id) {
    return TONES.find((tone) => tone.id === id) || TONES[0];
  }

  function setStatus(name, label, complete) {
    const node = q(`[data-dive-status="${name}"]`);
    if (!node) return;
    const value = q('strong', node);
    if (value) value.textContent = label;
    node.classList.toggle('is-complete', complete);
  }

  function populatePassportControls() {
    const bias = q('[data-dive-bias]');
    const era = q('[data-dive-era]');
    const tones = q('[data-dive-tones]');
    if (bias) bias.innerHTML = MEMBERS.map((member) => `<option value="${member}">${member}</option>`).join('');
    if (era) era.innerHTML = ERAS.map((item) => `<option value="${item}">${item}</option>`).join('');
    if (tones) {
      tones.innerHTML = TONES.map((tone, index) => `
        <button
          class="dive-tone-option"
          type="button"
          aria-label="${tone.label} signal tone"
          aria-pressed="${index === 0}"
          data-tone="${tone.id}"
          style="--tone-a:${tone.a};--tone-b:${tone.b}"></button>`).join('');
    }
  }

  function passportFromForm(existingId = '', generateId = true) {
    const name = q('[data-dive-name]')?.value.trim().slice(0, 20) || 'DIVE';
    const bias = q('[data-dive-bias]')?.value || MEMBERS[0];
    const era = q('[data-dive-era]')?.value || ERAS[0];
    const tone = q('[data-dive-tones] [aria-pressed="true"]')?.dataset.tone || TONES[0].id;
    const id = existingId || (generateId
      ? `DIVE-${String(hashString(`${name}|${bias}|${era}|${Date.now()}`) % 1000000).padStart(6, '0')}`
      : '');
    return { name, bias, era, tone, id };
  }

  function renderPassport(passport) {
    const tone = toneById(passport.tone);
    const card = q('[data-passport-card]');
    if (card) {
      card.style.setProperty('--passport-a', tone.a);
      card.style.setProperty('--passport-b', tone.b);
    }
    if (q('[data-passport-name]')) q('[data-passport-name]').textContent = passport.name || 'DIVE';
    if (q('[data-passport-meta]')) q('[data-passport-meta]').textContent = `${passport.bias || MEMBERS[0]} · ${passport.era || ERAS[0]}`;
    if (q('[data-passport-id]')) q('[data-passport-id]').textContent = passport.id || 'DIVE-000000';
    if (q('[data-passport-tone]')) q('[data-passport-tone]').textContent = `${tone.label} signal`;
    setStatus('passport', passport.id ? 'Passport online' : 'Not generated', Boolean(passport.id));
  }

  function restorePassport() {
    const saved = readJson(KEYS.passport, null);
    const defaults = saved || { name: 'DIVE', bias: MEMBERS[0], era: ERAS[0], tone: TONES[0].id, id: '' };
    const name = q('[data-dive-name]');
    if (name) name.value = saved?.name || '';
    if (q('[data-dive-bias]')) q('[data-dive-bias]').value = defaults.bias;
    if (q('[data-dive-era]')) q('[data-dive-era]').value = defaults.era;
    qa('[data-tone]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.tone === defaults.tone)));
    renderPassport(defaults);
  }

  function svgEscape(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  }

  function downloadPassport() {
    let passport = readJson(KEYS.passport, null);
    if (!passport) {
      passport = passportFromForm();
      writeJson(KEYS.passport, passport);
      renderPassport(passport);
    }
    const tone = toneById(passport.tone);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1620" height="1000" viewBox="0 0 1620 1000">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#171022"/><stop offset="1" stop-color="#07050d"/></linearGradient>
          <radialGradient id="glowA" cx="0" cy="1" r="1"><stop offset="0" stop-color="${tone.a}" stop-opacity=".72"/><stop offset="1" stop-color="${tone.a}" stop-opacity="0"/></radialGradient>
          <radialGradient id="glowB" cx="1" cy="0" r="1"><stop offset="0" stop-color="${tone.b}" stop-opacity=".72"/><stop offset="1" stop-color="${tone.b}" stop-opacity="0"/></radialGradient>
          <pattern id="grid" width="70" height="70" patternUnits="userSpaceOnUse"><path d="M70 0H0V70" fill="none" stroke="#ffffff" stroke-opacity=".045" stroke-width="2"/></pattern>
        </defs>
        <rect width="1620" height="1000" rx="70" fill="url(#bg)"/><rect width="1620" height="1000" rx="70" fill="url(#glowA)"/><rect width="1620" height="1000" rx="70" fill="url(#glowB)"/><rect width="1620" height="1000" rx="70" fill="url(#grid)"/>
        <rect x="3" y="3" width="1614" height="994" rx="67" fill="none" stroke="#ffffff" stroke-opacity=".42" stroke-width="6"/>
        <text x="100" y="125" fill="#eee4f5" fill-opacity=".75" font-family="Arial, sans-serif" font-size="32" font-weight="700" letter-spacing="8">IVE COSMIC ARCHIVE / DIVE ACCESS</text>
        <text x="100" y="535" fill="#ffffff" font-family="Arial, sans-serif" font-size="150" font-weight="800" letter-spacing="-8">${svgEscape(passport.name || 'DIVE')}</text>
        <text x="104" y="620" fill="#eee4f5" fill-opacity=".74" font-family="Arial, sans-serif" font-size="38">${svgEscape(passport.bias)} · ${svgEscape(passport.era)}</text>
        <text x="104" y="865" fill="#eee4f5" fill-opacity=".66" font-family="Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="5">${svgEscape(passport.id)}</text>
        <text x="1515" y="865" text-anchor="end" fill="#eee4f5" fill-opacity=".66" font-family="Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="5">${svgEscape(tone.label.toUpperCase())} SIGNAL</text>
        <text x="1245" y="560" text-anchor="middle" fill="#ffffff" fill-opacity=".92" font-family="Arial, sans-serif" font-size="330">♡</text>
      </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(passport.name || 'dive').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-dive-passport.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function setupPassport() {
    populatePassportControls();
    restorePassport();

    q('[data-dive-tones]')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tone]');
      if (!button) return;
      qa('[data-tone]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      const saved = readJson(KEYS.passport, null);
      renderPassport(passportFromForm(saved?.id || '', false));
    });

    q('[data-passport-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const existing = readJson(KEYS.passport, null);
      const passport = passportFromForm(existing?.id || '');
      writeJson(KEYS.passport, passport);
      renderPassport(passport);
    });

    q('[data-passport-download]')?.addEventListener('click', downloadPassport);
    q('[data-passport-reset]')?.addEventListener('click', () => {
      removeStored(KEYS.passport);
      if (q('[data-dive-name]')) q('[data-dive-name]').value = '';
      if (q('[data-dive-bias]')) q('[data-dive-bias]').value = MEMBERS[0];
      if (q('[data-dive-era]')) q('[data-dive-era]').value = ERAS[0];
      qa('[data-tone]').forEach((button, index) => button.setAttribute('aria-pressed', String(index === 0)));
      renderPassport({ name: 'DIVE', bias: MEMBERS[0], era: ERAS[0], tone: TONES[0].id, id: '' });
    });
  }

  const quizState = { step: 0, scores: { allure: 0, ambition: 0, radiance: 0, rebirth: 0 } };

  function showQuizResult(resultKey) {
    const result = QUIZ_RESULTS[resultKey] || QUIZ_RESULTS.allure;
    if (q('[data-quiz-body]')) q('[data-quiz-body]').hidden = true;
    if (q('[data-quiz-result]')) q('[data-quiz-result]').hidden = false;
    if (q('[data-quiz-result-era]')) q('[data-quiz-result-era]').textContent = result.era;
    if (q('[data-quiz-result-copy]')) q('[data-quiz-result-copy]').textContent = result.copy;
    setStatus('resonance', result.era, true);
  }

  function renderQuizStep() {
    const question = QUIZ_QUESTIONS[quizState.step];
    const options = q('[data-quiz-options]');
    if (!question || !options) return;
    if (q('[data-quiz-step]')) q('[data-quiz-step]').textContent = `Question ${quizState.step + 1} / ${QUIZ_QUESTIONS.length}`;
    if (q('[data-quiz-question]')) q('[data-quiz-question]').textContent = question.prompt;
    if (q('[data-quiz-progress]')) q('[data-quiz-progress]').style.setProperty('--quiz-progress', `${((quizState.step + 1) / QUIZ_QUESTIONS.length) * 100}%`);
    options.innerHTML = question.answers.map(([label, profile]) => `<button class="dive-quiz-option" type="button" data-quiz-profile="${profile}">${label}</button>`).join('');
  }

  function restartQuiz() {
    quizState.step = 0;
    quizState.scores = { allure: 0, ambition: 0, radiance: 0, rebirth: 0 };
    if (q('[data-quiz-body]')) q('[data-quiz-body]').hidden = false;
    if (q('[data-quiz-result]')) q('[data-quiz-result]').hidden = true;
    renderQuizStep();
  }

  function setupQuiz() {
    const saved = readJson(KEYS.quiz, null);
    if (saved?.profile && QUIZ_RESULTS[saved.profile]) showQuizResult(saved.profile);
    else renderQuizStep();

    q('[data-quiz-options]')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-quiz-profile]');
      if (!button || !(button.dataset.quizProfile in quizState.scores)) return;
      quizState.scores[button.dataset.quizProfile] += 1;
      quizState.step += 1;
      if (quizState.step < QUIZ_QUESTIONS.length) {
        renderQuizStep();
        return;
      }
      const resultKey = Object.entries(quizState.scores).sort((left, right) => right[1] - left[1])[0][0];
      writeJson(KEYS.quiz, { profile: resultKey, completedAt: Date.now() });
      showQuizResult(resultKey);
    });

    q('[data-quiz-restart]')?.addEventListener('click', () => {
      removeStored(KEYS.quiz);
      setStatus('resonance', 'Scan pending', false);
      restartQuiz();
    });
  }

  function localDateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function missionCompleted() {
    return Boolean(readJson(KEYS.missions, {})[localDateKey()]);
  }

  function updateMissionButton() {
    const button = q('[data-mission-complete]');
    const complete = missionCompleted();
    if (button) {
      button.classList.toggle('is-complete', complete);
      button.textContent = complete ? 'Mission complete ✓' : 'Mark complete';
      button.setAttribute('aria-pressed', String(complete));
    }
    setStatus('mission', complete ? 'Completed today' : 'Mission active', complete);
  }

  function renderMission(video) {
    const today = new Date();
    const dateKey = localDateKey(today);
    const image = q('[data-mission-image]');
    if (image) {
      image.dataset.fallback = 'false';
      image.src = `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;
      image.alt = `${video.title} official music video thumbnail`;
      image.onerror = () => {
        if (image.dataset.fallback === 'true') return;
        image.dataset.fallback = 'true';
        image.onerror = null;
        image.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
      };
    }
    if (q('[data-mission-date]')) q('[data-mission-date]').textContent = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(today);
    if (q('[data-mission-title]')) q('[data-mission-title]').textContent = video.title;
    if (q('[data-mission-meta]')) q('[data-mission-meta]').textContent = `${video.type || 'Music video'} · ${video.date || video.era || 'Official archive'}`;
    if (q('[data-mission-prompt]')) q('[data-mission-prompt]').textContent = MISSION_PROMPTS[hashString(`${dateKey}:prompt`) % MISSION_PROMPTS.length];
    if (q('[data-mission-link]')) q('[data-mission-link]').href = `https://www.youtube.com/watch?v=${video.id}`;
    updateMissionButton();
  }

  function setupMission() {
    const today = localDateKey();
    fetch('/api/videos', { headers: { accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Catalog unavailable');
        return response.json();
      })
      .then((payload) => {
        const liveVideos = Array.isArray(payload.videos)
          ? payload.videos.filter((video) => Array.isArray(video.categories) && video.categories.includes('music-video'))
          : [];
        const catalog = liveVideos.length ? liveVideos : FALLBACK_VIDEOS;
        renderMission(catalog[hashString(today) % catalog.length]);
      })
      .catch(() => renderMission(FALLBACK_VIDEOS[hashString(today) % FALLBACK_VIDEOS.length]));

    q('[data-mission-complete]')?.addEventListener('click', () => {
      const completed = readJson(KEYS.missions, {});
      const key = localDateKey();
      if (completed[key]) delete completed[key];
      else completed[key] = Date.now();
      writeJson(KEYS.missions, completed);
      updateMissionButton();
    });
  }

  function signalDate(timestamp) {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp));
  }

  function renderSignals() {
    const feed = q('[data-local-signal-feed]');
    if (!feed) return;
    const signals = readJson(KEYS.signals, []);
    feed.replaceChildren();

    if (!signals.length) {
      const empty = document.createElement('p');
      empty.className = 'dive-signal-empty';
      empty.textContent = 'Your private signal log is empty.';
      feed.append(empty);
    }

    signals.forEach((signal) => {
      const card = document.createElement('article');
      card.className = 'dive-signal-card';
      const copy = document.createElement('div');
      const meta = document.createElement('span');
      meta.className = 'dive-signal-meta';
      meta.textContent = `${signal.mood} · ${signalDate(signal.createdAt)}`;
      const message = document.createElement('p');
      message.textContent = signal.message;
      copy.append(meta, message);
      const remove = document.createElement('button');
      remove.className = 'dive-signal-delete';
      remove.type = 'button';
      remove.dataset.deleteSignal = signal.id;
      remove.setAttribute('aria-label', 'Delete signal');
      remove.textContent = '×';
      card.append(copy, remove);
      feed.append(card);
    });

    setStatus('signals', signals.length ? `${signals.length} saved` : 'Log empty', signals.length > 0);
  }

  function setupSignals() {
    const message = q('[data-signal-message]');
    const counter = q('[data-signal-count]');
    const updateCount = () => {
      if (counter && message) counter.textContent = `${message.value.length} / 240`;
    };
    message?.addEventListener('input', updateCount);
    updateCount();

    q('[data-local-signal-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = message?.value.trim().slice(0, 240) || '';
      if (!text) {
        message?.focus();
        return;
      }
      const signals = readJson(KEYS.signals, []);
      signals.unshift({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        message: text,
        mood: q('[data-signal-mood]')?.value || 'Open signal',
        createdAt: Date.now()
      });
      writeJson(KEYS.signals, signals.slice(0, 12));
      if (message) message.value = '';
      updateCount();
      renderSignals();
    });

    q('[data-local-signal-feed]')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-delete-signal]');
      if (!button) return;
      writeJson(KEYS.signals, readJson(KEYS.signals, []).filter((signal) => signal.id !== button.dataset.deleteSignal));
      renderSignals();
    });

    q('[data-clear-signals]')?.addEventListener('click', () => {
      removeStored(KEYS.signals);
      renderSignals();
    });

    renderSignals();
  }

  setupPassport();
  setupQuiz();
  setupMission();
  setupSignals();
})();
