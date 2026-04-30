import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

import { cookies, headers } from 'next/headers';

const ADMIN_SESSION_COOKIE = 'admin_rsvp_session';
const ADMIN_SESSION_SCOPE = 'admin-rsvp-session:v1';
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

export function getAdminPassword() {
  return process.env.ADMIN_RSVP_PASSWORD || null;
}

function parseBooleanEnv(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (['1', 'true', 'yes'].includes(normalizedValue)) {
    return true;
  }

  if (['0', 'false', 'no'].includes(normalizedValue)) {
    return false;
  }

  return null;
}

function getUrlProtocol(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).protocol.replace(':', '');
  } catch {
    return null;
  }
}

function getRequestProtocol(requestHeaders: Headers) {
  const forwardedProto = requestHeaders
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim()
    .toLowerCase();

  if (forwardedProto === 'http' || forwardedProto === 'https') {
    return forwardedProto;
  }

  if (requestHeaders.get('x-forwarded-ssl')?.trim().toLowerCase() === 'on') {
    return 'https';
  }

  return (
    getUrlProtocol(requestHeaders.get('origin')) ??
    getUrlProtocol(requestHeaders.get('referer'))
  );
}

async function shouldUseSecureAdminCookie() {
  const configuredValue = parseBooleanEnv(process.env.ADMIN_RSVP_COOKIE_SECURE);

  if (configuredValue !== null) {
    return configuredValue;
  }

  const requestProtocol = getRequestProtocol(await headers());

  if (requestProtocol) {
    return requestProtocol === 'https';
  }

  const siteProtocol = getUrlProtocol(process.env.NEXT_PUBLIC_SITE_URL);

  if (siteProtocol) {
    return siteProtocol === 'https';
  }

  return process.env.NODE_ENV === 'production';
}

function hashValue(value: string) {
  return createHash('sha256').update(value).digest();
}

export function secureEqual(left: string, right: string) {
  return timingSafeEqual(hashValue(left), hashValue(right));
}

function createSessionToken(password: string) {
  return createHmac('sha256', password)
    .update(ADMIN_SESSION_SCOPE)
    .digest('hex');
}

export async function isAdminAuthenticated() {
  const password = getAdminPassword();

  if (!password) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return sessionToken
    ? secureEqual(sessionToken, createSessionToken(password))
    : false;
}

export async function setAdminSessionCookie(password: string) {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(password), {
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: '/admin',
    sameSite: 'strict',
    secure: await shouldUseSecureAdminCookie(),
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete({
    name: ADMIN_SESSION_COOKIE,
    path: '/admin',
  });
}
