const baseUrl = process.env.AUTH_SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const protectedPath = process.env.AUTH_SMOKE_PROTECTED_PATH || '/auth-smoke-probe';
const loggedOutProtectedPath = process.env.AUTH_SMOKE_LOGGED_OUT_PATH || protectedPath;
const authenticatedPath = process.env.AUTH_SMOKE_AUTHENTICATED_PATH || protectedPath;
const authenticatedCookie = process.env.AUTH_SMOKE_COOKIE || '';
const authSmokeHeader = 'x-archflow-auth-smoke';
const authSmokeToken = process.env.AUTH_SMOKE_BYPASS_TOKEN || 'archflow-local-dev';
const authSmokeMarker = 'ARCHFLOW_AUTH_SMOKE_OK';

async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    redirect: 'manual',
    ...options
  });

  return response;
}

async function assertRouteLoads(pathname, label) {
  const response = await request(pathname);
  const body = await response.text();

  if (response.status !== 200) {
    throw new Error(`${label} failed with status ${response.status}`);
  }

  if (!body.includes('Archflow')) {
    throw new Error(`${label} did not render expected Archflow content`);
  }
}

async function assertProtectedRedirect(pathname) {
  const response = await request(pathname);
  const location = response.headers.get('location') || '';

  if (response.status === 404) {
    return {
      skipped: false,
      message: `${pathname} blocks logged-out access with 404.`
    };
  }

  if (![301, 302, 303, 307, 308].includes(response.status)) {
    throw new Error(`Expected unauthenticated redirect for ${pathname}, received ${response.status}`);
  }

  if (!location.includes('/sign-in')) {
    throw new Error(`Expected redirect to /sign-in for ${pathname}, received ${location || 'no location header'}`);
  }
}

async function assertAuthenticatedRoute(pathname) {
  const headers = {};

  if (authenticatedCookie) {
    headers.cookie = authenticatedCookie;
  } else {
    headers[authSmokeHeader] = authSmokeToken;
  }

  const response = await request(pathname, {
    headers
  });
  const location = response.headers.get('location') || '';
  const body = await response.text();

  if ([301, 302, 303, 307, 308].includes(response.status) && location.includes('/sign-in')) {
    throw new Error(`Authenticated check for ${pathname} still redirected to sign-in`);
  }

  if (![200, 204].includes(response.status)) {
    throw new Error(`Authenticated check for ${pathname} returned ${response.status}`);
  }

  if (!authenticatedCookie && !body.includes(authSmokeMarker)) {
    throw new Error(`Authenticated smoke probe for ${pathname} did not return the expected marker`);
  }

  return {
    skipped: false,
    message: authenticatedCookie
      ? `Authenticated route ${pathname} responded with ${response.status}.`
      : `Development auth probe ${pathname} responded with ${response.status}.`
  };
}

async function main() {
  await assertRouteLoads('/sign-in', '/sign-in');
  await assertRouteLoads('/sign-up', '/sign-up');
  const redirectStatus = await assertProtectedRedirect(loggedOutProtectedPath);
  const authStatus = await assertAuthenticatedRoute(authenticatedPath);

  console.log(JSON.stringify({
    ok: true,
    baseUrl,
    checks: [
      '/sign-in loads',
      '/sign-up loads',
      redirectStatus?.message || `${loggedOutProtectedPath} redirects to /sign-in when logged out`,
      authStatus.message
    ]
  }, null, 2));
}

main().catch(error => {
  console.error(JSON.stringify({
    ok: false,
    baseUrl,
    error: error.message
  }, null, 2));
  process.exit(1);
});
