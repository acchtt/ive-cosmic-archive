from pathlib import Path

OLD = 'member-identity-compact-v50'
NEW = 'member-signature-reveal-v51'

version_files = [
    'album-theme-sync.js',
    'mobile-version-cardsets.js',
    'mobile-members-redesign.js',
    'home-revive.js',
    'index.html',
    'members.html',
]

for name in version_files:
    path = Path(name)
    text = path.read_text()
    if OLD not in text:
        raise SystemExit(f'Missing {OLD} in {name}')
    path.write_text(text.replace(OLD, NEW))

profile_js = Path('member-profile-details.js')
js = profile_js.read_text()
marker = '/* v51 signature-era reveal */'
if marker in js:
    raise SystemExit('v51 signature reveal already present')

js += r'''


/* v51 signature-era reveal */
(() => {
  const signatures = [
    {
      era: 'AFTER LIKE',
      title: 'Precision in motion.',
      copy: 'Controlled charisma, clean performance lines, and a sharper disco-era edge make AFTER LIKE the clearest match for GAEUL’s archive signal.',
      tags: ['Precision', 'Disco edge', 'Quiet impact']
    },
    {
      era: 'I AM',
      title: 'Command at full scale.',
      copy: 'Expansive stage presence, bright leadership energy, and forward momentum align YUJIN most strongly with the scale and confidence of I AM.',
      tags: ['Command', 'High altitude', 'Center energy']
    },
    {
      era: 'LOVE DIVE',
      title: 'Expression becomes identity.',
      copy: 'Distinctive tone, playful detail, and expressive styling converge most clearly in LOVE DIVE, where REI’s individual color reads instantly.',
      tags: ['Expression', 'Dreamlike', 'Playful detail']
    },
    {
      era: 'LOVE DIVE',
      title: 'Radiance, distilled.',
      copy: 'Poised confidence, refined visual language, and effortless presence make LOVE DIVE the strongest archive coordinate for WONYOUNG.',
      tags: ['Radiance', 'Poise', 'Iconic presence']
    },
    {
      era: 'ELEVEN',
      title: 'Resonance at first signal.',
      copy: 'Warm vocal color, luminous restraint, and the elegant tension of IVE’s debut give LIZ her clearest signature alignment in ELEVEN.',
      tags: ['Resonance', 'Warm tone', 'Elegant tension']
    },
    {
      era: 'I AM',
      title: 'Momentum unlocked.',
      copy: 'Fearless energy, bright attack, and a sense of constant forward motion place LEESEO most naturally inside the ambitious lift of I AM.',
      tags: ['Momentum', 'Fearless', 'Forward lift']
    }
  ];

  let scanTimer = 0;

  function activeIndex(panel) {
    const value = Number(panel?.dataset.activeMember ?? 0);
    return Number.isInteger(value) && value >= 0 && value < signatures.length ? value : 0;
  }

  function resetScan() {
    window.clearTimeout(scanTimer);
    const panel = document.querySelector('[data-member-profile]');
    const result = document.querySelector('[data-profile-result]');
    const button = document.querySelector('[data-profile-era]');
    if (!panel || !result || !button) return;

    delete panel.dataset.signatureState;
    result.hidden = true;
    result.removeAttribute('data-scan-state');
    result.removeAttribute('aria-busy');
    result.replaceChildren();
    button.disabled = false;
    button.textContent = 'Scan signature era';
  }

  function revealScan(panel, result, button, signature, index) {
    panel.dataset.signatureState = 'revealed';
    result.dataset.scanState = 'revealed';
    result.removeAttribute('aria-busy');
    result.innerHTML = `
      <span class="scan-result-head">
        <span class="scan-result-kicker"><span class="scan-result-dot" aria-hidden="true"></span>SIGNATURE ERA DETECTED</span>
        <span class="scan-result-code">STAR-${String(index + 1).padStart(2, '0')} · PRIMARY MATCH</span>
      </span>
      <strong class="scan-result-era">${signature.era}</strong>
      <span class="scan-result-title">${signature.title}</span>
      <span class="scan-result-copy">${signature.copy}</span>
      <span class="scan-result-tags">${signature.tags.map((tag) => `<span>${tag}</span>`).join('')}</span>`;
    button.disabled = false;
    button.textContent = 'Scan again';
  }

  function runScan(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const panel = document.querySelector('[data-member-profile]');
    const result = document.querySelector('[data-profile-result]');
    const button = document.querySelector('[data-profile-era]');
    if (!panel || !result || !button) return;

    const index = activeIndex(panel);
    const signature = signatures[index];
    window.clearTimeout(scanTimer);

    panel.dataset.signatureState = 'scanning';
    result.hidden = false;
    result.dataset.scanState = 'scanning';
    result.setAttribute('aria-busy', 'true');
    result.innerHTML = `
      <span class="scan-loading-line"><span aria-hidden="true"></span>ANALYZING MEMBER SIGNAL</span>
      <span class="scan-loading-sub">Cross-referencing archive class, tone, and era coordinate…</span>`;
    button.disabled = true;
    button.textContent = 'Scanning signal…';

    const reduced = document.documentElement.classList.contains('motion-off')
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scanTimer = window.setTimeout(
      () => revealScan(panel, result, button, signature, index),
      reduced ? 0 : 620
    );
  }

  function installSignatureReveal() {
    const panel = document.querySelector('[data-member-profile]');
    const button = document.querySelector('[data-profile-era]');
    if (!panel || !button || button.dataset.signatureRevealBound === 'true') return;

    button.dataset.signatureRevealBound = 'true';
    button.addEventListener('click', runScan, true);

    const observer = new MutationObserver(resetScan);
    observer.observe(panel, {
      attributes: true,
      attributeFilter: ['data-active-member']
    });
    resetScan();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installSignatureReveal, { once: true });
  } else {
    installSignatureReveal();
  }
})();
'''
profile_js.write_text(js)

