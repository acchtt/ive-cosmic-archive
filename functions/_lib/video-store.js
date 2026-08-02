const KINDS = {
  'music-video': { label: 'Music video', categories: ['music-video'] },
  'japanese-music-video': { label: 'Japanese music video', categories: ['music-video', 'japanese'] },
  performance: { label: 'Performance', categories: ['performance'] },
  practice: { label: 'Dance practice', categories: ['practice'] },
  behind: { label: 'Behind', categories: ['behind'] }
};

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers
    }
  });
}

export function requireDatabase(env) {
  if (!env?.IVE_MEDIA_DB) {
    throw Object.assign(new Error('D1 binding IVE_MEDIA_DB is not configured.'), { status: 503 });
  }
  return env.IVE_MEDIA_DB;
}

export function requireAdmin(context) {
  const hostname = new URL(context.request.url).hostname;
  const localBypass = context.env?.ADMIN_DEV_BYPASS === 'true' && ['localhost', '127.0.0.1'].includes(hostname);
  if (localBypass) return null;

  const jwt = context.request.headers.get('cf-access-jwt-assertion');
  const email = context.request.headers.get('cf-access-authenticated-user-email')?.trim().toLowerCase();
  if (!jwt || !email) {
    return json({ error: 'Admin access requires Cloudflare Access authentication.' }, 403);
  }

  const allowed = String(context.env?.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (allowed.length && !allowed.includes(email)) {
    return json({ error: 'This account is not authorized to manage the media catalog.' }, 403);
  }

  return null;
}

function cleanText(value, field, maxLength) {
  const text = String(value ?? '').trim();
  if (!text) throw Object.assign(new Error(`${field} is required.`), { status: 400 });
  if (text.length > maxLength) throw Object.assign(new Error(`${field} is too long.`), { status: 400 });
  return text;
}

export function normalizeVideoInput(input) {
  const youtubeId = cleanText(input.youtubeId, 'YouTube ID', 20);
  if (!/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
    throw Object.assign(new Error('Enter a valid 11-character YouTube video ID or URL.'), { status: 400 });
  }

  const kind = cleanText(input.kind, 'Video type', 40);
  if (!KINDS[kind]) throw Object.assign(new Error('Choose a supported video type.'), { status: 400 });

  const releaseDate = cleanText(input.releaseDate, 'Release date', 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate) || Number.isNaN(Date.parse(`${releaseDate}T00:00:00Z`))) {
    throw Object.assign(new Error('Enter a valid release date.'), { status: 400 });
  }

  const featured = Boolean(input.featured);
  if (featured && !KINDS[kind].categories.includes('music-video')) {
    throw Object.assign(new Error('Only a music video can be the featured transmission.'), { status: 400 });
  }

  return {
    youtubeId,
    title: cleanText(input.title, 'Title', 140),
    releaseDate,
    kind,
    era: cleanText(input.era, 'Era', 100),
    description: String(input.description ?? '').trim().slice(0, 800),
    featured: featured ? 1 : 0
  };
}

export function serializeVideo(row) {
  const type = KINDS[row.kind] || KINDS['music-video'];
  return {
    recordId: Number(row.id),
    id: row.youtube_id,
    youtubeId: row.youtube_id,
    title: row.title,
    date: String(row.release_date).replaceAll('-', '.'),
    releaseDate: row.release_date,
    kind: row.kind,
    type: type.label,
    categories: type.categories,
    era: row.era,
    description: row.description || '',
    featured: Boolean(row.featured),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listVideos(db) {
  const result = await db.prepare(`
    SELECT id, youtube_id, title, release_date, kind, era, description, featured, created_at, updated_at
    FROM videos
    ORDER BY release_date DESC, id DESC
  `).all();
  return (result.results || []).map(serializeVideo);
}

export function errorResponse(error) {
  const status = Number(error?.status) || (String(error?.message || '').includes('UNIQUE constraint') ? 409 : 500);
  const message = status === 500
    ? 'The media database request failed.'
    : String(error?.message || 'Request failed.');
  return json({ error: message }, status);
}
