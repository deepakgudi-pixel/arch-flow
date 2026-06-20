import test from 'node:test';
import assert from 'node:assert/strict';

const ROUTE_MODULES = [
  '../src/routes/ai.js',
  '../src/routes/diagrams.js',
  '../src/routes/inventory.js',
  '../src/routes/settings.js',
  '../src/routes/users.js'
];

test('backend route modules load without startup reference errors', async () => {
  const modules = await Promise.all(ROUTE_MODULES.map(modulePath => import(modulePath)));

  modules.forEach((routeModule, index) => {
    assert.ok(routeModule.default, `Expected default router export from ${ROUTE_MODULES[index]}`);
  });
});
