import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/health'
]);

const isAuthSmokeRoute = createRouteMatcher([
  '/auth-smoke-probe'
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
  if (canUseAuthSmokeBypass(request)) {
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
