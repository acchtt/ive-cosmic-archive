import {
  authenticateAdmin,
  clearAdminSession,
  createAdminSession,
  errorResponse,
  json,
  requireSameOrigin
} from '../../_lib/video-store.js';

function configurationError(env) {
  const password = String(env?.ADMIN_PASSWORD || '');
  const secret = String(env?.ADMIN_SESSION_SECRET || '');

  if (!password) {
    return 'ADMIN_PASSWORD is not available to this production deployment.';
  }

  if (!secret) {
    return 'ADMIN_SESSION_SECRET is not available to this production deployment.';
  }

  if (secret.length < 32) {
    return `ADMIN_SESSION_SECRET is ${secret.length} characters long; it must be at least 32 characters.`;
  }

  return '';
}

export async function onRequestGet(context) {
  const identity = await authenticateAdmin(context);
  return identity
    ? json({ authenticated: true, method: identity.method, email: identity.email || null })
    : json({ authenticated: false }, 401);
}

export async function onRequestPost(context) {
  const denied = requireSameOrigin(context);
  if (denied) return denied;

  const configurationMessage = configurationError(context.env);
  if (configurationMessage) {
    return json({ error: configurationMessage }, 503);
  }

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
