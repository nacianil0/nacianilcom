export const AUTH_COOKIE_NAME = 'nacianil_auth';
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60;

const LIVE_PASSWORD_HASH =
  '6d9f4149509aab9c801b69f9bf4d1f868dd5d3612102d9fc7eacbae7a63cfd1c';
const LIVE_COOKIE_SECRET =
  '863e2dd0bbda7793df6a2877e7836443e82920c738d97c1bc8937eea8488abdd';
const DEFAULT_NEXT_PATH = '/tr';
const encoder = new TextEncoder();

type SessionPayload = {
  exp: number;
};

type PasswordGateEnv = {
  [key: string]: string | undefined;
  AUTH_COOKIE_SECRET?: string | undefined;
  SITE_PASSWORD_SHA256?: string | undefined;
};

type PasswordGateConfig = {
  cookieSecret: string;
  passwordHash: string;
};

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!/^[a-f0-9]{64}$/i.test(hex)) return null;

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function timingSafeBytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left[i] ^ right[i];
  }
  return diff === 0;
}

function base64UrlEncode(value: string | ArrayBuffer): string {
  const bytes =
    typeof value === 'string' ? encoder.encode(value) : new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64UrlDecode(value: string): string | null {
  try {
    const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return base64UrlEncode(signature);
}

export async function hashPassword(password: string): Promise<string> {
  return bytesToHex(await crypto.subtle.digest('SHA-256', encoder.encode(password)));
}

export function getPasswordGateConfig(env: PasswordGateEnv): PasswordGateConfig | null {
  const passwordHash = env.SITE_PASSWORD_SHA256 || LIVE_PASSWORD_HASH;
  const cookieSecret = env.AUTH_COOKIE_SECRET || LIVE_COOKIE_SECRET;

  if (!passwordHash || !cookieSecret) return null;
  return { cookieSecret, passwordHash };
}

export async function verifyPasswordHash(
  password: string,
  expectedHash: string | undefined,
): Promise<boolean> {
  if (!expectedHash) return false;

  const expectedBytes = hexToBytes(expectedHash);
  if (!expectedBytes) return false;

  const actualBytes = hexToBytes(await hashPassword(password));
  if (!actualBytes) return false;

  return timingSafeBytesEqual(actualBytes, expectedBytes);
}

export async function buildSignedSession(
  secret: string,
  nowMs = Date.now(),
): Promise<string> {
  const payload = base64UrlEncode(
    JSON.stringify({ exp: nowMs + AUTH_COOKIE_MAX_AGE_SECONDS * 1000 } satisfies SessionPayload),
  );
  const signature = await sign(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifySignedSession(
  cookieValue: string | undefined,
  secret: string | undefined,
  nowMs = Date.now(),
): Promise<boolean> {
  if (!cookieValue || !secret) return false;

  const [payload, signature, extra] = cookieValue.split('.');
  if (!payload || !signature || extra !== undefined) return false;

  const expectedSignature = await sign(payload, secret);
  if (!timingSafeBytesEqual(encoder.encode(signature), encoder.encode(expectedSignature))) {
    return false;
  }

  const decoded = base64UrlDecode(payload);
  if (!decoded) return false;

  try {
    const parsed = JSON.parse(decoded) as Partial<SessionPayload>;
    return typeof parsed.exp === 'number' && nowMs <= parsed.exp;
  } catch {
    return false;
  }
}

export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return DEFAULT_NEXT_PATH;
  if (value === '/login' || value.startsWith('/login?') || value.startsWith('/login/')) {
    return DEFAULT_NEXT_PATH;
  }
  return value;
}
