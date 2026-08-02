(() => {
  const rail = document.querySelector('[data-media-latest]');
  if (!rail || !('PointerEvent' in window)) return;

  const DRAG_SPEED = 1.45;
  const DRAG_THRESHOLD = 4;
  const MAX_VELOCITY = 2.4;
  const FRICTION = 0.92;
  const cards = [...rail.querySelectorAll('.media-latest-card')];

  const state = {
    active: false,
    dragging: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    targetScrollLeft: rail.scrollLeft,
    suppressClick: false,
    dragFrame: 0,
    momentumFrame: 0
  };

  const setCursor = (value) => {
    rail.style.cursor = value;
    cards.forEach((card) => {
      card.style.cursor = value;
    });
  };

  const cancelDragFrame = () => {
    if (!state.dragFrame) return;
    cancelAnimationFrame(state.dragFrame);
    state.dragFrame = 0;
  };

  const restoreSnap = () => {
    rail.style.scrollSnapType = '';
    rail.classList.remove('is-dragging');
    setCursor('grab');
  };

  const cancelMomentum = () => {
    if (state.momentumFrame) cancelAnimationFrame(state.momentumFrame);
    state.momentumFrame = 0;
    state.velocity = 0;
  };

  const scheduleDragFrame = () => {
    if (state.dragFrame) return;
    state.dragFrame = requestAnimationFrame(() => {
      state.dragFrame = 0;
      rail.scrollLeft = state.targetScrollLeft;
    });
  };

  const startMomentum = () => {
    cancelMomentum();

    let velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, state.velocity));
    if (Math.abs(velocity) < 0.08) {
      restoreSnap();
      return;
    }

    let previousTime = performance.now();
    const glide = (time) => {
      const elapsed = Math.min(32, time - previousTime || 16.67);
      previousTime = time;

      const previousScroll = rail.scrollLeft;
      rail.scrollLeft += velocity * elapsed;
      const hitBoundary = rail.scrollLeft === previousScroll;
      velocity *= Math.pow(FRICTION, elapsed / 16.67);

      if (hitBoundary || Math.abs(velocity) < 0.025) {
        state.momentumFrame = 0;
        restoreSnap();
        return;
      }

      state.momentumFrame = requestAnimationFrame(glide);
    };

    state.momentumFrame = requestAnimationFrame(glide);
  };

  const finishDrag = (event) => {
    if (!state.active || (event.pointerId != null && event.pointerId !== state.pointerId)) return;

    const pointerId = state.pointerId;
    const didDrag = state.dragging;
    state.active = false;
    state.dragging = false;
    state.pointerId = null;

    cancelDragFrame();
    rail.scrollLeft = state.targetScrollLeft;

    if (pointerId != null && rail.hasPointerCapture(pointerId)) {
      rail.releasePointerCapture(pointerId);
    }

    if (didDrag) {
      state.suppressClick = true;
      window.setTimeout(() => {
        state.suppressClick = false;
      }, 120);
      startMomentum();
    } else {
      restoreSnap();
    }
  };

  rail.style.userSelect = 'none';
  rail.style.webkitUserSelect = 'none';
  rail.style.willChange = 'scroll-position';
  setCursor('grab');

  rail.querySelectorAll('img').forEach((image) => {
    image.draggable = false;
  });

  rail.addEventListener('dragstart', (event) => event.preventDefault());

  rail.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    cancelMomentum();
    state.active = true;
    state.dragging = false;
    state.pointerId = event.pointerId;
    state.startX = event.clientX;
    state.startScrollLeft = rail.scrollLeft;
    state.targetScrollLeft = rail.scrollLeft;
    state.lastX = event.clientX;
    state.lastTime = performance.now();
    state.velocity = 0;
    rail.setPointerCapture(event.pointerId);
  });

  rail.addEventListener('pointermove', (event) => {
    if (!state.active || event.pointerId !== state.pointerId) return;

    const distance = event.clientX - state.startX;
    if (!state.dragging && Math.abs(distance) < DRAG_THRESHOLD) return;

    if (!state.dragging) {
      state.dragging = true;
      rail.classList.add('is-dragging');
      rail.style.scrollSnapType = 'none';
      setCursor('grabbing');
    }

    event.preventDefault();

    const now = performance.now();
    const elapsed = Math.max(1, now - state.lastTime);
    const pointerDelta = event.clientX - state.lastX;
    const instantVelocity = (-pointerDelta * DRAG_SPEED) / elapsed;
    state.velocity = state.velocity * 0.68 + instantVelocity * 0.32;
    state.lastX = event.clientX;
    state.lastTime = now;

    state.targetScrollLeft = state.startScrollLeft - distance * DRAG_SPEED;
    scheduleDragFrame();
  });

  rail.addEventListener('pointerup', finishDrag);
  rail.addEventListener('pointercancel', finishDrag);
  rail.addEventListener('lostpointercapture', finishDrag);
  rail.addEventListener('wheel', cancelMomentum, { passive: true });

  rail.addEventListener('click', (event) => {
    if (!state.suppressClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
})();
