import { categoryOrder, categorizeTech, getCategoryProducts } from './tech.js';
import { callOpenRouter, callOpenRouterForJSON, DIAGRAM_MODEL, robustParseJSON } from './openRouter.js';

const VALID_CATEGORIES = new Set(categoryOrder);

const FIXTURE_MAP = {
  'SWIFT': { category: 'mobile', icon: 'smartphone' },
  'KOTLIN': { category: 'mobile', icon: 'smartphone' },
  'REACT_NATIVE': { category: 'mobile', icon: 'smartphone' },
  'FLUTTER': { category: 'mobile', icon: 'smartphone' },
  'EXPO': { category: 'mobile', icon: 'smartphone' },
  'IONIC': { category: 'mobile', icon: 'smartphone' },
  'NEXT.JS': { category: 'frontend', icon: 'react' },
  'REACT': { category: 'frontend', icon: 'react' },
  'VUE': { category: 'frontend', icon: 'vue' },
  'SVELTE': { category: 'frontend', icon: 'svelte' },
  'ANGULAR': { category: 'frontend', icon: 'angular' },
  'ASTRO': { category: 'frontend', icon: 'react' },
  'NUXT': { category: 'frontend', icon: 'vue' },
  'REMIX': { category: 'frontend', icon: 'react' },
  'EXPRESS': { category: 'backend', icon: 'server' },
  'FASTAPI': { category: 'backend', icon: 'server' },
  'NESTJS': { category: 'backend', icon: 'server' },
  'DJANGO': { category: 'backend', icon: 'server' },
  'SPRING_BOOT': { category: 'backend', icon: 'server' },
  'GO': { category: 'backend', icon: 'server' },
  'RUST': { category: 'backend', icon: 'server' },
  'LARAVEL': { category: 'backend', icon: 'server' },
  'ASPNET_CORE': { category: 'backend', icon: 'server' },
  'GRAPHQL': { category: 'backend', icon: 'server' },
  'TRPC': { category: 'backend', icon: 'server' },
  'HONO': { category: 'backend', icon: 'server' },
  'FLASK': { category: 'backend', icon: 'server' },
  'GIN': { category: 'backend', icon: 'server' },
  'ECHO': { category: 'backend', icon: 'server' },
  'POSTGRESQL': { category: 'database', icon: 'database' },
  'MYSQL': { category: 'database', icon: 'database' },
  'MONGODB': { category: 'database', icon: 'database' },
  'REDIS': { category: 'database', icon: 'database' },
  'CASSANDRA': { category: 'database', icon: 'database' },
  'DYNAMODB': { category: 'database', icon: 'database' },
  'COUCHBASE': { category: 'database', icon: 'database' },
  'NEO4J': { category: 'database', icon: 'database' },
  'INFLUXDB': { category: 'database', icon: 'database' },
  'TIMESCALEDB': { category: 'database', icon: 'database' },
  'COCKROACHDB': { category: 'database', icon: 'database' },
  'MARIADB': { category: 'database', icon: 'database' },
  'MEMCACHED': { category: 'database', icon: 'database' },
  'ELASTICSEARCH': { category: 'database', icon: 'database' },
  'CLICKHOUSE': { category: 'database', icon: 'database' },
  'VITESS': { category: 'database', icon: 'database' },
  'BIGTABLE': { category: 'database', icon: 'database' },
  'KAFKA': { category: 'queue', icon: 'message-square' },
  'RABBITMQ': { category: 'queue', icon: 'message-square' },
  'SQS': { category: 'queue', icon: 'message-square' },
  'BULLMQ': { category: 'queue', icon: 'message-square' },
  'PUB_SUB': { category: 'queue', icon: 'message-square' },
  'NATS': { category: 'queue', icon: 'message-square' },
  'REDPANDA': { category: 'queue', icon: 'message-square' },
  'CELERY': { category: 'queue', icon: 'message-square' },
  'CLERK': { category: 'auth', icon: 'shield' },
  'AUTH0': { category: 'auth', icon: 'shield' },
  'SUPABASE_AUTH': { category: 'auth', icon: 'shield' },
  'FIREBASE_AUTH': { category: 'auth', icon: 'shield' },
  'KEYCLOAK': { category: 'auth', icon: 'shield' },
  'OKTA': { category: 'auth', icon: 'shield' },
  'AZURE_AD': { category: 'auth', icon: 'shield' },
  'COGNITO': { category: 'auth', icon: 'shield' },
  'S3': { category: 'storage', icon: 'hard-drive' },
  'CLOUDFLARE_R2': { category: 'storage', icon: 'hard-drive' },
  'SUPABASE_STORAGE': { category: 'storage', icon: 'hard-drive' },
  'UPLOADTHING': { category: 'storage', icon: 'hard-drive' },
  'MINIO': { category: 'storage', icon: 'hard-drive' },
  'GCS': { category: 'storage', icon: 'hard-drive' },
  'AZURE_BLOB': { category: 'storage', icon: 'hard-drive' },
  'STRIPE': { category: 'external', icon: 'credit-card' },
  'TWILIO': { category: 'external', icon: 'phone' },
  'SENDGRID': { category: 'external', icon: 'mail' },
  'RESEND': { category: 'external', icon: 'mail' },
  'ALGOLIA': { category: 'external', icon: 'search' },
  'MAPBOX': { category: 'external', icon: 'map' },
  'DATADOG': { category: 'external', icon: 'bar-chart' },
  'SENTRY': { category: 'external', icon: 'bug' },
  'DOCKER': { category: 'devops', icon: 'container' },
  'NGINX': { category: 'devops', icon: 'server' },
  'CLOUDFLARE': { category: 'devops', icon: 'cloud' },
  'GRAFANA': { category: 'devops', icon: 'bar-chart' },
  'PROMETHEUS': { category: 'devops', icon: 'activity' },
  'KUBERNETES': { category: 'devops', icon: 'cloud' },
  'VERCEL': { category: 'devops', icon: 'cloud' },
  'RAILWAY': { category: 'devops', icon: 'cloud' },
  'FLY_IO': { category: 'devops', icon: 'cloud' },
  'GITHUB_ACTIONS': { category: 'devops', icon: 'git-branch' },
  'TERRAFORM': { category: 'devops', icon: 'git-branch' },
  'ARGOCD': { category: 'devops', icon: 'git-branch' },
  'HELM': { category: 'devops', icon: 'container' },
  'ISTIO': { category: 'devops', icon: 'cloud' },
  'ENVOY': { category: 'devops', icon: 'server' },
  'VAULT': { category: 'devops', icon: 'shield' },
  'JAEGER': { category: 'devops', icon: 'activity' },
  'ELK': { category: 'devops', icon: 'bar-chart' },
  'ZOOKEEPER': { category: 'devops', icon: 'server' },
  'AWS_CLOUDFRONT': { category: 'devops', icon: 'cloud' },
  'AKAMAI': { category: 'devops', icon: 'cloud' },
};

