(() => {
  if (document.documentElement.dataset.page !== 'eras') return;

  const covers = [
    {
      id: 'bangers',
      label: 'BANGERS',
      description: 'Standard photobook edition',
      image: 'https://shop.ive-starship.com/cdn/shop/files/BANGERS_IVE_2nd_Album_D2C_Thumbnail.jpg?v=1770661391&width=1445',
      source: 'https://shop.ive-starship.com/products/bangers-ver-ive-the-2nd-studio-revive-signed-d2c-exclusive'
    },
    {
      id: 'challengers',
      label: 'CHALLENGERS',
      description: 'Standard out-box edition',
      image: 'https://shop.ive-starship.com/cdn/shop/files/CHALLENGERS_IVE_2nd_Album_D2C_Thumbnail.jpg?v=1770661371&width=1445',
      source: 'https://shop.ive-starship.com/products/challengers-ver-ive-the-2nd-studio-revive-signed-d2c-exclusive'
    },
    {
      id: 'spoilers',
      label: 'SPOILERS',
      description: 'Binder photobook edition',
      image: 'https://cafe24img.poxo.com/officialstarship/web/product/big/202602/62ddc2c37c217ea3156871fec3b7588d.jpg',
      source: 'https://www.starship-square.com/product/spoilers-ver-ive-the-2nd-album-revive/1931/'
    },
    {
      id: 'loved-ive',
      label: 'LOVED IVE',
      description: 'Limited out-box edition',
      image: 'https://kpops.pl/18873-large_default/ive-revive-limited-loved-ive-ver-preorder.jpg',
      source: 'https://starship-square.com/product/loved-ive-ver-ive-the-2nd-album-revive/1922/display/1/'
    }
  ];

  function coverMarkup(cover, index) {
    return `
      <article class="revive-cover-card revive-cover-card--${cover.id}">
        <a href="${cover.source}" target="_blank" rel="noreferrer" aria-label="Open the ${cover.label} REVIVE+ album edition source">
          <div class="revive-cover-card__image">
            <img
              src="${cover.image}"
              alt="IVE REVIVE+ ${cover.label} edition cover"
              loading="${index === 0 ? 'eager' : 'lazy'}"
              decoding="async"
              referrerpolicy="no-referrer" />
          </div>
          <div class="revive-cover-card__copy">
            <span>REVIVE+ edition 0${index + 1}</span>
            <strong>${cover.label} · ${cover.description}</strong>
          </div>
        </a>
      </article>`;
  }

  function attachImageFallbacks(gallery) {
    gallery.querySelectorAll('.revive-cover-card img').forEach((image) => {
      image.addEventListener('error', () => {
        image.closest('.revive-cover-card')?.setAttribute('data-image-error', 'true');
      }, { once: true });
    });
  }

  function renderGallery() {
    const detail = document.querySelector('[data-release-detail]');
    if (!detail) return;

    const selectedTitle = detail.querySelector('.disco-copy h3')?.textContent.trim();
    const existing = detail.querySelector('[data-revive-cover-gallery]');

    if (selectedTitle !== 'REVIVE+') {
      existing?.remove();
      return;
    }

    if (existing) return;

    const gallery = document.createElement('section');
    gallery.className = 'revive-cover-gallery';
    gallery.dataset.reviveCoverGallery = '';
    gallery.setAttribute('aria-labelledby', 'revive-cover-gallery-title');
    gallery.innerHTML = `
      <header class="revive-cover-gallery__head">
        <div>
          <p>Physical album archive · 04 editions</p>
          <h4 id="revive-cover-gallery-title">Every standard REVIVE+ cover.</h4>
        </div>
        <span>Select a cover to open its product source. Member Digipacks and compact music-card editions remain cataloged separately.</span>
      </header>
      <div class="revive-cover-grid">
        ${covers.map(coverMarkup).join('')}
      </div>`;

    detail.appendChild(gallery);
    attachImageFallbacks(gallery);
  }

  function initialize() {
    renderGallery();

    const consoleElement = document.querySelector('.era-console-page');
    if (!consoleElement) return;

    const observer = new MutationObserver(renderGallery);
    observer.observe(consoleElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
