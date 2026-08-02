import {
  authenticateAdmin,
  clearAdminSession,
  createAdminSession,
  errorResponse,
  json,
  requireSameOrigin
} from '../../_lib/video-store.js';

export async function onRequestGet(context) {
  const identity = await authenticateAdmin(context);
  return identity
    ? json({ authenticated: true, method: identity.method, email: identity.email || null })
    : json({ authenticated: false }, 401);
}

export async function onRequestPost(context) {
  const denied = requireSameOrigin(context);
  if (denied) return denied;

  try {
    const body = await context.request.json();
    const cookie = await createAdminSession(context.env, body.password);
    return json({ authenticated: true, method: 'password' }, 200, { 'set-cookie': cookie });
  } catch (error) {
    return errorResponse(error);
  }
}

export function onRequestDelete(context) {
  const denied = requireSameOrigin(context);
  if (denied) return denied;
  return json({ authenticated: false }, 200, { 'set-cookie': clearAdminSession() });
}