function fixNodeCategory(name) {
  const upperName = name.toUpperCase();
  if (FIXTURE_MAP[upperName]) {
    return FIXTURE_MAP[upperName].category;
  }
  return null;
}

function fixNodeIcon(name) {
  const upperName = name.toUpperCase();
  if (FIXTURE_MAP[upperName]) {
    return FIXTURE_MAP[upperName].icon;
  }
  return null;
}

function findPrimaryBackend(nodes) {
  const order = ['DJANGO', 'SPRING_BOOT', 'EXPRESS', 'FASTAPI', 'NESTJS', 'GO', 'GRAPHQL', 'NODE_JS', 'PYTHON', 'JAVA', 'SCALA', 'ERLANG', 'PHP', 'FLASK', 'GIN', 'RUST'];
  for (const name of order) {
    const found = nodes.find(n => n.name === name && n.category === 'backend');
    if (found) return found;
  }
  return nodes.find(n => n.category === 'backend') || null;
}

function enforceArchitectureRules(normalizedNodes, normalizedEdges) {
  const changes = [];
  const nodeNames = new Set(normalizedNodes.map(n => n.name));
  const categoryMap = {};
  normalizedNodes.forEach(n => { categoryMap[n.name] = n.category; });

  const clientCats = new Set(['frontend', 'mobile']);
  const dbCats = new Set(['database']);

  const needsBackend = normalizedEdges.some(e => {
    const sc = categoryMap[e.source];
    const tc = categoryMap[e.target];
    return clientCats.has(sc) && dbCats.has(tc);
  }) || normalizedEdges.some(e => {
    const sc = categoryMap[e.source];
    const tc = categoryMap[e.target];
    return clientCats.has(tc) && dbCats.has(sc);
  });

  const hasRealBackend = normalizedNodes.some(n =>
    n.category === 'backend' &&
    ['EXPRESS', 'FASTAPI', 'NESTJS', 'DJANGO', 'SPRING_BOOT', 'GO', 'GRAPHQL', 'NODE_JS', 'PYTHON', 'JAVA', 'SCALA', 'ERLANG', 'PHP', 'FLASK', 'GIN', 'RUST'].includes(n.name)
  );

  if (needsBackend && !hasRealBackend) {
    const backendName = 'EXPRESS';
    normalizedNodes.push({
      name: backendName,
      category: 'backend',
      role: 'API gateway and business logic layer',
      reason: 'Auto-added: required backend between client and database',
      icon: 'server'
    });
    categoryMap[backendName] = 'backend';
    nodeNames.add(backendName);
    changes.push(`Added ${backendName} (clients connected directly to database)`);
  }

  const primaryBackend = findPrimaryBackend(normalizedNodes);

  const hasAuth = normalizedNodes.some(n => n.category === 'auth');
  const hasDjango = normalizedNodes.some(n => n.name === 'DJANGO' && n.category === 'backend');
  const backendCount = normalizedNodes.filter(n => n.category === 'backend').length;

  if (!hasAuth && normalizedNodes.length >= 3 && !hasDjango && backendCount <= 2) {
    const authName = 'CLERK';
    normalizedNodes.push({
      name: authName,
      category: 'auth',
      role: 'Authentication and user management',
      reason: 'Auto-added: authentication layer required for multi-component systems',
      icon: 'shield'
    });
    categoryMap[authName] = 'auth';
    nodeNames.add(authName);
    changes.push(`Added ${authName} (missing auth layer)`);

    if (primaryBackend) {
      normalizedEdges.push({ source: primaryBackend.name, target: authName, label: 'OIDC' });
      changes.push(`Connected ${primaryBackend.name} -> ${authName} (OIDC)`);
    }
  }

  const hasObservability = normalizedNodes.some(n =>
    ['GRAFANA', 'PROMETHEUS', 'DATADOG', 'ELK', 'SENTRY', 'JAEGER'].includes(n.name)
  );
  if (!hasObservability && normalizedNodes.length >= 5) {
    const obsName = 'GRAFANA';
    normalizedNodes.push({
      name: obsName,
      category: 'devops',
      role: 'Monitoring and observability',
      reason: 'Auto-added: observability required for production-scale systems',
      icon: 'bar-chart'
    });
    categoryMap[obsName] = 'devops';
    nodeNames.add(obsName);

    if (primaryBackend) {
      normalizedEdges.push({ source: primaryBackend.name, target: obsName, label: 'HTTP' });
    }

    const promName = 'PROMETHEUS';
    normalizedNodes.push({
      name: promName,
      category: 'devops',
      role: 'Metrics collection and alerting',
      reason: 'Auto-added: metrics collection for observability stack',
      icon: 'activity'
    });
    categoryMap[promName] = 'devops';
    nodeNames.add(promName);

    if (primaryBackend) {
      normalizedEdges.push({ source: primaryBackend.name, target: promName, label: 'HTTP' });
    }

    normalizedEdges.push({ source: promName, target: obsName, label: 'HTTP' });
    changes.push('Added GRAFANA + PROMETHEUS with connections to backend');
  }

  for (let i = normalizedEdges.length - 1; i >= 0; i--) {
    const e = normalizedEdges[i];
    const sc = categoryMap[e.source];
    const tc = categoryMap[e.target];
    if (sc === 'database' && tc === 'backend') {
      const tmp = e.source;
      e.source = e.target;
      e.target = tmp;
      e.label = 'SQL';
      changes.push(`Flipped ${e.source} -> ${e.target} (database should not initiate connections)`);
    }
  }

  const dbCount = normalizedNodes.filter(n => n.category === 'database').length;
  const hasCache = normalizedNodes.some(n => n.name === 'REDIS' || n.name === 'MEMCACHED');
  if (dbCount >= 2 && !hasCache && primaryBackend) {
    const cacheName = 'REDIS';
    normalizedNodes.push({
      name: cacheName,
      category: 'database',
      role: 'Caching and session store',
      reason: 'Auto-added: cache layer for multiple databases',
      icon: 'database'
    });
    categoryMap[cacheName] = 'database';
    nodeNames.add(cacheName);
    normalizedEdges.push({ source: primaryBackend.name, target: cacheName, label: 'TCP' });
    changes.push(`Added ${cacheName} (multiple databases without cache)`);
  }

  const clientCount = normalizedNodes.filter(n => n.category === 'frontend' || n.category === 'mobile').length;
  const hasStorage = normalizedNodes.some(n => n.category === 'storage');
  if (clientCount > 0 && !hasStorage && normalizedNodes.length >= 4) {
    const storageName = 'S3';
    normalizedNodes.push({
      name: storageName,
      category: 'storage',
      role: 'Object storage for assets and uploads',
      reason: 'Auto-added: storage for client-facing system',
      icon: 'hard-drive'
    });
    categoryMap[storageName] = 'storage';
    nodeNames.add(storageName);
    if (primaryBackend) {
      normalizedEdges.push({ source: primaryBackend.name, target: storageName, label: 'S3' });
    }
    changes.push(`Added ${storageName} (client-facing system without storage)`);
  }

  const hasQueue = normalizedNodes.some(n => n.category === 'queue');
  if (backendCount >= 2 && !hasQueue) {
    const queueName = 'KAFKA';
    normalizedNodes.push({
      name: queueName,
      category: 'queue',
      role: 'Async message broker and event stream',
      reason: 'Auto-added: async processing for multiple backends',
      icon: 'message-square'
    });
    categoryMap[queueName] = 'queue';
    nodeNames.add(queueName);
    if (primaryBackend) {
      normalizedEdges.push({ source: primaryBackend.name, target: queueName, label: 'KAFKA' });
    }
    changes.push(`Added ${queueName} (multiple backends without async queue)`);
  }

  const hasTrafficManager = normalizedNodes.some(n =>
    ['NGINX', 'CLOUDFLARE', 'ENVOY', 'KUBERNETES', 'AWS_CLOUDFRONT', 'AKAMAI'].includes(n.name)
  );
  if (normalizedNodes.length >= 6 && !hasTrafficManager && primaryBackend) {
    const tmName = 'NGINX';
    normalizedNodes.push({
      name: tmName,
      category: 'devops',
      role: 'Reverse proxy and load balancer',
      reason: 'Auto-added: traffic management for large system',
      icon: 'server'
    });
    categoryMap[tmName] = 'devops';
    nodeNames.add(tmName);
    normalizedEdges.push({ source: primaryBackend.name, target: tmName, label: 'HTTP' });
    changes.push(`Added ${tmName} (traffic management for large system)`);
  }

  const dbOnlyCount = normalizedNodes.filter(n => n.category === 'database').length;
  const approxComplexity = normalizedNodes.length + Math.min(normalizedEdges.length, 4)
    + (normalizedNodes.some(n => n.category === 'auth') ? 1 : 0)
    + (normalizedNodes.some(n => n.category === 'storage') ? 1 : 0)
    + (normalizedNodes.some(n => n.category === 'external') ? 1 : 0)
    + (normalizedNodes.some(n => n.category === 'queue') ? 1 : 0)
    + (normalizedNodes.some(n => n.category === 'devops') ? 1 : 0);
  if (dbOnlyCount === 1 && approxComplexity >= 12 && !hasCache && primaryBackend) {
    const replicaName = primaryBackend.name + '_DB_REPLICA';
    if (!nodeNames.has(replicaName)) {
      normalizedNodes.push({
        name: replicaName,
        category: 'database',
        role: 'Read replica for datastore scaling',
        reason: 'Auto-added: read replica to relieve single-datastore pressure',
        icon: 'database'
      });
      categoryMap[replicaName] = 'database';
      nodeNames.add(replicaName);
      normalizedEdges.push({ source: primaryBackend.name, target: replicaName, label: 'SQL' });
      changes.push(`Added ${replicaName} (single-datastore pressure at high complexity)`);
    }
  }

  const hasKafka = normalizedNodes.some(n => n.name === 'KAFKA');
  const kafkaHasProducer = normalizedEdges.some(e => e.target === 'KAFKA' && (categoryMap[e.source] === 'backend' || categoryMap[e.source] === 'external'));
  const kafkaHasConsumer = normalizedEdges.some(e => e.source === 'KAFKA');

  if (hasKafka && !kafkaHasProducer && primaryBackend) {
    normalizedEdges.push({ source: primaryBackend.name, target: 'KAFKA', label: 'KAFKA' });
    changes.push(`Connected ${primaryBackend.name} -> KAFKA (producer)`);
  }
  if (hasKafka && !kafkaHasConsumer && primaryBackend) {
    const workerName = primaryBackend.name + '_WORKER';
    if (!nodeNames.has(workerName)) {
      normalizedNodes.push({
        name: workerName,
        category: 'backend',
        role: 'Async worker processing',
        reason: 'Auto-added: consumer for KAFKA event stream',
        icon: 'server'
      });
      categoryMap[workerName] = 'backend';
      nodeNames.add(workerName);
      normalizedEdges.push({ source: 'KAFKA', target: workerName, label: 'KAFKA' });
      changes.push(`Added ${workerName} to consume from KAFKA`);
    }
  }

  return changes;
}

