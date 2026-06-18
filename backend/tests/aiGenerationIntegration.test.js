import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDiagramUserMessage, generateDiagramFromPrompt } from '../src/lib/diagramGenerator.js';

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

test('generateDiagramFromPrompt accepts diagram JSON wrapped in an array', async () => {
  const wrappedResponse = [
    {
      nodes: [
        { name: 'React', category: 'frontend', role: 'UI', reason: 'Dashboards', icon: 'react' },
        { name: 'Java', category: 'backend', role: 'API', reason: 'Core services', icon: 'server' },
        { name: 'PostgreSQL', category: 'database', role: 'Data', reason: 'Metadata store', icon: 'database' },
        { name: 'Kafka', category: 'queue', role: 'Events', reason: 'Async delivery', icon: 'message-square' }
      ],
      edges: [
        { source: 'React', target: 'Java', label: 'HTTPS' },
        { source: 'Java', target: 'PostgreSQL', label: 'SQL' },
        { source: 'Java', target: 'Kafka', label: 'KAFKA' }
      ]
    }
  ];

  const result = await generateDiagramFromPrompt({
    description: 'mock collaboration app',
    callModel: async () => ({
      content: JSON.stringify(wrappedResponse),
      model: 'mock-model'
    })
  });

  assert.equal(result.quality.score.score, 100);
  assert.deepEqual(activeFindings(result.quality), []);
  assert.ok(result.nodes.some(node => node.name === 'REACT'));
});

test('generateDiagramFromPrompt recovers a complete diagram object from a truncated wrapper', async () => {
  const truncatedWrapper = `[
    {
      "nodes": [
        { "name": "React", "category": "frontend", "role": "UI", "reason": "Dashboards", "icon": "react" },
        { "name": "Java", "category": "backend", "role": "API", "reason": "Core services", "icon": "server" },
        { "name": "PostgreSQL", "category": "database", "role": "Data", "reason": "Metadata store", "icon": "database" },
        { "name": "Kafka", "category": "queue", "role": "Events", "reason": "Async delivery", "icon": "message-square" }
      ],
      "edges": [
        { "source": "React", "target": "Java", "label": "HTTPS" },
        { "source": "Java", "target": "PostgreSQL", "label": "SQL" },
        { "source": "Java", "target": "Kafka", "label": "KAFKA" }
      ]
    }`;

  const result = await generateDiagramFromPrompt({
    description: 'mock realtime dashboard',
    callModel: async () => ({
      content: truncatedWrapper,
      model: 'mock-model'
    })
  });

  assert.equal(result.quality.score.score, 100);
  assert.deepEqual(activeFindings(result.quality), []);
  assert.ok(result.nodes.some(node => node.name === 'JAVA'));
});

test('generateDiagramFromPrompt keeps using AI repair attempts until a valid diagram is returned', async () => {
  let calls = 0;
  const originalConsoleError = console.error;

  console.error = () => {};

  try {
    const result = await generateDiagramFromPrompt({
      description: 'mock streaming platform',
      callModel: async () => {
        calls += 1;

        if (calls < 4) {
          return {
            content: calls === 1 ? 'not json' : '{"nodes": []',
            model: 'mock-model'
          };
        }

        return {
          content: JSON.stringify({
            nodes: [
              { name: 'React', category: 'frontend', role: 'UI', reason: 'Playback UI', icon: 'react' },
              { name: 'Go', category: 'backend', role: 'API', reason: 'Video APIs', icon: 'server' },
              { name: 'PostgreSQL', category: 'database', role: 'Metadata', reason: 'Catalog data', icon: 'database' },
              { name: 'Kafka', category: 'queue', role: 'Events', reason: 'Async processing', icon: 'message-square' }
            ],
            edges: [
              { source: 'React', target: 'Go', label: 'HTTPS' },
              { source: 'Go', target: 'PostgreSQL', label: 'SQL' },
              { source: 'Go', target: 'Kafka', label: 'KAFKA' }
            ]
          }),
          model: 'mock-model'
        };
      }
    });

    assert.equal(calls, 4);
    assert.equal(result.quality.score.score, 100);
    assert.deepEqual(activeFindings(result.quality), []);
  } finally {
    console.error = originalConsoleError;
  }
});

