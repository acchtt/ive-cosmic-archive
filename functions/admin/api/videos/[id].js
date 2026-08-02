import {
  errorResponse,
  normalizeVideoInput,
  requireAdmin,
  requireDatabase,
  serializeVideo
} from '../../../_lib/video-store.js';

function parseId(context) {
  const id = Number(context.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw Object.assign(new Error('Invalid video record ID.'), { status: 400 });
  }
  return id;
}

export async function onRequestPut(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;

  try {
    const db = requireDatabase(context.env);
    const id = parseId(context);
    const input = normalizeVideoInput(await context.request.json());
    const existing = await db.prepare('SELECT id FROM videos WHERE id = ?').bind(id).first();
    if (!existing) throw Object.assign(new Error('Video record not found.'), { status: 404 });

    const statements = [];
    if (input.featured) {
      statements.push(db.prepare('UPDATE videos SET featured = 0, updated_at = CURRENT_TIMESTAMP WHERE featured = 1 AND id <> ?').bind(id));
    }
    statements.push(db.prepare(`
      UPDATE videos
      SET youtube_id = ?, title = ?, release_date = ?, kind = ?, era = ?, description = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      input.youtubeId,
      input.title,
      input.releaseDate,
      input.kind,
      input.era,
      input.description,
      input.featured,
      id
    ));

    await db.batch(statements);
    const row = await db.prepare(`
      SELECT id, youtube_id, title, release_date, kind, era, description, featured, created_at, updated_at
      FROM videos WHERE id = ?
    `).bind(id).first();

    return new Response(JSON.stringify({ video: serializeVideo(row) }), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function onRequestDelete(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;

  try {
    const db = requireDatabase(context.env);
    const id = parseId(context);
    const result = await db.prepare('DELETE FROM videos WHERE id = ?').bind(id).run();
    if (!result.meta?.changes) throw Object.assign(new Error('Video record not found.'), { status: 404 });
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