function normalizeIdentifier(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w.+/-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

function normalizeNodeCategory(category, name) {
  const normalized = String(category || '').trim().toLowerCase();
  if (VALID_CATEGORIES.has(normalized)) {
    const fixed = fixNodeCategory(name);
    if (fixed && fixed !== normalized) {
      return fixed;
    }
    return normalized;
  }

  const fixed = fixNodeCategory(name);
  if (fixed) {
    return fixed;
  }

  return categorizeTech(name || '');
}

function normalizeEdgeLabel(label) {
  const normalized = normalizeIdentifier(label);
  if (!normalized || normalized === 'CONNECTION' || normalized === 'API' || normalized === 'INFERRING...' || normalized === '') {
    return 'HTTPS';
  }
  return normalized;
}

function normalizeDiagramStructure(parsed) {
  const nodeMap = new Map();
  const normalizedNodes = [];

  for (const rawNode of parsed.nodes || []) {
    const name = normalizeIdentifier(rawNode?.name);

    if (!name || nodeMap.has(name)) {
      continue;
    }

    const category = normalizeNodeCategory(rawNode?.category, name);

    if (!VALID_CATEGORIES.has(category)) {
      continue;
    }

    const fixedIcon = fixNodeIcon(name);
    const normalizedNode = {
      name,
      category,
      role: rawNode?.role || `Handles ${name.toLowerCase().replace(/_/g, ' ')} operations`,
      reason: rawNode?.reason || `Selected to satisfy the ${category} layer in this architecture.`,
      icon: fixedIcon || rawNode?.icon || 'server'
    };

    nodeMap.set(name, normalizedNode);
    normalizedNodes.push(normalizedNode);
  }

  const seenEdges = new Set();
  const normalizedEdges = [];

  for (const rawEdge of parsed.edges || []) {
    const source = normalizeIdentifier(rawEdge?.source);
    const target = normalizeIdentifier(rawEdge?.target);
    const label = normalizeEdgeLabel(rawEdge?.label);

    if (!source || !target || source === target) {
      continue;
    }

    if (!nodeMap.has(source) || !nodeMap.has(target)) {
      continue;
    }

    const edgeKey = `${source}->${target}::${label}`;
    if (seenEdges.has(edgeKey)) {
      continue;
    }

    seenEdges.add(edgeKey);
    normalizedEdges.push({ source, target, label });
  }

  return {
    nodes: normalizedNodes,
    edges: normalizedEdges
  };
}

function validateNormalizedDiagram(diagram) {
  if (!Array.isArray(diagram.nodes) || diagram.nodes.length === 0) {
    throw new Error('Generated architecture did not contain any valid nodes.');
  }

  if (diagram.nodes.length > 1 && diagram.edges.length === 0) {
    throw new Error('Generated architecture contained nodes but no valid connections.');
  }
}

export const DIAGRAM_SYSTEM_PROMPT = `You are a Staff Infrastructure Architect at a FAANG company. You design production-grade systems for ANY application type. Output valid JSON only.

APPROVED TECH CATALOG (use exact names, UPPERCASE):
mobile=SWIFT,KOTLIN,REACT_NATIVE,FLUTTER
frontend=NEXT.JS,REACT,VUE,SVELTE,ANGULAR,REMIX
backend=EXPRESS,FASTAPI,NESTJS,DJANGO,SPRING_BOOT,GO,GRAPHQL,FLASK,GIN,RUST,NODE_JS,PYTHON,JAVA,SCALA,ERLANG,PHP
database=POSTGRESQL,MYSQL,MONGODB,REDIS,CASSANDRA,DYNAMODB,ELASTICSEARCH,COCKROACHDB,MEMCACHED,NEO4J,SQLITE,MARIADB,CLICKHOUSE,TIMESCALEDB,VITESS,BIGTABLE,AURORA,ROCKSDB
queue=KAFKA,RABBITMQ,SQS,BULLMQ,NATS,CELERY,PUB_SUB
auth=CLERK,AUTH0,SUPABASE_AUTH,FIREBASE_AUTH,KEYCLOAK,OKTA,COGNITO,AZURE_AD
storage=S3,CLOUDFLARE_R2,GCS,MINIO,AZURE_BLOB,CEPH
external=STRIPE,TWILIO,SENDGRID,ALGOLIA,MAPBOX,DATADOG,SENTRY,PAYPAL,PLAID,GOOGLE_MAPS,CLOUDFRONT,AKAMAI
devops=DOCKER,NGINX,CLOUDFLARE,KUBERNETES,PROMETHEUS,GRAFANA,TERRAFORM,VERCEL,GITHUB_ACTIONS,HELM,ISTIO,VAULT,ARGOCD,ELK,JAEGER,JENKINS,ENVOY,LINKERD,ZOOKEEPER,ETCD

KNOWN PRODUCTION ARCHITECTURES:
Instagram=SWIFT,KOTLIN,REACT,DJANGO,POSTGRESQL,REDIS,CASSANDRA,KAFKA,S3,NGINX,PROMETHEUS,GRAFANA
Netflix=SWIFT,KOTLIN,SPRING_BOOT,CASSANDRA,DYNAMODB,KAFKA,S3,CLOUDFRONT,PROMETHEUS
Uber=SWIFT,KOTLIN,GO,DJANGO,CASSANDRA,REDIS,POSTGRESQL,KAFKA,S3,GOOGLE_MAPS,JAEGER
YouTube=REACT,GO,PYTHON,VITESS,BIGTABLE,REDIS,KAFKA,CDN,PROMETHEUS
WhatsApp=SWIFT,KOTLIN,ERLANG,MYSQL,REDIS,KAFKA,S3
Twitter=REACT,SCALA,JAVA,MYSQL,REDIS,KAFKA,S3,PROMETHEUS,GRAFANA
Facebook=REACT,REACT_NATIVE,PHP,GRAPHQL,MYSQL,REDIS,CASSANDRA,KAFKA,S3,AKAMAI
Slack=SWIFT,KOTLIN,REACT,JAVA,POSTGRESQL,REDIS,MYSQL,KAFKA,S3
Amazon=REACT,SPRING_BOOT,DYNAMODB,AURORA,REDIS,SQS,KAFKA,S3,CLOUDFRONT
Discord=REACT_NATIVE,REACT,PYTHON,GO,POSTGRESQL,REDIS,CASSANDRA,KAFKA,S3
Notion=SWIFT,KOTLIN,REACT,NEXT.JS,GO,POSTGRESQL,REDIS,S3
Figma=SWIFT,KOTLIN,REACT,GO,RUST,POSTGRESQL,REDIS,S3,KAFKA

DOMAIN-SPECIFIC PATTERNS (choose the best match for the user's prompt):
[ecommerce] REACT, EXPRESS, POSTGRESQL, REDIS, STRIPE, S3, KAFKA, NGINX, PROMETHEUS, GRAFANA. Include payment gateway, product catalog, cart service, order service.
[social_media] SWIFT, KOTLIN, DJANGO, POSTGRESQL, REDIS, CASSANDRA, KAFKA, S3, NGINX. Include news feed, notification, friend graph.
[video_streaming] REACT, GO, POSTGRESQL, REDIS, KAFKA, S3, CDN. Include transcoding pipeline, content delivery, DASH/HLS.
[fintech] REACT, SPRING_BOOT, POSTGRESQL, REDIS, KAFKA, VAULT, DATADOG. Include ledger, fraud detection, compliance audit.
[saas_multitenant] REACT, NESTJS, POSTGRESQL, REDIS, KAFKA, S3, CLERK, PROMETHEUS. Include tenant isolation, rate limiting, billing.
[realtime_collab] REACT, GO, POSTGRESQL, REDIS, KAFKA, S3, PROMETHEUS. Include WebSocket manager, presence service, conflict resolution.
[iot] FLUTTER, GO, TIMESCALEDB, KAFKA, S3, PROMETHEUS. Include device gateway, telemetry ingestion, fleet management.
[healthcare] REACT, FASTAPI, POSTGRESQL, REDIS, KAFKA, VAULT, S3, DATADOG. Include HIPAA compliance, audit trail, patient data.
[analytics_platform] REACT, PYTHON, CLICKHOUSE, KAFKA, S3, PROMETHEUS, GRAFANA. Include data pipeline, stream processing, batch ETL.

PROTOCOL MAP FOR EDGES:
frontend>backend: HTTPS, GRAPHQL, WEBSOCKET
mobile>backend: HTTPS, GRAPHQL, WEBSOCKET, gRPC
backend>database: SQL, TCP, MONGO
backend>queue: AMQP, KAFKA, HTTP
backend>auth: OIDC, OAUTH2, SAML
backend>storage: S3, HTTP, FTP
backend>external: HTTPS, WEBHOOK, gRPC
backend>backend: gRPC, HTTP, TCP, THRIFT

RULES:
1. Identify what the user is building (ecommerce, social, video, fintech, etc.) and apply the matching DOMAIN-SPECIFIC PATTERN. Add/remove tech as needed.
2. Use exact tech names from catalog. Never prefix with app name. Never generic names.
3. Categories only: mobile frontend backend database queue auth storage external devops.
4. Frontend/mobile NEVER connect to database. Always backend in between.
5. ALWAYS include ALL of these for any multi-component system: REDIS (cache), KAFKA or RABBITMQ (async processing), S3 (storage), PROMETHEUS+GRAFANA (observability), CLERK (auth), NGINX or CLOUDFLARE (traffic management).
6. Max 12 nodes. Roles max 4 words. Reasons max 6 words.
7. Edge labels from protocol map only. Never use generic labels like CONNECTION or API.
8. No protocols or generic terms as nodes.
9. Famous companies use their known stack above.
10. The architecture MUST be production-complete. Every generated diagram will be scored — missing layers cause score deductions and erode user trust.

OUTPUT ONLY THIS JSON (no other text):
{"nodes":[{"name":"TECH","category":"","role":"","reason":"","icon":""}],"edges":[{"source":"TECH","target":"TECH","label":"PROTOCOL"}]}`;

export function buildDiagramUserMessage(description, template) {
  if (template) {
    const templateHints = {
      saas: 'Design a full SaaS platform with frontend, backend API, auth, database, storage, and observability.',
      ecommerce: 'Design an e-commerce system with product catalog, cart, checkout, payments, and inventory.',
      mobile: 'Design a mobile app backend with REST API, auth, push notifications, and data sync.',
      realtime: 'Design a realtime system with WebSocket connections, event streaming, caching, and presence.',
      microservices: 'Design a microservices architecture with API gateway, service discovery, event bus, and distributed data stores.'
    };
    const hint = templateHints[template] || 'Design a production-grade system architecture.';
    return `${hint} ${description}`;
  }
  return `Design a production-grade system architecture for: ${description}`;
}

export function generateNodesFromDiagram(nodes) {
  const categoryColumns = {};
  const columnWidth = 300;
  const nodeHeight = 80;
  const startX = 100;
  const startY = 100;

  categoryOrder.forEach((category, index) => {
    categoryColumns[category] = startX + (index * columnWidth);
  });

  const nodesByCategory = {};
  nodes.forEach(node => {
    const category = node.category || 'backend';
    if (!nodesByCategory[category]) {
      nodesByCategory[category] = [];
    }
    nodesByCategory[category].push(node);
  });

  let idCounter = 1;
  const positionedNodes = [];

  categoryOrder.forEach(category => {
    const categoryNodes = nodesByCategory[category] || [];
    const x = categoryColumns[category];

    categoryNodes.forEach((node, index) => {
      positionedNodes.push({
        id: `n${idCounter++}`,
        name: node.name,
        category,
        role: node.role || `Handles ${node.name.toLowerCase()} operations`,
        reason: node.reason || `Selected for its strength in handling ${category} requirements`,
        icon: node.icon || 'tech',
        position: {
          x,
          y: startY + (index * nodeHeight)
        },
        products: getCategoryProducts(category)
      });
    });
  });

  return positionedNodes;
}

export function generateEdgesFromDiagram(nodes, edges, positionedNodes) {
  const nodeNameToId = {};
  positionedNodes.forEach(node => {
    nodeNameToId[node.name.toLowerCase()] = node.id;
  });

  return edges.map((edge, index) => ({
    id: `e${index + 1}`,
    source: nodeNameToId[edge.source.toLowerCase()] || `n${index + 1}`,
    target: nodeNameToId[edge.target.toLowerCase()] || `n${index + 2}`,
    label: edge.label || 'Connection',
    type: 'step'
  }));
}

function connectIsolatedNodes(normalizedNodes, normalizedEdges) {
  const changes = [];
  const connectedNames = new Set();
  normalizedEdges.forEach(e => { connectedNames.add(e.source); connectedNames.add(e.target); });

  const backendNames = normalizedNodes.filter(n => n.category === 'backend').map(n => n.name);
  const frontendNames = normalizedNodes.filter(n => n.category === 'frontend' || n.category === 'mobile').map(n => n.name);
  const databaseNames = normalizedNodes.filter(n => n.category === 'database').map(n => n.name);
  const primaryBackend = backendNames[0] || null;
  const primaryFrontend = frontendNames[0] || null;
  const primaryDatabase = databaseNames[0] || null;

  for (const node of normalizedNodes) {
    if (connectedNames.has(node.name)) continue;

    const cat = node.category;

    if (cat === 'frontend' || cat === 'mobile') {
      if (primaryBackend) {
        normalizedEdges.push({ source: node.name, target: primaryBackend, label: 'HTTPS' });
        changes.push(`Connected ${node.name} -> ${primaryBackend}`);
        connectedNames.add(node.name);
        connectedNames.add(primaryBackend);
      }
    } else if (cat === 'backend') {
      if (primaryFrontend) {
        normalizedEdges.push({ source: primaryFrontend, target: node.name, label: 'HTTPS' });
        changes.push(`Connected ${primaryFrontend} -> ${node.name}`);
      } else if (primaryDatabase) {
        normalizedEdges.push({ source: node.name, target: primaryDatabase, label: 'SQL' });
        changes.push(`Connected ${node.name} -> ${primaryDatabase}`);
      }
      connectedNames.add(node.name);
    } else if (cat === 'database') {
      if (primaryBackend) {
        normalizedEdges.push({ source: primaryBackend, target: node.name, label: 'SQL' });
        changes.push(`Connected ${primaryBackend} -> ${node.name}`);
        connectedNames.add(node.name);
      }
    } else if (cat === 'queue') {
      if (primaryBackend) {
        normalizedEdges.push({ source: primaryBackend, target: node.name, label: 'AMQP' });
        changes.push(`Connected ${primaryBackend} -> ${node.name}`);
        connectedNames.add(node.name);
      }
    } else if (cat === 'auth') {
      if (primaryBackend) {
        normalizedEdges.push({ source: primaryBackend, target: node.name, label: 'OIDC' });
        changes.push(`Connected ${primaryBackend} -> ${node.name}`);
        connectedNames.add(node.name);
      }
    } else if (cat === 'storage') {
      if (primaryBackend) {
        normalizedEdges.push({ source: primaryBackend, target: node.name, label: 'S3' });
        changes.push(`Connected ${primaryBackend} -> ${node.name}`);
        connectedNames.add(node.name);
      }
    } else if (cat === 'external') {
      if (primaryBackend) {
        normalizedEdges.push({ source: primaryBackend, target: node.name, label: 'HTTPS' });
        changes.push(`Connected ${primaryBackend} -> ${node.name}`);
        connectedNames.add(node.name);
      }
    } else if (cat === 'devops') {
      if (primaryBackend) {
        normalizedEdges.push({ source: primaryBackend, target: node.name, label: 'HTTP' });
        changes.push(`Connected ${primaryBackend} -> ${node.name}`);
        connectedNames.add(node.name);
      }
    }
  }

  return changes;
}

function buildJsonRepairMessages(messages, rawResponse, errorMessage, schemaHint) {
  return [
    ...messages,
    { role: 'assistant', content: rawResponse },
    {
      role: 'user',
      content: `Your previous response could not be parsed as valid JSON (${errorMessage}). Return ONLY valid JSON matching this shape: ${schemaHint}. Do not include markdown fences, prose, duplicate objects, or explanations.`
    }
  ];
}

const JSON_SCHEMA_HINT = `{"nodes":[{"name":"TECH_NAME","category":"mobile|frontend|backend|database|queue|auth|storage|external|devops","role":"function","reason":"justification","icon":"icon-name"}],"edges":[{"source":"TECH_NAME","target":"TECH_NAME","label":"PROTOCOL"}]}`;

export async function generateDiagramFromPrompt({ description, template, model = DIAGRAM_MODEL, onChunk, signal } = {}) {
  const userMessage = buildDiagramUserMessage(description, template);
  const messages = [
    { role: 'system', content: DIAGRAM_SYSTEM_PROMPT },
    { role: 'user', content: userMessage }
  ];

  let lastError = null;
  let resolvedModel = model;
  let rawResponse = '';
  let currentMessages = messages;
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await callOpenRouter(
      currentMessages,
      attempt === 1 ? model : DIAGRAM_MODEL,
      attempt === 1 ? onChunk : undefined,
      signal,
      true
    );
    rawResponse = response.content;
    resolvedModel = response.model || model;

    try {
      const parsed = robustParseJSON(rawResponse);
      const normalizedDiagram = normalizeDiagramStructure(parsed);
      const autoFixes = enforceArchitectureRules(normalizedDiagram.nodes, normalizedDiagram.edges);
      const connectionFixes = connectIsolatedNodes(normalizedDiagram.nodes, normalizedDiagram.edges);
      const allFixes = [...autoFixes, ...connectionFixes];

      const seenEdgeKeys = new Set();
      normalizedDiagram.edges = normalizedDiagram.edges.filter(e => {
        const key = `${e.source}->${e.target}::${e.label}`;
        if (seenEdgeKeys.has(key)) return false;
        seenEdgeKeys.add(key);
        return true;
      });

      validateNormalizedDiagram(normalizedDiagram);
      const nodes = generateNodesFromDiagram(normalizedDiagram.nodes);
      const edges = generateEdgesFromDiagram(normalizedDiagram.nodes, normalizedDiagram.edges, nodes);

      return {
        model: resolvedModel,
        rawResponse,
        userMessage,
        nodes,
        edges,
        autoFixes: allFixes.length > 0 ? allFixes : undefined
      };
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      currentMessages = buildJsonRepairMessages(messages, rawResponse, error.message, JSON_SCHEMA_HINT);
    }
  }

  const failure = new Error(
    `Failed to parse AI JSON response after ${maxAttempts} attempt(s): ${lastError?.message || 'Unknown parse error'}`
  );
  failure.rawResponse = rawResponse;
  failure.model = resolvedModel;
  throw failure;
}