test('generateDiagramFromPrompt domain-tunes food delivery diagrams beyond a generic tech stack', async () => {
  const genericFoodDeliveryResponse = {
    nodes: [
      { name: 'Kotlin', category: 'mobile', role: 'Android Client', reason: 'Native mobile app', icon: 'smartphone' },
      { name: 'Swift', category: 'mobile', role: 'iOS Client', reason: 'Native mobile app', icon: 'smartphone' },
      { name: 'React', category: 'frontend', role: 'Web Client', reason: 'Admin UI', icon: 'react' },
      { name: 'Express', category: 'backend', role: 'Core Service', reason: 'Business logic', icon: 'server' },
      { name: 'Go', category: 'backend', role: 'Realtime Service', reason: 'Low latency', icon: 'server' },
      { name: 'FastAPI', category: 'backend', role: 'ML Service', reason: 'Risk checks', icon: 'server' },
      { name: 'PostgreSQL', category: 'database', role: 'Relational Store', reason: 'Order data', icon: 'database' },
      { name: 'Redis', category: 'database', role: 'Cache', reason: 'Fast state', icon: 'database' },
      { name: 'Kafka', category: 'queue', role: 'Event Bus', reason: 'Async work', icon: 'message-square' },
      { name: 'Clerk', category: 'auth', role: 'Auth', reason: 'Users', icon: 'shield' },
      { name: 'S3', category: 'storage', role: 'Storage', reason: 'Assets', icon: 'hard-drive' },
      { name: 'Stripe', category: 'external', role: 'Payments', reason: 'Cards', icon: 'credit-card' },
      { name: 'Google Maps', category: 'external', role: 'Maps', reason: 'Routing', icon: 'map' }
    ],
    edges: [
      { source: 'Kotlin', target: 'Express', label: 'HTTPS' },
      { source: 'Swift', target: 'Go', label: 'WEBSOCKET' },
      { source: 'React', target: 'Express', label: 'HTTPS' },
      { source: 'Express', target: 'PostgreSQL', label: 'SQL' },
      { source: 'Express', target: 'Redis', label: 'TCP' },
      { source: 'Express', target: 'Kafka', label: 'KAFKA' },
      { source: 'Kafka', target: 'FastAPI', label: 'KAFKA' },
      { source: 'Express', target: 'Stripe', label: 'HTTPS' },
      { source: 'Go', target: 'Google Maps', label: 'HTTPS' }
    ]
  };

  const result = await generateDiagramFromPrompt({
    description: 'Design a food delivery platform combining DoorDash and Uber Eats with restaurants, couriers, customers, dispatch, maps, payments, promos, fraud, notifications, and operations monitoring.',
    callModel: async () => ({
      content: JSON.stringify(genericFoodDeliveryResponse),
      model: 'mock-model'
    })
  });

  const roles = result.nodes.map(node => node.role).join(' | ');
  const names = new Set(result.nodes.map(node => node.name));

  assert.equal(result.quality.score.score, 100);
  assert.deepEqual(activeFindings(result.quality), []);
  assert.match(roles, /Customer ordering app/);
  assert.match(roles, /Courier driver app/);
  assert.match(roles, /Restaurant ops dashboard/);
  assert.match(roles, /Dispatch matching/);
  assert.match(roles, /Pricing fraud promos/);
  assert.match(roles, /Notifications/);
  assert.ok(names.has('TWILIO'));
});

