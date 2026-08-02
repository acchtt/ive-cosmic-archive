import { errorResponse, json, listVideos, requireDatabase } from '../_lib/video-store.js';

export async function onRequestGet(context) {
  try {
    const db = requireDatabase(context.env);
    const videos = await listVideos(db);
    return json({ videos });
  } catch (error) {
    return errorResponse(error);
  }
}

export function onRequest() {
  return json({ error: 'Method not allowed.' }, 405, { allow: 'GET' });
}
