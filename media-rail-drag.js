(() => {
  const rail = document.querySelector('[data-media-latest]');
  if (!rail || !('PointerEvent' in window)) return;

  const state = {
    active: false,
    dragging: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    suppressClick: false
  };

  const setCursor = (value) => {
    rail.style.cursor = value;
    rail.querySelectorAll('.media-latest-card').forEach((card) => {
      card.style.cursor = value;
    });
  };

  const finishDrag = (event) => {
    if (!state.active || (event.pointerId != null && event.pointerId !== state.pointerId)) return;

    const pointerId = state.pointerId;
    const didDrag = state.dragging;
    state.active = false;
    state.dragging = false;
    state.pointerId = null;

    rail.classList.remove('is-dragging');
    rail.style.scrollSnapType = '';
    setCursor('grab');

    if (pointerId != null && rail.hasPointerCapture(pointerId)) {
      rail.releasePointerCapture(pointerId);
    }

    if (didDrag) {
      state.suppressClick = true;
      window.setTimeout(() => {
        state.suppressClick = false;
      }, 0);
    }
  };

  rail.style.userSelect = 'none';
  rail.style.webkitUserSelect = 'none';
  setCursor('grab');

  rail.querySelectorAll('img').forEach((image) => {
    image.draggable = false;
  });

  rail.addEventListener('dragstart', (event) => event.preventDefault());

  rail.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    state.active = true;
    state.dragging = false;
    state.pointerId = event.pointerId;
    state.startX = event.clientX;
    state.startScrollLeft = rail.scrollLeft;
    rail.setPointerCapture(event.pointerId);
  });

  rail.addEventListener('pointermove', (event) => {
    if (!state.active || event.pointerId !== state.pointerId) return;

    const distance = event.clientX - state.startX;
    if (!state.dragging && Math.abs(distance) < 5) return;

    if (!state.dragging) {
      state.dragging = true;
      rail.classList.add('is-dragging');
      rail.style.scrollSnapType = 'none';
      setCursor('grabbing');
    }

    event.preventDefault();
    rail.scrollLeft = state.startScrollLeft - distance;
  });

  rail.addEventListener('pointerup', finishDrag);
  rail.addEventListener('pointercancel', finishDrag);
  rail.addEventListener('lostpointercapture', finishDrag);

  rail.addEventListener('click', (event) => {
    if (!state.suppressClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
})();
