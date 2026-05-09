const REQUIRED_FRONTEND_ENV = ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'];

export function getMissingFrontendEnv() {
  return REQUIRED_FRONTEND_ENV.filter(key => !process.env[key]);
}

export function assertFrontendEnv() {
  const missing = getMissingFrontendEnv();

  if (missing.length > 0) {
    throw new Error(`Missing required frontend environment variables: ${missing.join(', ')}`);
  }
}
