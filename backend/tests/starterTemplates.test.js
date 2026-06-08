import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalConnectionRuleObjects } from '../src/lib/connectionRules.js';
import { evaluateDiagram } from '../src/lib/evalHarness.js';
import { starterTemplates } from '../src/lib/starterTemplates.js';

const GENERIC_LABELS = new Set(['API', 'CONNECTION', 'INFERRING...', '']);

function buildRuleMap() {
  return new Map(
    canonicalConnectionRuleObjects.map(rule => [
      `${rule.source_category}->${rule.target_category}`,
      rule
    ])
  );
}

function assertQueueTopology(template) {
  const nodeById = new Map(template.nodes.map(node => [node.id, node]));
  const queues = template.nodes.filter(node => node.category === 'queue');

  assert.ok(queues.length > 0, 'expected at least one queue node');

  queues.forEach(queue => {
    const inbound = template.edges.filter(edge => edge.target === queue.id);
    const outbound = template.edges.filter(edge => edge.source === queue.id);
    const hasProducer = inbound.some(edge => {
      const sourceCategory = nodeById.get(edge.source)?.category;
      return ['backend', 'external', 'queue'].includes(sourceCategory);
    });
    const hasConsumer = outbound.some(edge => {
      const targetCategory = nodeById.get(edge.target)?.category;
      return ['backend', 'queue'].includes(targetCategory);
    });

    assert.equal(hasProducer, true, `${queue.name} should have a producer`);
    assert.equal(hasConsumer, true, `${queue.name} should have a consumer`);
  });
}

test('shared connection rules treat queue consumers as valid architecture flow', () => {
  const queueToBackend = canonicalConnectionRuleObjects.find(rule => (
    rule.source_category === 'queue' && rule.target_category === 'backend'
  ));

  assert.equal(queueToBackend?.is_valid, true);
});

test('starter templates are production-complete and rule-safe', () => {
  const ruleMap = buildRuleMap();

  Object.entries(starterTemplates).forEach(([templateId, template]) => {
    const categoryCounts = template.nodes.reduce((acc, node) => {
      acc[node.category] = (acc[node.category] || 0) + 1;
      return acc;
    }, {});
    const promptSpec = {
      requiredCategories: [
        templateId === 'mobile' ? 'mobile' : 'frontend',
        'backend',
        'database',
        'auth',
        'queue',
        'storage',
        'devops'
      ],
      requireAuth: true,
      requireQueue: true,
      requireDevops: true
    };
    const evaluation = evaluateDiagram(template, promptSpec);

    assert.equal(evaluation.score, 100, `${templateId} should pass eval checks`);
    assert.equal(categoryCounts.backend > 0, true, `${templateId} needs backend`);
    assert.equal(categoryCounts.database > 0, true, `${templateId} needs database`);
    assert.equal(categoryCounts.auth > 0, true, `${templateId} needs auth`);
    assert.equal(categoryCounts.queue > 0, true, `${templateId} needs queue`);
    assert.equal(categoryCounts.storage > 0, true, `${templateId} needs storage`);
    assert.equal(categoryCounts.devops > 0, true, `${templateId} needs devops`);

    template.edges.forEach(edge => {
      assert.equal(GENERIC_LABELS.has(String(edge.label || '').toUpperCase()), false, `${templateId} has generic edge ${edge.id}`);

      const source = template.nodes.find(node => node.id === edge.source);
      const target = template.nodes.find(node => node.id === edge.target);
      assert.ok(source, `${templateId} edge ${edge.id} source exists`);
      assert.ok(target, `${templateId} edge ${edge.id} target exists`);

      const rule = ruleMap.get(`${source.category}->${target.category}`);
      assert.notEqual(rule?.is_valid, false, `${templateId} invalid edge ${source.name} -> ${target.name}`);
    });

    assertQueueTopology(template);
  });
});
