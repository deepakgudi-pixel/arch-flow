import test from 'node:test';
import assert from 'node:assert/strict';
import { hardenNormalizedDiagramForReview } from '../src/lib/diagramGenerator.js';

function activeFindings(quality) {
  return quality.findings.filter(finding => ['critical', 'warning'].includes(finding.severity));
}

test('hardenNormalizedDiagramForReview removes direct client-to-database violations', () => {
  const result = hardenNormalizedDiagramForReview({
    nodes: [
      { name: 'REACT', category: 'frontend', role: 'UI', reason: 'User app', icon: 'react' },
      { name: 'POSTGRESQL', category: 'database', role: 'Data', reason: 'Primary store', icon: 'database' },
    ],
    edges: [
      { source: 'REACT', target: 'POSTGRESQL', label: 'SQL' },
    ],
  });

  assert.equal(activeFindings(result.quality).length, 0);
  assert.equal(result.quality.score.score, 100);
  assert.ok(result.diagram.nodes.some(node => node.name === 'EXPRESS' && node.category === 'backend'));
  assert.ok(result.diagram.edges.some(edge => edge.source === 'REACT' && edge.target === 'EXPRESS'));
  assert.ok(result.diagram.edges.some(edge => edge.source === 'EXPRESS' && edge.target === 'POSTGRESQL'));
  assert.ok(!result.diagram.edges.some(edge => edge.source === 'REACT' && edge.target === 'POSTGRESQL'));
});

test('hardenNormalizedDiagramForReview makes queues production-safe', () => {
  const result = hardenNormalizedDiagramForReview({
    nodes: [
      { name: 'REACT', category: 'frontend', role: 'UI', reason: 'User app', icon: 'react' },
      { name: 'EXPRESS', category: 'backend', role: 'API', reason: 'Application API', icon: 'server' },
      { name: 'KAFKA', category: 'queue', role: 'Events', reason: 'Async work', icon: 'message-square' },
    ],
    edges: [
      { source: 'REACT', target: 'EXPRESS', label: 'HTTPS' },
    ],
  });

  assert.equal(activeFindings(result.quality).length, 0);
  assert.equal(result.quality.score.score, 100);
  assert.ok(result.diagram.edges.some(edge => edge.source === 'EXPRESS' && edge.target === 'KAFKA'));
  assert.ok(result.diagram.edges.some(edge => edge.source === 'KAFKA' && edge.target.endsWith('_WORKER')));
});

test('hardenNormalizedDiagramForReview fills generated diagrams to a perfect review score', () => {
  const result = hardenNormalizedDiagramForReview({
    nodes: [
      { name: 'REACT', category: 'frontend', role: 'UI', reason: 'Dashboard', icon: 'react' },
      { name: 'GO', category: 'backend', role: 'API', reason: 'Low latency API', icon: 'server' },
      { name: 'PYTHON', category: 'backend', role: 'Workers', reason: 'Data jobs', icon: 'server' },
      { name: 'POSTGRESQL', category: 'database', role: 'OLTP', reason: 'Primary store', icon: 'database' },
      { name: 'CLICKHOUSE', category: 'database', role: 'Analytics', reason: 'Fast queries', icon: 'database' },
      { name: 'STRIPE', category: 'external', role: 'Billing', reason: 'Payments', icon: 'credit-card' },
    ],
    edges: [
      { source: 'REACT', target: 'POSTGRESQL', label: 'API' },
      { source: 'POSTGRESQL', target: 'GO', label: 'SQL' },
      { source: 'GO', target: 'STRIPE', label: 'API' },
    ],
  });

  assert.equal(activeFindings(result.quality).length, 0);
  assert.equal(result.quality.score.score, 100);
  assert.ok(result.diagram.nodes.some(node => node.name === 'REDIS'));
  assert.ok(result.diagram.nodes.some(node => node.name === 'KAFKA'));
  assert.ok(result.diagram.nodes.some(node => node.name === 'CLERK'));
  assert.ok(result.diagram.nodes.some(node => node.name === 'S3'));
  assert.ok(result.diagram.nodes.some(node => node.name === 'PROMETHEUS'));
  assert.ok(result.diagram.nodes.some(node => node.name === 'GRAFANA'));
  assert.ok(result.diagram.nodes.some(node => node.name === 'NGINX'));
  assert.ok(!result.diagram.edges.some(edge => edge.source === 'REACT' && edge.target === 'POSTGRESQL'));
});
