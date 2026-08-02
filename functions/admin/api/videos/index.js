import {
  errorResponse,
  json,
  listVideos,
  normalizeVideoInput,
  requireAdmin,
  requireDatabase,
  requireSameOrigin,
  serializeVideo
} from '../../../_lib/video-store.js';

export async function onRequestGet(context) {
  const denied = await requireAdmin(context);
  if (denied) return denied;

  try {
    const db = requireDatabase(context.env);
    return json({ videos: await listVideos(db) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function onRequestPost(context) {
  const originDenied = requireSameOrigin(context);
  if (originDenied) return originDenied;
  const denied = await requireAdmin(context);
  if (denied) return denied;

  try {
    const db = requireDatabase(context.env);
    const input = normalizeVideoInput(await context.request.json());
    const statements = [];

    if (input.featured) {
      statements.push(db.prepare('UPDATE videos SET featured = 0, updated_at = CURRENT_TIMESTAMP WHERE featured = 1'));
    }

    statements.push(db.prepare(`
      INSERT INTO videos (youtube_id, title, release_date, kind, era, description, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      input.youtubeId,
      input.title,
      input.releaseDate,
      input.kind,
      input.era,
      input.description,
      input.featured
    ));

    await db.batch(statements);
    const row = await db.prepare(`
      SELECT id, youtube_id, title, release_date, kind, era, description, featured, created_at, updated_at
      FROM videos WHERE youtube_id = ?
    `).bind(input.youtubeId).first();

    return json({ video: serializeVideo(row) }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
