(() => {
  if (!window.matchMedia('(max-width: 640px)').matches) return;
  if (document.documentElement.dataset.page !== 'index') return;

  const names = [
    { latin: 'GAEUL', korean: '가을' },
    { latin: 'YUJIN', korean: '유진' },
    { latin: 'REI', korean: '레이', japanese: '直井怜' },
    { latin: 'WONYOUNG', korean: '원영' },
    { latin: 'LIZ', korean: '리즈' },
    { latin: 'LEESEO', korean: '이서' }
  ];

  function enhanceCards() {
    const cards = [...document.querySelectorAll('[data-member-grid] .member-card')];
    if (!cards.length) return false;

    cards.forEach((card, index) => {
      const name = names[index];
      const heading = card.querySelector('.member-info h3');
      if (!name || !heading || heading.dataset.nativeNameReady === 'true') return;

      const latin = document.createElement('span');
      latin.className = 'member-name-latin';
      latin.textContent = name.latin;

      const native = document.createElement('span');
      native.className = 'member-native-name';

      const korean = document.createElement('span');
      korean.lang = 'ko';
      korean.textContent = name.korean;
      native.appendChild(korean);

      if (name.japanese) {
        const divider = document.createElement('span');
        divider.className = 'member-native-divider';
        divider.setAttribute('aria-hidden', 'true');
        divider.textContent = '·';

        const japanese = document.createElement('span');
        japanese.lang = 'ja';
        japanese.textContent = name.japanese;

        native.append(divider, japanese);
      }

      heading.replaceChildren(latin, native);
      heading.dataset.nativeNameReady = 'true';
      heading.setAttribute(
        'aria-label',
        name.japanese
          ? `${name.latin}, ${name.korean}, ${name.japanese}`
          : `${name.latin}, ${name.korean}`
      );
    });

    return true;
  }

  if (enhanceCards()) return;

  const observer = new MutationObserver(() => {
    if (!enhanceCards()) return;
    observer.disconnect();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 8000);
})();
