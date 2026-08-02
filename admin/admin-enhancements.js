(() => {
  const form = document.querySelector('[data-video-form]');
  const list = document.querySelector('[data-video-list]');
  const count = document.querySelector('[data-video-count]');
  const search = document.querySelector('[data-admin-search]');
  const submit = document.querySelector('[data-submit-button]');
  const status = document.querySelector('[data-form-status]');

  if (!form || !list || !count || !search || !submit || !status) return;

  const formFields = document.createElement('div');
  formFields.className = 'admin-form-fields';
  Array.from(form.children).forEach((child) => {
    if (child !== submit && child !== status) formFields.append(child);
  });
  form.prepend(formFields);

  const actionBar = document.createElement('div');
  actionBar.className = 'admin-form-actions';
  actionBar.append(submit, status);
  form.append(actionBar);

  const category = document.createElement('select');
  category.setAttribute('aria-label', 'Filter video catalog by category');
  category.innerHTML = `
    <option value="all">All categories</option>
    <option value="music video">Music videos</option>
    <option value="japanese music video">Japanese M/Vs</option>
    <option value="performance">Performance</option>
    <option value="dance practice">Dance practice</option>
    <option value="behind">Behind</option>
  `;

  const sort = document.createElement('select');
  sort.setAttribute('aria-label', 'Sort video catalog');
  sort.innerHTML = `
    <option value="newest">Newest first</option>
    <option value="category">Group by category</option>
    <option value="title">Title A–Z</option>
  `;

  function buildControl(labelText, control) {
    const label = document.createElement('label');
    label.className = 'admin-filter-control';
    const caption = document.createElement('span');
    caption.textContent = labelText;
    label.append(caption, control);
    return label;
  }

  const tools = document.createElement('div');
  tools.className = 'admin-catalog-tools';
  search.parentNode.insertBefore(tools, search);
  tools.append(search, buildControl('Category', category), buildControl('Sort', sort));

  const state = {
    category: 'all',
    sort: 'newest',
    total: 0,
    applying: false
  };

  const categoryOrder = new Map([
    ['music video', 0],
    ['japanese music video', 1],
    ['performance', 2],
    ['dance practice', 3],
    ['behind', 4]
  ]);

  function normalizeKind(row) {
    const kind = row.querySelector('.admin-video-kind');
    const label = Array.from(kind?.childNodes || [])
      .find((node) => node.nodeType === Node.TEXT_NODE)?.textContent || kind?.textContent || '';
    return label.trim().toLowerCase();
  }

  function readRow(row) {
    const meta = row.querySelector('.admin-video-copy p')?.textContent || '';
    const releaseDate = meta.split('·').at(-1)?.trim() || '';
    return {
      row,
      kind: normalizeKind(row),
      title: row.querySelector('.admin-video-copy h3')?.textContent.trim() || '',
      releaseDate,
      id: Number(row.querySelector('[data-id]')?.dataset.id) || 0
    };
  }

  function rememberTotal() {
    const match = count.textContent.match(/(\d+)\s+of\s+(\d+)/i);
    if (match) state.total = Number(match[2]);
  }

  function compareEntries(left, right) {
    if (state.sort === 'title') {
      return left.title.localeCompare(right.title, undefined, { sensitivity: 'base' })
        || right.releaseDate.localeCompare(left.releaseDate)
        || right.id - left.id;
    }

    if (state.sort === 'category') {
      return (categoryOrder.get(left.kind) ?? 99) - (categoryOrder.get(right.kind) ?? 99)
        || right.releaseDate.localeCompare(left.releaseDate)
        || left.title.localeCompare(right.title, undefined, { sensitivity: 'base' });
    }

    return right.releaseDate.localeCompare(left.releaseDate) || right.id - left.id;
  }

  function categoryHeading(kind, amount) {
    const heading = document.createElement('div');
    heading.className = 'admin-category-divider';
    const label = kind.replace(/\b\w/g, (character) => character.toUpperCase());
    heading.innerHTML = `<span>${label}</span><b>${amount}</b>`;
    return heading;
  }

  function applyCatalogControls() {
    if (state.applying) return;
    state.applying = true;
    observer.disconnect();

    rememberTotal();
    list.querySelectorAll('.admin-category-divider, .admin-enhancement-empty').forEach((node) => node.remove());

    const entries = Array.from(list.querySelectorAll('.admin-video-row')).map(readRow);
    if (!entries.length) {
      observer.observe(list, { childList: true });
      state.applying = false;
      return;
    }

    entries.sort(compareEntries);
    const visibleEntries = entries.filter((entry) => state.category === 'all' || entry.kind === state.category);
    const visibleRows = new Set(visibleEntries.map((entry) => entry.row));
    entries.forEach((entry) => {
      entry.row.hidden = !visibleRows.has(entry.row);
    });

    if (state.sort === 'category') {
      const counts = visibleEntries.reduce((totals, entry) => {
        totals.set(entry.kind, (totals.get(entry.kind) || 0) + 1);
        return totals;
      }, new Map());
      let previousKind = '';
      entries.forEach((entry) => {
        if (!entry.row.hidden && entry.kind !== previousKind) {
          list.append(categoryHeading(entry.kind, counts.get(entry.kind) || 0));
          previousKind = entry.kind;
        }
        list.append(entry.row);
      });
    } else {
      entries.forEach((entry) => list.append(entry.row));
    }

    if (!visibleEntries.length) {
      const empty = document.createElement('p');
      empty.className = 'admin-empty admin-enhancement-empty';
      empty.textContent = 'No videos match this category and search.';
      list.append(empty);
    }

    count.textContent = `${visibleEntries.length} of ${state.total || entries.length}`;
    observer.observe(list, { childList: true });
    state.applying = false;
  }

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(applyCatalogControls);
  });
  observer.observe(list, { childList: true });

  category.addEventListener('change', () => {
    state.category = category.value;
    applyCatalogControls();
  });

  sort.addEventListener('change', () => {
    state.sort = sort.value;
    applyCatalogControls();
  });

  applyCatalogControls();
})();
