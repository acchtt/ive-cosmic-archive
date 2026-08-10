(() => {
  if (!document.querySelector('script[src^="revive-member-sets.js"]')) {
    const memberSetScript = document.createElement('script');
    memberSetScript.src = 'revive-member-sets.js';
    memberSetScript.async = false;
    document.head.appendChild(memberSetScript);
  }

  const identities = [
    {
      stage: 'GAEUL',
      english: 'Kim Gaeul',
      korean: '김가을',
      birthday: 'September 24, 2002',
      instagram: 'fallingin__fall',
      youtube: { label: '가을의 온도', href: 'https://www.youtube.com/@gaeul_mood' }
    },
    { stage: 'YUJIN', english: 'An Yujin', korean: '안유진', birthday: 'September 1, 2003', instagram: '_yujin_an' },
    {
      stage: 'REI',
      english: 'Naoi Rei',
      korean: '나오이 레이',
      birthday: 'February 3, 2004',
      japanese: '直井怜',
      instagram: 'reinyourheart',
      youtube: { label: '따라해볼레이', href: 'https://www.youtube.com/@Follow_Rei' }
    },
    { stage: 'WONYOUNG', english: 'Jang Wonyoung', korean: '장원영', birthday: 'August 31, 2004', instagram: 'for_everyoung10' },
    { stage: 'LIZ', english: 'Kim Jiwon', korean: '김지원', birthday: 'November 21, 2004', instagram: 'liz.yeyo' },
    { stage: 'LEESEO', english: 'Lee Hyunseo', korean: '이현서', birthday: 'February 21, 2007', instagram: 'eeseooes' }
  ];

  function fullIdentity(identity) {
    return [identity.english, identity.korean, identity.japanese].filter(Boolean).join(' · ');
  }

  function instagramUrl(handle) {
    return `https://www.instagram.com/${handle}/`;
  }

  function decorateDirectory() {
    document.querySelectorAll('[data-dossier-index]').forEach((button, index) => {
      const identity = identities[index];
      if (!identity) return;

      const stageName = button.querySelector('strong');
      if (stageName) stageName.textContent = identity.stage;

      let fullName = button.querySelector('.dossier-full-name');
      if (!fullName) {
        fullName = document.createElement('em');
        fullName.className = 'dossier-full-name';
        button.appendChild(fullName);
      }

      button.querySelector('.dossier-instagram')?.remove();
      fullName.textContent = fullIdentity(identity);
      button.setAttribute('aria-label', `${identity.stage}, ${fullIdentity(identity)}`);
    });
  }

  function ensureSocialLinks(identityGroup) {
    if (!identityGroup) return null;

    let group = document.querySelector('[data-profile-social-links]');
    if (!group) {
      group = document.createElement('div');
      group.className = 'profile-social-links';
      group.dataset.profileSocialLinks = '';
      identityGroup.insertAdjacentElement('afterend', group);
    }
    return group;
  }

  function ensureInstagramLink(socialLinks) {
    if (!socialLinks) return null;

    let link = socialLinks.querySelector('[data-profile-instagram]');
    if (!link) {
      link = document.createElement('a');
      link.className = 'profile-instagram';
      link.dataset.profileInstagram = '';
      link.target = '_blank';
      link.rel = 'noreferrer';
      socialLinks.appendChild(link);
    }
    return link;
  }

  function ensureYoutubeLink(socialLinks) {
    if (!socialLinks) return null;

    let link = socialLinks.querySelector('[data-profile-youtube]');
    if (!link) {
      link = document.createElement('a');
      link.className = 'profile-youtube';
      link.dataset.profileYoutube = '';
      link.target = '_blank';
      link.rel = 'noreferrer';
      socialLinks.appendChild(link);
    }
    return link;
  }

  function updateActiveIdentity() {
    const panel = document.querySelector('[data-member-profile]');
    if (!panel) return;

    const index = Number(panel.dataset.activeMember || 0);
    const identity = identities[index] || identities[0];
    const stageName = document.querySelector('[data-profile-name]');
    const englishName = document.querySelector('[data-profile-english-name]');
    const koreanName = document.querySelector('[data-profile-korean-name]');
    const japaneseName = document.querySelector('[data-profile-japanese-name]');
    const birthday = document.querySelector('[data-profile-birthday]');
    const identityGroup = document.querySelector('.profile-identity');
    const socialLinks = ensureSocialLinks(identityGroup);
    const instagramLink = ensureInstagramLink(socialLinks);
    const youtubeLink = ensureYoutubeLink(socialLinks);

    if (stageName) stageName.textContent = identity.stage;
    if (englishName) englishName.textContent = identity.english;
    if (koreanName) koreanName.textContent = identity.korean;
    if (birthday) birthday.textContent = identity.birthday;

    if (japaneseName) {
      japaneseName.textContent = identity.japanese || '';
      japaneseName.hidden = !identity.japanese;
    }

    if (identityGroup) {
      identityGroup.setAttribute('aria-label', `Full member name: ${fullIdentity(identity)}`);
    }

    if (instagramLink) {
      instagramLink.href = instagramUrl(identity.instagram);
      instagramLink.innerHTML = `
        <span class="profile-instagram-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <rect x="3.3" y="3.3" width="17.4" height="17.4" rx="5.1"></rect>
            <circle cx="12" cy="12" r="4.05"></circle>
            <circle class="instagram-icon-dot" cx="17.2" cy="6.8" r="1.15"></circle>
          </svg>
        </span>
        <span class="profile-instagram-handle">@${identity.instagram}</span>
        <span class="profile-instagram-arrow" aria-hidden="true">↗</span>`;
      instagramLink.setAttribute('aria-label', `Open ${identity.stage} on Instagram, @${identity.instagram}`);
      instagramLink.setAttribute('title', `@${identity.instagram}`);
    }

    if (youtubeLink) {
      const channel = identity.youtube;
      youtubeLink.hidden = !channel;
      if (channel) {
        youtubeLink.href = channel.href;
        youtubeLink.innerHTML = `
          <span class="profile-youtube-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <rect x="2.8" y="5.4" width="18.4" height="13.2" rx="4.1"></rect>
              <path d="M10 9.1 15.2 12 10 14.9Z"></path>
            </svg>
          </span>
          <span class="profile-youtube-label">${channel.label}</span>
          <span class="profile-youtube-arrow" aria-hidden="true">↗</span>`;
        youtubeLink.setAttribute('aria-label', `Open ${identity.stage}'s YouTube channel, ${channel.label}`);
        youtubeLink.setAttribute('title', channel.label);
      } else {
        youtubeLink.removeAttribute('href');
        youtubeLink.replaceChildren();
        youtubeLink.removeAttribute('aria-label');
        youtubeLink.removeAttribute('title');
      }
    }
  }

  function initializeIdentityDetails() {
    const panel = document.querySelector('[data-member-profile]');
    if (!panel) return;

    decorateDirectory();
    updateActiveIdentity();

    const observer = new MutationObserver(updateActiveIdentity);
    observer.observe(panel, {
      attributes: true,
      attributeFilter: ['data-active-member']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeIdentityDetails, { once: true });
  } else {
    initializeIdentityDetails();
  }
})();



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
