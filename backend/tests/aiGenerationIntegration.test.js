import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDiagramFromPrompt } from '../src/lib/diagramGenerator.js';

function activeFindings(quality) {
  return quality.findings.filter(finding => ['critical', 'warning'].includes(finding.severity));
}

test('generateDiagramFromPrompt hardens mocked AI output before returning it', async () => {
  const unsafeResponse = {
    nodes: [
      { name: 'React', category: 'frontend', role: 'UI', reason: 'User dashboard', icon: 'react' },
      { name: 'PostgreSQL', category: 'database', role: 'Data', reason: 'Primary store', icon: 'database' }
    ],
    edges: [
      { source: 'React', target: 'PostgreSQL', label: 'API' }
    ]
  };

  const result = await generateDiagramFromPrompt({
    description: 'mock ecommerce dashboard',
    callModel: async () => ({
      content: JSON.stringify(unsafeResponse),
      model: 'mock-model'
    })
  });

  assert.equal(result.model, 'mock-model');
  assert.equal(result.quality.score.score, 100);
  assert.deepEqual(activeFindings(result.quality), []);
  const reactNode = result.nodes.find(node => node.name === 'REACT');
  const postgresNode = result.nodes.find(node => node.name === 'POSTGRESQL');
  assert.ok(result.nodes.some(node => node.name === 'EXPRESS' && node.category === 'backend'));
  assert.ok(!result.edges.some(edge => edge.source === reactNode.id && edge.target === postgresNode.id));
  assert.ok(result.autoFixes.length > 0);
});

test('generateDiagramFromPrompt retries with repair instructions when mocked AI returns bad JSON', async () => {
  let calls = 0;
  const seenMessages = [];
  const originalConsoleError = console.error;

  console.error = () => {};

  try {
    const result = await generateDiagramFromPrompt({
      description: 'mock analytics platform',
      callModel: async (messages) => {
        calls += 1;
        seenMessages.push(messages);

        if (calls === 1) {
          return {
            content: 'not valid json',
            model: 'mock-model'
          };
        }

        return {
          content: JSON.stringify({
            nodes: [
              { name: 'React', category: 'frontend', role: 'UI', reason: 'Dashboards', icon: 'react' },
              { name: 'Go', category: 'backend', role: 'API', reason: 'Query API', icon: 'server' },
              { name: 'ClickHouse', category: 'database', role: 'Analytics', reason: 'OLAP store', icon: 'database' },
              { name: 'Kafka', category: 'queue', role: 'Events', reason: 'Stream processing', icon: 'message-square' }
            ],
            edges: [
              { source: 'React', target: 'Go', label: 'HTTPS' },
              { source: 'Go', target: 'ClickHouse', label: 'SQL' },
              { source: 'Go', target: 'Kafka', label: 'KAFKA' }
            ]
          }),
          model: 'mock-model'
        };
      }
    });

    assert.equal(calls, 2);
    assert.match(seenMessages[1].at(-1).content, /previous response could not be accepted/i);
    assert.equal(result.quality.score.score, 100);
    assert.deepEqual(activeFindings(result.quality), []);
  } finally {
    console.error = originalConsoleError;
  }
});