profile_css = Path('member-profile-details.css')
css = profile_css.read_text()
css_marker = '/* v51 signature-era result */'
if css_marker in css:
    raise SystemExit('v51 signature result CSS already present')

css += r'''


/* v51 signature-era result */
html[data-page="members"] .profile-result[hidden] {
  display: none !important;
}

html[data-page="members"] .profile-result {
  width: 100%;
  min-width: 0;
  justify-self: stretch;
  box-sizing: border-box;
}

html[data-page="members"] .profile-result[data-scan-state="scanning"],
html[data-page="members"] .profile-result[data-scan-state="revealed"] {
  position: relative;
  overflow: hidden;
  display: grid;
  border: 1px solid color-mix(in srgb, var(--set-accent) 28%, rgba(255,255,255,.08));
  background:
    radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--set-accent) 16%, transparent), transparent 42%),
    color-mix(in srgb, var(--set-panel-strong) 94%, var(--set-bg));
  color: var(--set-paper);
  box-shadow: inset 0 1px rgba(255,255,255,.035);
}

html[data-page="members"] .profile-result[data-scan-state="scanning"] {
  min-height: 78px;
  padding: 16px 17px;
  align-content: center;
  gap: 7px;
  border-radius: 15px;
}

html[data-page="members"] .scan-loading-line {
  display: flex;
  align-items: center;
  gap: 9px;
  color: color-mix(in srgb, var(--set-paper) 88%, var(--set-accent));
  font-size: .59rem;
  font-weight: 820;
  letter-spacing: .13em;
}

html[data-page="members"] .scan-loading-line > span {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  border-radius: 50%;
  background: var(--set-accent);
  box-shadow: 0 0 16px color-mix(in srgb, var(--set-accent) 75%, transparent);
  animation: signature-scan-pulse .65s ease-in-out infinite alternate;
}

html[data-page="members"] .scan-loading-sub {
  color: var(--set-muted);
  font-size: .7rem;
  line-height: 1.4;
}

html[data-page="members"] .profile-result[data-scan-state="revealed"] {
  padding: 18px;
  gap: 0;
  border-radius: 18px;
  animation: signature-result-in .32s ease both;
}

html[data-page="members"] .profile-result[data-scan-state="revealed"]::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--set-accent), var(--set-accent-2));
  box-shadow: 0 0 18px color-mix(in srgb, var(--set-accent) 42%, transparent);
}

html[data-page="members"] .scan-result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

html[data-page="members"] .scan-result-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: color-mix(in srgb, var(--set-accent) 76%, var(--set-paper));
  font-size: .54rem;
  font-weight: 850;
  letter-spacing: .13em;
}

html[data-page="members"] .scan-result-dot {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: 50%;
  background: var(--set-accent);
  box-shadow: 0 0 14px color-mix(in srgb, var(--set-accent) 62%, transparent);
}

html[data-page="members"] .scan-result-code {
  flex: 0 0 auto;
  color: color-mix(in srgb, var(--set-muted) 72%, transparent);
  font-size: .46rem;
  font-weight: 760;
  letter-spacing: .1em;
  white-space: nowrap;
}

html[data-page="members"] .scan-result-era {
  display: block;
  margin-top: 14px;
  color: var(--set-paper);
  font-size: clamp(1.85rem, 7vw, 2.7rem);
  font-weight: 900;
  line-height: .95;
  letter-spacing: -.045em;
}

html[data-page="members"] .scan-result-title {
  display: block;
  margin-top: 7px;
  color: color-mix(in srgb, var(--set-paper) 88%, var(--set-accent));
  font-size: .82rem;
  font-weight: 760;
  letter-spacing: -.01em;
}

html[data-page="members"] .scan-result-copy {
  display: block;
  margin-top: 9px;
  max-width: 52ch;
  color: color-mix(in srgb, var(--set-muted) 90%, var(--set-paper));
  font-size: .78rem;
  line-height: 1.52;
}

html[data-page="members"] .scan-result-tags {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

html[data-page="members"] .scan-result-tags > span {
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--set-accent) 18%, rgba(255,255,255,.06));
  border-radius: 999px;
  background: color-mix(in srgb, var(--set-accent) 7%, transparent);
  color: color-mix(in srgb, var(--set-muted) 88%, var(--set-paper));
  font-size: .52rem;
  font-weight: 720;
  letter-spacing: .035em;
}

html[data-page="members"] [data-profile-era]:disabled {
  cursor: progress;
  filter: saturate(.72);
}

@keyframes signature-scan-pulse {
  from { opacity: .38; transform: scale(.82); }
  to { opacity: 1; transform: scale(1.14); }
}

@keyframes signature-result-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  html[data-page="members"] .profile-actions {
    gap: 10px !important;
  }

  html[data-page="members"] .profile-result[data-scan-state="revealed"] {
    padding: 16px 15px 15px 17px;
    border-radius: 15px;
  }

  html[data-page="members"] .scan-result-head {
    align-items: flex-start;
  }

  html[data-page="members"] .scan-result-code {
    font-size: .42rem;
  }

  html[data-page="members"] .scan-result-era {
    margin-top: 13px;
    font-size: clamp(1.72rem, 8.5vw, 2.35rem);
  }

  html[data-page="members"] .scan-result-title {
    font-size: .78rem;
  }

  html[data-page="members"] .scan-result-copy {
    margin-top: 8px;
    font-size: .74rem;
    line-height: 1.47;
  }

  html[data-page="members"] .scan-result-tags {
    margin-top: 12px;
  }

  html[data-page="members"] .scan-result-tags > span {
    padding: 5px 7px;
    font-size: .49rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  html[data-page="members"] .scan-loading-line > span,
  html[data-page="members"] .profile-result[data-scan-state="revealed"] {
    animation: none !important;
  }
}

html.motion-off[data-page="members"] .scan-loading-line > span,
html.motion-off[data-page="members"] .profile-result[data-scan-state="revealed"] {
  animation: none !important;
}
'''
profile_css.write_text(css)

Path('tools/member-signature-reveal-v51.py').unlink(missing_ok=True)
Path('.github/workflows/member-signature-reveal-v51.yml').unlink(missing_ok=True)