test('generateDiagramFromPrompt domain-tunes stock trading diagrams beyond a generic tech stack', async () => {
  const genericTradingResponse = {
    nodes: [
      { name: 'Kotlin', category: 'mobile', role: 'Android Client', reason: 'Native mobile app', icon: 'smartphone' },
      { name: 'Swift', category: 'mobile', role: 'iOS Client', reason: 'Native mobile app', icon: 'smartphone' },
      { name: 'React', category: 'frontend', role: 'Web Client', reason: 'Dashboard UI', icon: 'react' },
      { name: 'Java', category: 'backend', role: 'Core Service', reason: 'Business logic', icon: 'server' },
      { name: 'Python', category: 'backend', role: 'Worker Service', reason: 'Risk logic', icon: 'server' },
      { name: 'Spring Boot', category: 'backend', role: 'API Service', reason: 'Request routing', icon: 'server' },
      { name: 'Go', category: 'backend', role: 'Realtime Service', reason: 'Low latency', icon: 'server' },
      { name: 'PostgreSQL', category: 'database', role: 'Relational Store', reason: 'Account data', icon: 'database' },
      { name: 'Redis', category: 'database', role: 'Cache', reason: 'Fast state', icon: 'database' },
      { name: 'TimescaleDB', category: 'database', role: 'Time Series', reason: 'Market history', icon: 'database' },
      { name: 'Kafka', category: 'queue', role: 'Event Bus', reason: 'Async work', icon: 'message-square' },
      { name: 'Clerk', category: 'auth', role: 'Auth', reason: 'Users', icon: 'shield' },
      { name: 'S3', category: 'storage', role: 'Storage', reason: 'Reports', icon: 'hard-drive' },
      { name: 'Prometheus', category: 'devops', role: 'Metrics', reason: 'Monitoring', icon: 'activity' }
    ],
    edges: [
      { source: 'Kotlin', target: 'Java', label: 'HTTPS' },
      { source: 'Swift', target: 'Java', label: 'HTTPS' },
      { source: 'React', target: 'Java', label: 'HTTPS' },
      { source: 'Java', target: 'Python', label: 'gRPC' },
      { source: 'Java', target: 'Spring Boot', label: 'gRPC' },
      { source: 'React', target: 'Go', label: 'WEBSOCKET' },
      { source: 'Java', target: 'PostgreSQL', label: 'SQL' },
      { source: 'Go', target: 'TimescaleDB', label: 'SQL' },
      { source: 'Go', target: 'Redis', label: 'TCP' },
      { source: 'Java', target: 'Kafka', label: 'KAFKA' },
      { source: 'Java', target: 'S3', label: 'S3' }
    ]
  };

  const result = await generateDiagramFromPrompt({
    description: 'Design a global stock trading platform like Robinhood: mobile trading apps, web dashboard, market data ingestion, order placement, order routing, portfolio balances, risk checks, fraud detection, notifications, audit logs, reconciliation, compliance reporting, observability, and strict consistency during high-volume market open.',
    callModel: async () => ({
      content: JSON.stringify(genericTradingResponse),
      model: 'mock-model'
    })
  });

  const roles = result.nodes.map(node => node.role).join(' | ');
  const names = new Set(result.nodes.map(node => node.name));

  assert.equal(result.quality.score.score, 100);
  assert.deepEqual(activeFindings(result.quality), []);
  assert.match(roles, /Android trading app/);
  assert.match(roles, /iOS trading app/);
  assert.match(roles, /Web trading dashboard/);
  assert.match(roles, /Market data gateway/);
  assert.match(roles, /Order routing/);
  assert.match(roles, /Portfolio ledger/);
  assert.match(roles, /Risk fraud engine/);
  assert.match(roles, /Audit report archive/);
  assert.ok(names.has('PLAID'));
  assert.ok(names.has('TWILIO'));
  assert.ok(names.has('VAULT'));
});

