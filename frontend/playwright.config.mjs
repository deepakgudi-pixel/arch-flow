import { defineConfig } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT || 3000);
const host = process.env.PLAYWRIGHT_HOST || '127.0.0.1';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://${host}:${port}`;
const shouldStartServer = process.env.PLAYWRIGHT_START_SERVER === '1';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  ...(shouldStartServer
    ? {
        webServer: {
          command: `npm run build && npm run start -- --hostname ${host} --port ${port}`,
          url: `${baseURL}/editor-smoke-probe`,
          reuseExistingServer: !process.env.CI,
          timeout: 180000,
        },
      }
    : {}),
});
