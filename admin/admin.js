(() => {
  const state = { videos: [], search: '' };
  const form = document.querySelector('[data-video-form]');
  const list = document.querySelector('[data-video-list]');
  const count = document.querySelector('[data-video-count]');
  const status = document.querySelector('[data-form-status]');
  const submit = document.querySelector('[data-submit-button]');
  const preview = document.querySelector('[data-video-preview]');
  const editorTitle = document.querySelector('[data-editor-title]');
  const search = document.querySelector('[data-admin-search]');

  if (!form || !list) return;

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function extractYouTubeId(value) {
    const input = String(value || '').trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
    try {
      const url = new URL(input);
      const host = url.hostname.replace(/^www\./, '');
      if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || '';
      if (host.endsWith('youtube.com')) {
        return url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/)?.[1] || '';
      }
    } catch {
      return '';
    }
    return '';
  }

  function setStatus(message = '', stateName = '') {
    status.textContent = message;
    status.dataset.state = stateName;
  }

  function updatePreview() {
    const id = extractYouTubeId(form.elements.youtubeInput.value);
    preview.innerHTML = id
      ? `<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="Video thumbnail preview" />`
      : '<span>Thumbnail preview</span>';
  }

  async function api(url, options = {}) {
    const response = await fetch(url, {
      credentials: 'same-origin',
      ...options,
      headers: {
        accept: 'application/json',
        ...(options.body ? { 'content-type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    });

    if (response.status === 204) return null;
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status}).`);
    return payload;
  }

  function renderList() {
    const term = state.search.toLowerCase();
    const filtered = state.videos.filter((video) => {
      const haystack = `${video.title} ${video.era} ${video.type} ${video.releaseDate}`.toLowerCase();
      return !term || haystack.includes(term);
    });

    count.textContent = `${filtered.length} of ${state.videos.length}`;
    if (!filtered.length) {
      list.innerHTML = '<p class="admin-empty">No videos match this search.</p>';
      return;
    }

    list.innerHTML = filtered.map((video) => `
      <article class="admin-video-row">
        <div class="admin-video-thumb"><img src="https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg" alt="" loading="lazy" /></div>
        <div class="admin-video-copy">
          <span class="admin-video-kind">${escapeHtml(video.type)}${video.featured ? '<b class="admin-featured">Featured</b>' : ''}</span>
          <h3 title="${escapeHtml(video.title)}">${escapeHtml(video.title)}</h3>
          <p>${escapeHtml(video.era)} · ${escapeHtml(video.releaseDate)}</p>
        </div>
        <div class="admin-row-actions">
          <button type="button" data-action="edit" data-id="${video.recordId}">Edit</button>
          <button type="button" data-action="delete" data-id="${video.recordId}">Delete</button>
        </div>
      </article>
    `).join('');
  }

  async function loadVideos() {
    list.innerHTML = '<p class="admin-empty">Loading live catalog…</p>';
    try {
      const payload = await api('/admin/api/videos');
      state.videos = Array.isArray(payload.videos) ? payload.videos : [];
      renderList();
    } catch (error) {
      count.textContent = 'Unavailable';
      list.innerHTML = `<p class="admin-load-error">${escapeHtml(error.message)}<br /><br />Confirm the D1 binding, migration, and Cloudflare Access policy are configured.</p>`;
    }
  }

  function resetForm() {
    form.reset();
    form.elements.recordId.value = '';
    editorTitle.textContent = 'Add video';
    submit.textContent = 'Save video';
    setStatus();
    updatePreview();
  }

  function editVideo(id) {
    const video = state.videos.find((item) => item.recordId === id);
    if (!video) return;
    form.elements.recordId.value = String(video.recordId);
    form.elements.youtubeInput.value = video.youtubeId;
    form.elements.title.value = video.title;
    form.elements.releaseDate.value = video.releaseDate;
    form.elements.kind.value = video.kind;
    form.elements.era.value = video.era;
    form.elements.description.value = video.description || '';
    form.elements.featured.checked = Boolean(video.featured);
    editorTitle.textContent = 'Edit video';
    submit.textContent = 'Update video';
    setStatus();
    updatePreview();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function deleteVideo(id) {
    const video = state.videos.find((item) => item.recordId === id);
    if (!video || !window.confirm(`Delete “${video.title}” from the live catalog?`)) return;
    try {
      await api(`/admin/api/videos/${id}`, { method: 'DELETE' });
      state.videos = state.videos.filter((item) => item.recordId !== id);
      renderList();
      if (Number(form.elements.recordId.value) === id) resetForm();
    } catch (error) {
      window.alert(error.message);
    }
  }

  form.elements.youtubeInput.addEventListener('input', updatePreview);
  document.querySelector('[data-reset-form]')?.addEventListener('click', resetForm);
  search?.addEventListener('input', () => {
    state.search = search.value.trim();
    renderList();
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    if (button.dataset.action === 'edit') editVideo(id);
    if (button.dataset.action === 'delete') deleteVideo(id);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const youtubeId = extractYouTubeId(form.elements.youtubeInput.value);
    if (!youtubeId) {
      setStatus('Enter a valid YouTube URL or 11-character ID.', 'error');
      return;
    }

    const recordId = Number(form.elements.recordId.value) || null;
    const body = {
      youtubeId,
      title: form.elements.title.value,
      releaseDate: form.elements.releaseDate.value,
      kind: form.elements.kind.value,
      era: form.elements.era.value,
      description: form.elements.description.value,
      featured: form.elements.featured.checked
    };

    submit.disabled = true;
    setStatus(recordId ? 'Updating video…' : 'Adding video…');
    try {
      const payload = await api(recordId ? `/admin/api/videos/${recordId}` : '/admin/api/videos', {
        method: recordId ? 'PUT' : 'POST',
        body: JSON.stringify(body)
      });

      const saved = payload.video;
      const existingIndex = state.videos.findIndex((item) => item.recordId === saved.recordId);
      if (saved.featured) state.videos.forEach((item) => { item.featured = item.recordId === saved.recordId; });
      if (existingIndex >= 0) state.videos.splice(existingIndex, 1, saved);
      else state.videos.unshift(saved);
      state.videos.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || b.recordId - a.recordId);
      renderList();
      setStatus('Saved. The Media page now reads this catalog entry.', 'success');
      if (!recordId) resetForm();
    } catch (error) {
      setStatus(error.message, 'error');
    } finally {
      submit.disabled = false;
    }
  });

  updatePreview();
  loadVideos();
})();
