import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/health',
  '/editor-smoke-probe'
]);

const isAuthSmokeRoute = createRouteMatcher([
  '/auth-smoke-probe'
]);

const isEditorSmokeRoute = createRouteMatcher([
  '/editor-smoke-probe'
]);

const AUTH_SMOKE_HEADER = 'x-archflow-auth-smoke';
const AUTH_SMOKE_TOKEN = process.env.AUTH_SMOKE_BYPASS_TOKEN || 'archflow-local-dev';
const LOCAL_DEV_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']);

function canUseAuthSmokeBypass(request) {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  if (!isAuthSmokeRoute(request)) {
    return false;
  }

  if (!LOCAL_DEV_HOSTNAMES.has(request.nextUrl.hostname)) {
    return false;
  }

  return request.headers.get(AUTH_SMOKE_HEADER) === AUTH_SMOKE_TOKEN;
}

export default clerkMiddleware(async (auth, request) => {
  if (isEditorSmokeRoute(request)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-archflow-smoke-route', '1');

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  if (canUseAuthSmokeBypass(request)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-archflow-smoke-route', '1');

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  if (isAuthSmokeRoute(request)) {
    await auth.protect();
    return;
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
