const KINDS = {
  'music-video': { label: 'Music video', categories: ['music-video'] },
  'japanese-music-video': { label: 'Japanese music video', categories: ['music-video', 'japanese'] },
  performance: { label: 'Performance', categories: ['performance'] },
  practice: { label: 'Dance practice', categories: ['practice'] },
  behind: { label: 'Behind', categories: ['behind'] }
};

const SESSION_COOKIE = 'ive_media_admin';
const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

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

function allowedAccessEmail(env, email) {
  const allowed = String(env?.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return !allowed.length || allowed.includes(email);
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function base64UrlToBytes(value) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function importHmacKey(secret, usage) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  );
}

async function signValue(secret, value) {
  const key = await importHmacKey(secret, 'sign');
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

async function verifyValue(secret, value, signature) {
  const key = await importHmacKey(secret, 'verify');
  return crypto.subtle.verify('HMAC', key, signature, encoder.encode(value));
}

function readCookie(request, name) {
  const cookies = String(request.headers.get('cookie') || '').split(';');
  for (const cookie of cookies) {
    const [key, ...parts] = cookie.trim().split('=');
    if (key === name) return parts.join('=');
  }
  return '';
}

async function createSessionToken(secret) {
  const payload = bytesToBase64Url(encoder.encode(JSON.stringify({
    version: 1,
    expires: Math.floor(Date.now() / 1000) + SESSION_SECONDS
  })));
  const signature = bytesToBase64Url(await signValue(secret, payload));
  return `${payload}.${signature}`;
}

async function verifySessionToken(secret, token) {
  try {
    const [payload, signature] = String(token || '').split('.');
    if (!payload || !signature) return false;
    const valid = await verifyValue(secret, payload, base64UrlToBytes(signature));
    if (!valid) return false;
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
    return data.version === 1 && Number(data.expires) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

async function digest(value) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

export async function authenticateAdmin(context) {
  const hostname = new URL(context.request.url).hostname;
  const localBypass = context.env?.ADMIN_DEV_BYPASS === 'true' && ['localhost', '127.0.0.1'].includes(hostname);
  if (localBypass) return { method: 'local' };

  const accessEnabled = context.env?.ADMIN_ACCESS_ENABLED === 'true';
  const accessJwt = context.request.headers.get('cf-access-jwt-assertion');
  const accessEmail = context.request.headers.get('cf-access-authenticated-user-email')?.trim().toLowerCase();
  if (accessEnabled && accessJwt && accessEmail && allowedAccessEmail(context.env, accessEmail)) {
    return { method: 'access', email: accessEmail };
  }

  const secret = String(context.env?.ADMIN_SESSION_SECRET || '');
  const token = readCookie(context.request, SESSION_COOKIE);
  if (secret.length >= 32 && await verifySessionToken(secret, token)) {
    return { method: 'password' };
  }

  return null;
}

export async function requireAdmin(context) {
  const identity = await authenticateAdmin(context);
  return identity ? null : json({ error: 'Admin authentication is required.' }, 401);
}

export function requireSameOrigin(context) {
  const requestUrl = new URL(context.request.url);
  const origin = context.request.headers.get('origin');
  if (origin !== requestUrl.origin) {
    return json({ error: 'Cross-origin admin requests are not allowed.' }, 403);
  }
  return null;
}

export async function createAdminSession(env, password) {
  const configuredPassword = String(env?.ADMIN_PASSWORD || '');
  const secret = String(env?.ADMIN_SESSION_SECRET || '');
  if (!configuredPassword || secret.length < 32) {
    throw Object.assign(new Error('ADMIN_PASSWORD and a 32+ character ADMIN_SESSION_SECRET must be configured.'), { status: 503 });
  }

  const suppliedDigest = await digest(String(password || ''));
  const configuredDigest = await digest(configuredPassword);
  if (!constantTimeEqual(suppliedDigest, configuredDigest)) {
    throw Object.assign(new Error('Incorrect admin password.'), { status: 401 });
  }

  const token = await createSessionToken(secret);
  return `${SESSION_COOKIE}=${token}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function clearAdminSession() {
  return `${SESSION_COOKIE}=; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
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
  const messageText = String(error?.message || '');
  const uniqueConflict = messageText.includes('UNIQUE constraint') || messageText.includes('SQLITE_CONSTRAINT_UNIQUE');
  const status = Number(error?.status) || (uniqueConflict ? 409 : 500);
  const message = status === 500
    ? 'The media database request failed.'
    : uniqueConflict
      ? 'That YouTube video is already in the catalog.'
      : messageText || 'Request failed.';
  return json({ error: message }, status);
}
