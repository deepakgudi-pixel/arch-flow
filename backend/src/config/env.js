const ALWAYS_REQUIRED_ENV = ['NEON_DB_URL'];

export function assertBackendEnv({
  requireAI = true,
  requireAuth = true
} = {}) {
  const missing = ALWAYS_REQUIRED_ENV.filter(key => !process.env[key]);

  if (requireAI && !process.env.OPENROUTER_API_KEY) {
    missing.push('OPENROUTER_API_KEY');
  }

  if (requireAuth && !process.env.CLERK_SECRET_KEY && !process.env.CLERK_JWT_KEY) {
    missing.push('CLERK_SECRET_KEY or CLERK_JWT_KEY');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required backend environment variables: ${missing.join(', ')}`);
  }
}
