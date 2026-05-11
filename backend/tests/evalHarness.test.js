import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeRunStability,
  evaluateDiagram,
  generatePromptMatrix,
  mergePromptSets,
} from '../src/lib/evalHarness.js';

test('generatePromptMatrix rotates families and respects max prompts', () => {
  const prompts = generatePromptMatrix(
    {
      families: [
        { id: 'saas', description: 'saas platform', expectedCategories: ['frontend'], template: 'saas' },
        { id: 'realtime', description: 'realtime system', expectedCategories: ['backend'], template: 'realtime' },
      ],
      clientTypes: [{ id: 'web', label: 'web', expectedCategories: ['frontend'] }],
      scaleLevels: [{ id: 'mid', label: 'mid-scale', requireQueue: true }],
      constraints: [{ id: 'secure', label: 'strict auth', requireAuth: true }],
    },
    2,
  );

  assert.equal(prompts.length, 2);
  assert.notEqual(prompts[0].id, prompts[1].id);
  assert.equal(prompts[0].requireAuth, true);
  assert.equal(prompts[0].requireQueue, true);
});

test('mergePromptSets deduplicates prompts by normalized text', () => {
  const merged = mergePromptSets(
    [{ id: 'a', prompt: ' Build a SaaS app ' }],
    [{ id: 'b', prompt: 'Build   a SaaS app' }, { id: 'c', prompt: 'Build a queue-backed app' }],
  );

  assert.deepEqual(
    merged.map(item => item.id),
    ['a', 'c'],
  );
});

test('evaluateDiagram flags invalid connections and missing auth', () => {
  const result = evaluateDiagram(
    {
      nodes: [
        { id: 'fe', name: 'Frontend', category: 'frontend' },
        { id: 'db', name: 'Postgres', category: 'database' },
      ],
      edges: [
        { source: 'fe', target: 'db', label: 'SQL' },
      ],
    },
    {
      requiredCategories: ['frontend', 'database'],
      requireAuth: true,
      requireQueue: false,
      requireDevops: false,
    },
  );

  const failedChecks = result.checks.filter(check => !check.passed).map(check => check.key);
  assert.ok(failedChecks.includes('NO_INVALID_CONNECTIONS'));
  assert.ok(failedChecks.includes('NO_CLIENT_DATABASE_BYPASS'));
  assert.ok(failedChecks.includes('HAS_AUTH'));
});

test('computeRunStability returns one for identical diagrams', () => {
  const stability = computeRunStability([
    {
      nodes: [{ id: 'a', name: 'Frontend', category: 'frontend' }],
      edges: [],
    },
    {
      nodes: [{ id: 'b', name: 'Frontend', category: 'frontend' }],
      edges: [],
    },
  ]);

  assert.equal(stability, 1);
});