test('generateDiagramFromPrompt domain-tunes travel marketplace diagrams beyond a generic tech stack', async () => {
  const genericTravelResponse = {
    nodes: [
      { name: 'Kotlin', category: 'mobile', role: 'Android Client', reason: 'Native mobile app', icon: 'smartphone' },
      { name: 'Swift', category: 'mobile', role: 'iOS Client', reason: 'Native mobile app', icon: 'smartphone' },
      { name: 'React', category: 'frontend', role: 'Web Client', reason: 'Marketplace UI', icon: 'react' },
      { name: 'Python', category: 'backend', role: 'Worker Service', reason: 'Risk logic', icon: 'server' },
      { name: 'FastAPI', category: 'backend', role: 'API Service', reason: 'Business logic', icon: 'server' },
      { name: 'Go', category: 'backend', role: 'Realtime Service', reason: 'Low latency', icon: 'server' },
      { name: 'PostgreSQL', category: 'database', role: 'Relational Store', reason: 'Booking data', icon: 'database' },
      { name: 'Redis', category: 'database', role: 'Cache', reason: 'Fast state', icon: 'database' },
      { name: 'Kafka', category: 'queue', role: 'Event Bus', reason: 'Async work', icon: 'message-square' },
      { name: 'Clerk', category: 'auth', role: 'Auth', reason: 'Users', icon: 'shield' },
      { name: 'S3', category: 'storage', role: 'Storage', reason: 'Images', icon: 'hard-drive' },
      { name: 'Stripe', category: 'external', role: 'Payments', reason: 'Cards payouts', icon: 'credit-card' },
      { name: 'Google Maps', category: 'external', role: 'Maps', reason: 'Geo data', icon: 'map' },
      { name: 'Twilio', category: 'external', role: 'Notifications', reason: 'SMS updates', icon: 'phone' },
      { name: 'Prometheus', category: 'devops', role: 'Metrics', reason: 'Monitoring', icon: 'activity' }
    ],
    edges: [
      { source: 'Kotlin', target: 'FastAPI', label: 'HTTPS' },
      { source: 'Swift', target: 'FastAPI', label: 'HTTPS' },
      { source: 'React', target: 'FastAPI', label: 'HTTPS' },
      { source: 'FastAPI', target: 'Clerk', label: 'OIDC' },
      { source: 'FastAPI', target: 'PostgreSQL', label: 'SQL' },
      { source: 'FastAPI', target: 'Redis', label: 'TCP' },
      { source: 'FastAPI', target: 'Kafka', label: 'KAFKA' },
      { source: 'FastAPI', target: 'S3', label: 'S3' },
      { source: 'FastAPI', target: 'Stripe', label: 'HTTPS' },
      { source: 'FastAPI', target: 'Google Maps', label: 'HTTPS' },
      { source: 'FastAPI', target: 'Twilio', label: 'HTTPS' },
      { source: 'Go', target: 'Redis', label: 'TCP' },
      { source: 'Kafka', target: 'Python', label: 'KAFKA' }
    ]
  };

  const result = await generateDiagramFromPrompt({
    description: 'Design an Airbnb-scale travel marketplace with guest and host apps, property search, availability calendars, booking checkout, dynamic pricing, payments, host payouts, in-app messaging, reviews, maps, fraud detection, identity verification, notifications, image storage, analytics, trust and safety workflows, and operations monitoring.',
    callModel: async () => ({
      content: JSON.stringify(genericTravelResponse),
      model: 'mock-model'
    })
  });

  const roles = result.nodes.map(node => node.role).join(' | ');
  const names = new Set(result.nodes.map(node => node.name));

  assert.equal(result.quality.score.score, 100);
  assert.deepEqual(activeFindings(result.quality), []);
  assert.match(roles, /Guest mobile app/);
  assert.match(roles, /Host mobile app/);
  assert.match(roles, /Marketplace web app/);
  assert.match(roles, /Booking API/);
  assert.match(roles, /Availability calendar/);
  assert.match(roles, /Trust safety engine/);
  assert.match(roles, /Guest messaging/);
  assert.match(roles, /Booking ledger/);
  assert.match(roles, /Listing image storage/);
  assert.match(roles, /Payments payouts/);
  assert.match(roles, /Property search/);
  assert.ok(names.has('ELASTICSEARCH'));
  assert.ok(names.has('ALGOLIA'));
});

