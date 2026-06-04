'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  buildSignedSession,
  getPasswordGateConfig,
  safeNextPath,
  verifyPasswordHash,
} from '../../src/lib/password-gate';

function loginPath(next: string, error?: 'config' | 'invalid'): string {
  const params = new URLSearchParams({ next });
  if (error) params.set('error', error);
  return `/login?${params.toString()}`;
}

export async function login(formData: FormData): Promise<void> {
  const password = formData.get('password');
  const next = safeNextPath(formData.get('next')?.toString());
  const config = getPasswordGateConfig(process.env);

  if (!config) {
    redirect(loginPath(next, 'config'));
  }

  if (typeof password !== 'string' || !(await verifyPasswordHash(password, config.passwordHash))) {
    redirect(loginPath(next, 'invalid'));
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, await buildSignedSession(config.cookieSecret), {
    httpOnly: true,
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  redirect(next);
}
