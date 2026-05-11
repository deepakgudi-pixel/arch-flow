import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDiagramReviewContext,
  normalizeReviewSuggestion,
  REVIEW_NEW_NODE_TOKEN,
} from '../src/lib/reviewDiagram.js';

test('buildDiagramReviewContext normalizes nodes, edges, and findings', () => {
  const context = buildDiagramReviewContext({
    diagramName: '  Blog platform  ',
    nodes: [
      { id: ' web ', name: ' Web App ', category: 'Frontend', role: ' ui ' },
      { id: 'db', name: ' Postgres ', category: 'DATABASE', role: ' data ' },
    ],
    edges: [
      { source: ' web ', target: 'db', label: ' restful sql ' },
    ],
    reviewFindings: [
      { severity: ' critical ', title: ' Missing cache ', detail: ' Needs a cache layer ' },
    ],
  });

  assert.equal(context.diagramName, 'Blog platform');
  assert.equal(context.nodes[0].id, 'web');
  assert.equal(context.nodes[0].name, 'Web App');
  assert.equal(context.nodes[0].category, 'frontend');
  assert.equal(context.edges[0].label, 'RESTFUL_SQL');
  assert.equal(context.summary.nodeCount, 2);
  assert.deepEqual(context.summary.criticalSignals, ['Missing cache']);
  assert.equal(context.connectionToken, REVIEW_NEW_NODE_TOKEN);
});

test('normalizeReviewSuggestion drops invalid connections and fills defaults', () => {
  const suggestion = normalizeReviewSuggestion(
    {
      name: ' Redis Cache ',
      category: 'QUEUE',
      role: '  ',
      reason: '',
      icon: 'bad icon',
      products: [{ name: ' Upstash Redis ', url: 'not-a-url' }],
      connections: [
        {
          source: REVIEW_NEW_NODE_TOKEN,
          target: 'api',
          label: ' redis pub sub ',
          reason: ' async handoff ',
        },
        {
          source: 'api',
          target: 'db',
          label: 'sql',
          reason: 'invalid because new node token is missing',
        },
      ],
    },
    new Set(['api']),
  );

  assert.equal(suggestion.name, 'Redis Cache');
  assert.equal(suggestion.category, 'queue');
  assert.equal(suggestion.role, 'Redis Cache covers the queue layer for this system.');
  assert.equal(suggestion.reason, 'Redis Cache fills a missing responsibility in the current architecture.');
  assert.equal(suggestion.icon, 'MessageSquare');
  assert.equal(suggestion.products[0].url, 'https://example.com');
  assert.equal(suggestion.connections.length, 1);
  assert.deepEqual(suggestion.connections[0], {
    source: REVIEW_NEW_NODE_TOKEN,
    target: 'api',
    label: 'REDIS_PUB_SUB',
    reason: 'async handoff',
  });
});

test('normalizeReviewSuggestion rejects duplicates without valid category/name', () => {
  assert.equal(normalizeReviewSuggestion(null, new Set()), null);
  assert.equal(
    normalizeReviewSuggestion({ name: ' ', category: 'backend' }, new Set()),
    null,
  );
  assert.equal(
    normalizeReviewSuggestion({ name: 'Cache', category: 'unknown' }, new Set()),
    null,
  );
});
