import test from 'node:test';
import assert from 'node:assert/strict';
import { hardenNormalizedDiagramForReview } from '../src/lib/diagramGenerator.js';

const GENERIC_LABELS = new Set(['', 'API', 'CONNECTION', 'INFERRING...']);

function assertReviewSafe(result) {
  const activeFindings = result.quality.findings
    .filter(finding => finding.severity === 'critical' || finding.severity === 'warning');

  assert.deepEqual(activeFindings, []);
  assert.equal(result.quality.score.score, 100);
}

function categories(result) {
  return new Set(result.diagram.nodes.map(node => node.category));
}

function hasEdge(result, source, target) {
  return result.diagram.edges.some(edge => edge.source === source && edge.target === target);
}

test('review-safe hardening normalizes dangerous marketplace diagrams', () => {
  const result = hardenNormalizedDiagramForReview({
    nodes: [
      { name: 'REACT', category: 'frontend', role: 'UI', reason: 'Buyer dashboard', icon: 'react' },
      { name: 'EXPRESS', category: 'backend', role: 'API', reason: 'Marketplace logic', icon: 'server' },
      { name: 'POSTGRESQL', category: 'database', role: 'Orders', reason: 'Order state', icon: 'database' },
      { name: 'CLICKHOUSE', category: 'database', role: 'Analytics', reason: 'Seller metrics', icon: 'database' },
      { name: 'STRIPE', category: 'external', role: 'Payments', reason: 'Payment processor', icon: 'credit-card' },
    ],
    edges: [
      { source: 'REACT', target: 'POSTGRESQL', label: 'API' },
      { source: 'POSTGRESQL', target: 'EXPRESS', label: 'SQL' },
      { source: 'EXPRESS', target: 'STRIPE', label: 'CONNECTION' },
    ],
  });

  assertReviewSafe(result);
  assert.equal(hasEdge(result, 'REACT', 'POSTGRESQL'), false);
  assert.equal(hasEdge(result, 'POSTGRESQL', 'EXPRESS'), false);
  assert.ok(hasEdge(result, 'REACT', 'EXPRESS'));
  assert.ok(hasEdge(result, 'EXPRESS', 'POSTGRESQL'));
  assert.ok(result.diagram.nodes.some(node => node.name === 'REDIS'));
  assert.ok(result.diagram.edges.every(edge => !GENERIC_LABELS.has(edge.label)));
});

test('review-safe hardening creates complete queue producer and consumer paths', () => {
  const result = hardenNormalizedDiagramForReview({
    nodes: [
      { name: 'SWIFT', category: 'mobile', role: 'Mobile app', reason: 'iOS client', icon: 'smartphone' },
      { name: 'GO', category: 'backend', role: 'API', reason: 'Realtime API', icon: 'server' },
      { name: 'POSTGRESQL', category: 'database', role: 'Core data', reason: 'Primary store', icon: 'database' },
      { name: 'KAFKA', category: 'queue', role: 'Events', reason: 'Async work', icon: 'message-square' },
    ],
    edges: [
      { source: 'SWIFT', target: 'GO', label: 'API' },
      { source: 'GO', target: 'POSTGRESQL', label: 'SQL' },
    ],
  });

  assertReviewSafe(result);
  assert.ok(hasEdge(result, 'GO', 'KAFKA'));
  assert.ok(result.diagram.edges.some(edge => {
    const targetNode = result.diagram.nodes.find(node => node.name === edge.target);
    return edge.source === 'KAFKA' && targetNode?.category === 'backend';
  }));
});

test('review-safe hardening fills production support layers for complex systems', () => {
  const result = hardenNormalizedDiagramForReview({
    nodes: [
      { name: 'REACT', category: 'frontend', role: 'UI', reason: 'Analytics UI', icon: 'react' },
      { name: 'PYTHON', category: 'backend', role: 'ETL', reason: 'Batch jobs', icon: 'server' },
      { name: 'GO', category: 'backend', role: 'API', reason: 'Query API', icon: 'server' },
      { name: 'CLICKHOUSE', category: 'database', role: 'Warehouse', reason: 'Analytics store', icon: 'database' },
      { name: 'S3', category: 'storage', role: 'Lake', reason: 'Raw events', icon: 'hard-drive' },
      { name: 'SEGMENT', category: 'external', role: 'Events', reason: 'Event source', icon: 'activity' },
    ],
    edges: [
      { source: 'REACT', target: 'GO', label: 'HTTPS' },
      { source: 'GO', target: 'CLICKHOUSE', label: 'SQL' },
      { source: 'PYTHON', target: 'S3', label: 'S3' },
      { source: 'SEGMENT', target: 'PYTHON', label: 'WEBHOOK' },
    ],
  });

  assertReviewSafe(result);
  const foundCategories = categories(result);
  ['frontend', 'backend', 'database', 'queue', 'auth', 'storage', 'external', 'devops']
    .forEach(category => assert.ok(foundCategories.has(category), `Expected ${category} layer`));
  assert.ok(result.diagram.nodes.some(node => node.name === 'CLERK'));
  assert.ok(result.diagram.nodes.some(node => node.name === 'PROMETHEUS'));
  assert.ok(result.diagram.nodes.some(node => node.name === 'GRAFANA'));
  assert.ok(result.diagram.nodes.some(node => node.name === 'NGINX'));
});