test('generateDiagramFromPrompt expands complex digital banking prompts into explicit service boundaries', async () => {
  const compactBankingResponse = {
    nodes: [
      { name: 'Kotlin', category: 'mobile', role: 'Mobile client', reason: 'Customer access', icon: 'smartphone' },
      { name: 'React', category: 'frontend', role: 'Web client', reason: 'Customer access', icon: 'react' },
      { name: 'Java', category: 'backend', role: 'Core Service', reason: 'Business logic', icon: 'server' },
      { name: 'PostgreSQL', category: 'database', role: 'Relational Store', reason: 'Account data', icon: 'database' },
      { name: 'Redis', category: 'database', role: 'Cache', reason: 'Fast state', icon: 'database' },
      { name: 'Kafka', category: 'queue', role: 'Event Bus', reason: 'Async work', icon: 'message-square' },
      { name: 'S3', category: 'storage', role: 'Storage', reason: 'Documents', icon: 'hard-drive' },
      { name: 'Plaid', category: 'external', role: 'Banking', reason: 'Bank accounts', icon: 'credit-card' },
      { name: 'Prometheus', category: 'devops', role: 'Metrics', reason: 'Monitoring', icon: 'activity' }
    ],
    edges: [
      { source: 'Kotlin', target: 'Java', label: 'HTTPS' },
      { source: 'React', target: 'Java', label: 'HTTPS' },
      { source: 'Java', target: 'PostgreSQL', label: 'SQL' },
      { source: 'Java', target: 'Redis', label: 'TCP' },
      { source: 'Java', target: 'Kafka', label: 'KAFKA' },
      { source: 'Java', target: 'S3', label: 'S3' },
      { source: 'Java', target: 'Plaid', label: 'HTTPS' },
      { source: 'Java', target: 'Prometheus', label: 'HTTP' }
    ]
  };

  const result = await generateDiagramFromPrompt({
    description: 'Design a globally distributed digital banking platform serving 100 million users with multi-currency wallets, double-entry ledger, card authorization, bank transfers, payment processing, realtime fraud detection, compliance screening, disputes, reconciliation, scheduled payments, notifications, immutable audit logs, customer support, regulatory reporting, active-active regions, idempotent writes, data residency, PCI-DSS, GDPR, dead-letter queues, disaster recovery, and zero-downtime deployments.',
    callModel: async () => ({
      content: JSON.stringify(compactBankingResponse),
      model: 'mock-model'
    })
  });

  const names = new Set(result.nodes.map(node => node.name));
  const expectedComponents = [
    'API_GATEWAY',
    'CUSTOMER_PROFILE_SERVICE',
    'WALLET_SERVICE',
    'LEDGER_SERVICE',
    'CARD_AUTHORIZATION_SERVICE',
    'TRANSFER_SERVICE',
    'PAYMENT_ORCHESTRATOR',
    'FRAUD_ENGINE',
    'COMPLIANCE_SERVICE',
    'DISPUTE_SERVICE',
    'RECONCILIATION_SERVICE',
    'SCHEDULED_PAYMENTS_SERVICE',
    'AUDIT_LOG_SERVICE',
    'REPORTING_SERVICE',
    'SUPPORT_CASE_SERVICE',
    'DEAD_LETTER_QUEUE',
    'COCKROACHDB',
    'AUDIT_ARCHIVE',
    'KUBERNETES',
    'VAULT',
    'ARGOCD'
  ];

  assert.equal(result.quality.score.score, 100);
  assert.deepEqual(activeFindings(result.quality), []);
  assert.ok(result.nodes.length >= 36);
  expectedComponents.forEach(name => assert.ok(names.has(name), `Expected ${name}`));
  assert.ok(result.autoFixes.some(change => /digital banking service boundaries/i.test(change)));
});

test('buildDiagramUserMessage expands showcase architecture examples', () => {
  const netflixPrompt = buildDiagramUserMessage('make it resilient', 'example:netflix');
  const stripePrompt = buildDiagramUserMessage('include compliance', 'example:stripe');

  assert.match(netflixPrompt, /Netflix-scale video streaming architecture/i);
  assert.match(netflixPrompt, /CDN delivery/i);
  assert.match(netflixPrompt, /make it resilient/i);
  assert.match(stripePrompt, /Stripe-scale fintech architecture/i);
  assert.match(stripePrompt, /compliance audit logs/i);
});
