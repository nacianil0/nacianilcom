import { NextResponse, type NextRequest } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  getPasswordGateConfig,
  verifySignedSession,
} from './src/lib/password-gate';

const PUBLIC_FILE = /\.(?:avif|gif|ico|jpg|jpeg|png|svg|webp|woff|woff2)$/i;

function shouldSkipGate(pathname: string): boolean {
  return (
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/og') ||
    PUBLIC_FILE.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const gateConfig = getPasswordGateConfig(process.env);

  if (!gateConfig || shouldSkipGate(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (await verifySignedSession(cookieValue, gateConfig.cookieSecret)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.search = new URLSearchParams({
    next: `${request.nextUrl.pathname}${request.nextUrl.search}`,
  }).toString();

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
