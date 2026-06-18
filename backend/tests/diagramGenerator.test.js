import test from 'node:test';
import assert from 'node:assert/strict';
import { hardenNormalizedDiagramForReview } from '../src/lib/diagramGenerator.js';
import { detectRequirementProfile } from '../src/lib/diagramGenerator/requirementCoverage.js';

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

test('hardenNormalizedDiagramForReview does not award 100 when prompt requirements are missing', () => {
  const result = hardenNormalizedDiagramForReview(
    {
      nodes: [
        { name: 'REACT', category: 'frontend', role: 'Banking UI', reason: 'Customer access', icon: 'react' },
        { name: 'SPRING_BOOT', category: 'backend', role: 'Core Service', reason: 'Banking logic', icon: 'server' },
        { name: 'POSTGRESQL', category: 'database', role: 'Account data', reason: 'Primary store', icon: 'database' },
      ],
      edges: [
        { source: 'REACT', target: 'SPRING_BOOT', label: 'HTTPS' },
        { source: 'SPRING_BOOT', target: 'POSTGRESQL', label: 'SQL' },
      ],
    },
    {
      description: 'Design a digital banking platform with multi-currency wallets, double-entry ledger, fraud detection, compliance, reconciliation, and active-active regional deployment.',
    },
  );

  const findingTitles = result.quality.findings.map(finding => finding.title);

  assert.ok(result.quality.score.score < 100);
  assert.ok(findingTitles.includes('MISSING_REQUIRED_DOUBLE_ENTRY_LEDGER'));
  assert.ok(findingTitles.includes('MISSING_REQUIRED_FRAUD_DETECTION'));
  assert.ok(findingTitles.includes('MISSING_REQUIRED_ACTIVE_ACTIVE_REGIONS'));
});

test('digital banking detection does not hijack ordinary payment-processing prompts', () => {
  assert.equal(
    detectRequirementProfile({
      description: 'Design an ecommerce checkout with payment processing, inventory, shipping, and email receipts.',
    }),
    null,
  );
  assert.equal(
    detectRequirementProfile({
      description: 'Design a banking platform with wallets, ledger consistency, transfers, compliance, and reconciliation.',
    }),
    'digital_banking',
  );
});
