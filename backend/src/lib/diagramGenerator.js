import { categoryOrder, categorizeTech, getCategoryProducts } from './tech.js';
import { callOpenRouter, callOpenRouterForJSON, DIAGRAM_MODEL, robustParseJSON } from './openRouter.js';
import { canonicalConnectionRules } from './connectionRules.js';

const VALID_CATEGORIES = new Set(categoryOrder);
const CLIENT_CATEGORIES = new Set(['frontend', 'mobile']);
const DATABASE_CATEGORIES = new Set(['database']);
const BACKEND_TECH_NAMES = new Set([
  'EXPRESS',
  'FASTAPI',
  'NESTJS',
  'DJANGO',
  'SPRING_BOOT',
  'GO',
  'GRAPHQL',
  'NODE_JS',
  'PYTHON',
  'JAVA',
  'SCALA',
  'ERLANG',
  'PHP',
  'FLASK',
  'GIN',
  'RUST',
]);
const OBSERVABILITY_NAMES = new Set(['GRAFANA', 'PROMETHEUS', 'DATADOG', 'ELK', 'SENTRY', 'JAEGER', 'NEW_RELIC']);
const TRAFFIC_MANAGER_NAMES = new Set(['NGINX', 'CLOUDFLARE', 'ENVOY', 'KUBERNETES', 'AWS_CLOUDFRONT', 'AKAMAI']);
const CACHE_NAMES = new Set(['REDIS', 'MEMCACHED']);
const GENERIC_EDGE_LABELS = new Set(['CONNECTION', 'INFERRING...', 'API', '']);
const REVIEW_SAFE_MAX_PASSES = 5;

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

function ruleKey(sourceCategory, targetCategory) {
  return `${sourceCategory || 'unknown'}->${targetCategory || 'unknown'}`;
}

function buildRuleMap() {
  return new Map(
    canonicalConnectionRules.map(([sourceCategory, targetCategory, isValid, warningMessage]) => [
      ruleKey(sourceCategory, targetCategory),
      {
        source_category: sourceCategory,
        target_category: targetCategory,
        is_valid: isValid,
        warning_message: warningMessage,
      },
    ])
  );
}

const GENERATION_RULE_MAP = buildRuleMap();

function getConnectionRule(sourceCategory, targetCategory) {
  return GENERATION_RULE_MAP.get(ruleKey(sourceCategory, targetCategory));
}

function isConnectionValid(sourceCategory, targetCategory) {
  const rule = getConnectionRule(sourceCategory, targetCategory);
  return rule ? rule.is_valid !== false : false;
}

function buildDiagramLookups(nodes) {
  const categoryMap = {};
  nodes.forEach(node => {
    categoryMap[node.name] = node.category;
  });

  return { categoryMap };
}

function addNormalizedNode(nodes, name, category, role, reason, icon, changes) {
  const normalizedName = normalizeIdentifier(name);

  if (!normalizedName || nodes.some(node => node.name === normalizedName)) {
    return nodes.find(node => node.name === normalizedName) || null;
  }

  const fixedCategory = normalizeNodeCategory(category, normalizedName);
  const fixedIcon = fixNodeIcon(normalizedName);
  const node = {
    name: normalizedName,
    category: fixedCategory,
    role,
    reason,
    icon: fixedIcon || icon || 'server',
  };

  nodes.push(node);
  changes?.push(`Added ${normalizedName} (${fixedCategory})`);
  return node;
}

function hasNodeNamed(nodes, name) {
  const normalizedName = normalizeIdentifier(name);
  return nodes.some(node => node.name === normalizedName);
}

function getNodesByCategory(nodes, category) {
  return nodes.filter(node => node.category === category);
}

function protocolForConnection(sourceCategory, targetCategory, sourceName = '', targetName = '') {
  if (CLIENT_CATEGORIES.has(sourceCategory) && targetCategory === 'backend') return 'HTTPS';
  if (sourceCategory === 'backend' && CLIENT_CATEGORIES.has(targetCategory)) return 'WEBSOCKET';
  if (sourceCategory === 'backend' && targetCategory === 'database') {
    if (targetName === 'MONGODB') return 'MONGO';
    if (CACHE_NAMES.has(targetName)) return 'TCP';
    return 'SQL';
  }
  if (sourceCategory === 'database' && targetCategory === 'database') return 'SQL';
  if (sourceCategory === 'backend' && targetCategory === 'queue') {
    return targetName === 'KAFKA' || sourceName === 'KAFKA' ? 'KAFKA' : 'AMQP';
  }
  if (sourceCategory === 'queue' && targetCategory === 'backend') {
    return sourceName === 'KAFKA' || targetName === 'KAFKA' ? 'KAFKA' : 'AMQP';
  }
  if (sourceCategory === 'backend' && targetCategory === 'auth') return 'OIDC';
  if (CLIENT_CATEGORIES.has(sourceCategory) && targetCategory === 'auth') return 'OIDC';
  if (sourceCategory === 'auth' && targetCategory === 'backend') return 'OIDC';
  if (sourceCategory === 'backend' && targetCategory === 'storage') return 'S3';
  if (sourceCategory === 'backend' && targetCategory === 'external') return 'HTTPS';
  if (sourceCategory === 'external' && targetCategory === 'backend') return 'WEBHOOK';
  if (sourceCategory === 'backend' && targetCategory === 'devops') return 'HTTP';
  if (sourceCategory === 'devops') return 'HTTP';
  if (sourceCategory === 'backend' && targetCategory === 'backend') return 'HTTP';
  return 'HTTPS';
}

function normalizeEdgeLabelForConnection(label, sourceCategory, targetCategory, sourceName = '', targetName = '') {
  const normalizedIdentifier = normalizeIdentifier(label);

  if (GENERIC_EDGE_LABELS.has(normalizedIdentifier)) {
    return protocolForConnection(sourceCategory, targetCategory, sourceName, targetName);
  }

  return normalizeEdgeLabel(label || protocolForConnection(sourceCategory, targetCategory, sourceName, targetName));
}

function addNormalizedEdge(edges, nodes, source, target, label, changes, reason) {
  const sourceName = normalizeIdentifier(source);
  const targetName = normalizeIdentifier(target);

  if (!sourceName || !targetName || sourceName === targetName) {
    return false;
  }

  const { categoryMap } = buildDiagramLookups(nodes);

  if (!categoryMap[sourceName] || !categoryMap[targetName]) {
    return false;
  }

  if (!isConnectionValid(categoryMap[sourceName], categoryMap[targetName])) {
    return false;
  }

  const normalizedLabel = normalizeEdgeLabelForConnection(
    label,
    categoryMap[sourceName],
    categoryMap[targetName],
    sourceName,
    targetName
  );
  const edgeKey = `${sourceName}->${targetName}::${normalizedLabel}`;

  if (edges.some(edge => `${edge.source}->${edge.target}::${edge.label}` === edgeKey)) {
    return false;
  }

  edges.push({ source: sourceName, target: targetName, label: normalizedLabel });

  if (reason) {
    changes?.push(reason);
  }

  return true;
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
    BACKEND_TECH_NAMES.has(n.name)
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
  if (dbOnlyCount === 1 && approxComplexity >= 12 && primaryBackend) {
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

function countCategories(nodes) {
  return nodes.reduce((acc, node) => {
    acc[node.category] = (acc[node.category] || 0) + 1;
    return acc;
  }, {});
}

function hasObservability(nodes) {
  return nodes.some(node => OBSERVABILITY_NAMES.has(node.name));
}

function hasTrafficManager(nodes) {
  return nodes.some(node => TRAFFIC_MANAGER_NAMES.has(node.name));
}

function hasCache(nodes) {
  return nodes.some(node => CACHE_NAMES.has(node.name));
}

function buildDiagramComplexityScore(nodes, edges, categoryCounts = countCategories(nodes)) {
  const bonusCategories = ['auth', 'storage', 'external', 'queue', 'devops']
    .reduce((sum, category) => sum + ((categoryCounts[category] || 0) > 0 ? 1 : 0), 0);

  return nodes.length
    + Math.min((edges || []).length, 4)
    + bonusCategories
    + ((categoryCounts.backend || 0) >= 2 ? 1 : 0);
}

function ensureBackendNode(nodes, changes) {
  let primaryBackend = findPrimaryBackend(nodes);

  if (primaryBackend) {
    return primaryBackend;
  }

  primaryBackend = addNormalizedNode(
    nodes,
    'EXPRESS',
    'backend',
    'API gateway',
    'Auto-added: application control plane',
    'server',
    changes
  );
  changes?.push('Added EXPRESS (required application layer)');
  return primaryBackend;
}

function ensureProductionCompleteness(nodes, edges, changes) {
  let changed = 0;
  const counts = countCategories(nodes);
  const hasClient = (counts.frontend || 0) + (counts.mobile || 0) > 0;
  const hasRuntimeDependency = ['database', 'queue', 'auth', 'storage', 'external']
    .some(category => (counts[category] || 0) > 0);
  let primaryBackend = findPrimaryBackend(nodes);

  if (!primaryBackend && (hasClient || hasRuntimeDependency || nodes.length > 1)) {
    primaryBackend = ensureBackendNode(nodes, changes);
    changed += 1;
  }

  if (!primaryBackend) {
    return changed;
  }

  const clientNodes = nodes.filter(node => CLIENT_CATEGORIES.has(node.category));
  clientNodes.forEach(clientNode => {
    if (!edges.some(edge => edge.source === clientNode.name && edge.target === primaryBackend.name)) {
      if (addNormalizedEdge(
        edges,
        nodes,
        clientNode.name,
        primaryBackend.name,
        undefined,
        changes,
        `Connected ${clientNode.name} -> ${primaryBackend.name} (client control plane)`
      )) {
        changed += 1;
      }
    }
  });

  getNodesByCategory(nodes, 'database').forEach(databaseNode => {
    if (!edges.some(edge => edge.source === primaryBackend.name && edge.target === databaseNode.name)) {
      if (addNormalizedEdge(
        edges,
        nodes,
        primaryBackend.name,
        databaseNode.name,
        undefined,
        changes,
        `Connected ${primaryBackend.name} -> ${databaseNode.name} (data access)`
      )) {
        changed += 1;
      }
    }
  });

  let latestCounts = countCategories(nodes);

  if (hasClient && !latestCounts.auth) {
    const authNode = addNormalizedNode(
      nodes,
      'CLERK',
      'auth',
      'Authentication',
      'Auto-added: identity layer',
      'shield',
      changes
    );
    changed += authNode ? 1 : 0;
    if (authNode && addNormalizedEdge(edges, nodes, primaryBackend.name, authNode.name, undefined, changes, `Connected ${primaryBackend.name} -> ${authNode.name} (identity)`)) {
      changed += 1;
    }
  }

  latestCounts = countCategories(nodes);
  if (hasClient && !latestCounts.storage && nodes.length >= 4) {
    const storageNode = addNormalizedNode(
      nodes,
      'S3',
      'storage',
      'Object storage',
      'Auto-added: file storage',
      'hard-drive',
      changes
    );
    changed += storageNode ? 1 : 0;
    if (storageNode && addNormalizedEdge(edges, nodes, primaryBackend.name, storageNode.name, undefined, changes, `Connected ${primaryBackend.name} -> ${storageNode.name} (asset storage)`)) {
      changed += 1;
    }
  }

  latestCounts = countCategories(nodes);
  const shouldAddObservability = !hasObservability(nodes) && buildDiagramComplexityScore(nodes, edges, latestCounts) >= 10;
  if (shouldAddObservability) {
    const prometheusNode = hasNodeNamed(nodes, 'PROMETHEUS')
      ? nodes.find(node => node.name === 'PROMETHEUS')
      : addNormalizedNode(
          nodes,
          'PROMETHEUS',
          'devops',
          'Metrics collection',
          'Auto-added: observability',
          'activity',
          changes
        );
    const grafanaNode = hasNodeNamed(nodes, 'GRAFANA')
      ? nodes.find(node => node.name === 'GRAFANA')
      : addNormalizedNode(
          nodes,
          'GRAFANA',
          'devops',
          'Monitoring dashboard',
          'Auto-added: observability',
          'bar-chart',
          changes
        );

    changed += prometheusNode ? 1 : 0;
    changed += grafanaNode ? 1 : 0;
    if (prometheusNode && addNormalizedEdge(edges, nodes, primaryBackend.name, prometheusNode.name, undefined, changes, `Connected ${primaryBackend.name} -> ${prometheusNode.name} (metrics)`)) {
      changed += 1;
    }
    if (grafanaNode && addNormalizedEdge(edges, nodes, prometheusNode.name, grafanaNode.name, undefined, changes, `Connected ${prometheusNode.name} -> ${grafanaNode.name} (dashboards)`)) {
      changed += 1;
    }
  }

  latestCounts = countCategories(nodes);
  if (!hasTrafficManager(nodes) && nodes.length >= 6 && buildDiagramComplexityScore(nodes, edges, latestCounts) >= 8) {
    const trafficNode = addNormalizedNode(
      nodes,
      'NGINX',
      'devops',
      'Traffic gateway',
      'Auto-added: traffic management',
      'server',
      changes
    );
    changed += trafficNode ? 1 : 0;
    if (trafficNode && addNormalizedEdge(edges, nodes, trafficNode.name, primaryBackend.name, undefined, changes, `Connected ${trafficNode.name} -> ${primaryBackend.name} (traffic gateway)`)) {
      changed += 1;
    }
  }

  latestCounts = countCategories(nodes);
  const latestDbCount = latestCounts.database || 0;
  if (latestDbCount === 1 && buildDiagramComplexityScore(nodes, edges, latestCounts) >= 12) {
    const replicaName = `${primaryBackend.name}_DB_REPLICA`;
    if (!hasNodeNamed(nodes, replicaName)) {
      const replicaNode = addNormalizedNode(
        nodes,
        replicaName,
        'database',
        'Read replica',
        'Auto-added: datastore scaling',
        'database',
        changes
      );
      changed += replicaNode ? 1 : 0;
      if (replicaNode && addNormalizedEdge(edges, nodes, primaryBackend.name, replicaNode.name, 'SQL', changes, `Connected ${primaryBackend.name} -> ${replicaNode.name} (read scaling)`)) {
        changed += 1;
      }
    }
  }

  latestCounts = countCategories(nodes);
  if ((latestCounts.database || 0) >= 2 && !hasCache(nodes)) {
    const cacheNode = addNormalizedNode(
      nodes,
      'REDIS',
      'database',
      'Cache layer',
      'Auto-added: hot-data cache',
      'database',
      changes
    );
    changed += cacheNode ? 1 : 0;
    if (cacheNode && addNormalizedEdge(edges, nodes, primaryBackend.name, cacheNode.name, 'TCP', changes, `Connected ${primaryBackend.name} -> ${cacheNode.name} (cache)`)) {
      changed += 1;
    }
  }

  latestCounts = countCategories(nodes);
  const backendNodes = getNodesByCategory(nodes, 'backend');
  const heavyBackend = backendNodes.some(backendNode => {
    const downstreamCategories = new Set(
      edges
        .filter(edge => edge.source === backendNode.name)
        .map(edge => nodes.find(node => node.name === edge.target)?.category)
        .filter(category => ['database', 'storage', 'external', 'queue'].includes(category))
    );

    return downstreamCategories.size >= 2;
  });
  const shouldHaveQueue = !latestCounts.queue && (
    backendNodes.length >= 2 ||
    (heavyBackend && ((latestCounts.database || 0) + (latestCounts.storage || 0) + (latestCounts.external || 0)) >= 2)
  );

  if (shouldHaveQueue) {
    const queueNode = addNormalizedNode(
      nodes,
      'KAFKA',
      'queue',
      'Event stream',
      'Auto-added: async processing',
      'message-square',
      changes
    );
    changed += queueNode ? 1 : 0;
    if (queueNode && addNormalizedEdge(edges, nodes, primaryBackend.name, queueNode.name, undefined, changes, `Connected ${primaryBackend.name} -> ${queueNode.name} (async producer)`)) {
      changed += 1;
    }
  }

  return changed;
}

function ensureQueueTopology(nodes, edges, changes) {
  let changed = 0;
  const queueNodes = getNodesByCategory(nodes, 'queue');

  for (const queueNode of queueNodes) {
    const primaryBackend = ensureBackendNode(nodes, changes);
    const hasProducer = edges.some(edge => {
      if (edge.target !== queueNode.name) return false;
      const sourceNode = nodes.find(node => node.name === edge.source);
      return ['backend', 'external', 'queue'].includes(sourceNode?.category);
    });
    const hasConsumer = edges.some(edge => {
      if (edge.source !== queueNode.name) return false;
      const targetNode = nodes.find(node => node.name === edge.target);
      return ['backend', 'queue'].includes(targetNode?.category);
    });

    if (!hasProducer && primaryBackend) {
      if (addNormalizedEdge(edges, nodes, primaryBackend.name, queueNode.name, undefined, changes, `Connected ${primaryBackend.name} -> ${queueNode.name} (queue producer)`)) {
        changed += 1;
      }
    }

    if (!hasConsumer) {
      const workerName = `${queueNode.name}_WORKER`;
      const workerNode = nodes.find(node => node.name === workerName) || addNormalizedNode(
        nodes,
        workerName,
        'backend',
        'Async worker',
        'Auto-added: queue consumer',
        'server',
        changes
      );
      changed += workerNode ? 1 : 0;

      if (workerNode && addNormalizedEdge(edges, nodes, queueNode.name, workerNode.name, undefined, changes, `Connected ${queueNode.name} -> ${workerNode.name} (queue consumer)`)) {
        changed += 1;
      }
    }
  }

  return changed;
}

function addBackendBridgeEdges(nextEdges, nodes, sourceName, sourceCategory, targetName, targetCategory, changes) {
  const primaryBackend = ensureBackendNode(nodes, changes);

  if (!primaryBackend) {
    return;
  }

  if (sourceName !== primaryBackend.name) {
    if (isConnectionValid(sourceCategory, 'backend')) {
      addNormalizedEdge(nextEdges, nodes, sourceName, primaryBackend.name, undefined, changes);
    } else if (isConnectionValid('backend', sourceCategory)) {
      addNormalizedEdge(nextEdges, nodes, primaryBackend.name, sourceName, undefined, changes);
    }
  }

  if (targetName !== primaryBackend.name) {
    if (isConnectionValid('backend', targetCategory)) {
      addNormalizedEdge(nextEdges, nodes, primaryBackend.name, targetName, undefined, changes);
    } else if (isConnectionValid(targetCategory, 'backend')) {
      addNormalizedEdge(nextEdges, nodes, targetName, primaryBackend.name, undefined, changes);
    }
  }
}

function sanitizeInvalidConnections(nodes, edges, changes) {
  let changed = 0;
  const nextEdges = [];

  for (const edge of edges) {
    const sourceNode = nodes.find(node => node.name === edge.source);
    const targetNode = nodes.find(node => node.name === edge.target);

    if (!sourceNode || !targetNode || sourceNode.name === targetNode.name) {
      changed += 1;
      continue;
    }

    const sourceCategory = sourceNode.category;
    const targetCategory = targetNode.category;
    const label = normalizeEdgeLabelForConnection(edge.label, sourceCategory, targetCategory, sourceNode.name, targetNode.name);

    if (isConnectionValid(sourceCategory, targetCategory)) {
      addNormalizedEdge(nextEdges, nodes, sourceNode.name, targetNode.name, label, changes);
      if (label !== edge.label) {
        changed += 1;
      }
      continue;
    }

    changed += 1;
    changes?.push(`Repaired invalid ${sourceNode.name} -> ${targetNode.name} connection`);

    if (isConnectionValid(targetCategory, sourceCategory)) {
      addNormalizedEdge(nextEdges, nodes, targetNode.name, sourceNode.name, undefined, changes);
      continue;
    }

    addBackendBridgeEdges(
      nextEdges,
      nodes,
      sourceNode.name,
      sourceCategory,
      targetNode.name,
      targetCategory,
      changes
    );
  }

  edges.splice(0, edges.length, ...nextEdges);
  return changed;
}

function dedupeNormalizedEdges(edges) {
  const seenEdgeKeys = new Set();
  return edges.filter(edge => {
    const edgeKey = `${edge.source}->${edge.target}::${edge.label}`;
    if (seenEdgeKeys.has(edgeKey)) {
      return false;
    }
    seenEdgeKeys.add(edgeKey);
    return true;
  });
}

function reviewNormalizedDiagramForGeneration(diagram) {
  const nodes = diagram.nodes || [];
  const edges = diagram.edges || [];
  const findings = [];
  const nodeByName = new Map(nodes.map(node => [node.name, node]));
  const degreeByName = new Map(nodes.map(node => [node.name, 0]));
  const incomingEdgesByName = new Map(nodes.map(node => [node.name, []]));
  const outgoingEdgesByName = new Map(nodes.map(node => [node.name, []]));
  const categoryCounts = countCategories(nodes);
  const complexityScore = buildDiagramComplexityScore(nodes, edges, categoryCounts);

  const addFinding = (severity, title, detail) => {
    findings.push({ severity, title, detail });
  };

  if (nodes.length > 1 && edges.length === 0) {
    addFinding('critical', 'NO_DATA_FLOW', 'Multiple nodes have no connections.');
  }

  for (const edge of edges) {
    const sourceNode = nodeByName.get(edge.source);
    const targetNode = nodeByName.get(edge.target);

    if (!sourceNode || !targetNode) {
      addFinding('warning', 'BROKEN_EDGE_REFERENCE', `${edge.source} -> ${edge.target} references a missing node.`);
      continue;
    }

    degreeByName.set(sourceNode.name, (degreeByName.get(sourceNode.name) || 0) + 1);
    degreeByName.set(targetNode.name, (degreeByName.get(targetNode.name) || 0) + 1);
    incomingEdgesByName.get(targetNode.name)?.push(edge);
    outgoingEdgesByName.get(sourceNode.name)?.push(edge);

    if (CLIENT_CATEGORIES.has(sourceNode.category) && DATABASE_CATEGORIES.has(targetNode.category)) {
      addFinding('critical', `${sourceNode.category.toUpperCase()}_DIRECT_TO_DATABASE`, 'Client layers must not connect directly to databases.');
    }

    if (!isConnectionValid(sourceNode.category, targetNode.category)) {
      addFinding('warning', 'RULE_VIOLATION', `${sourceNode.category} should not connect directly to ${targetNode.category}.`);
    }

    if (GENERIC_EDGE_LABELS.has(normalizeIdentifier(edge.label))) {
      addFinding('info', 'GENERIC_PROTOCOL_LABEL', `${sourceNode.name} -> ${targetNode.name} has a generic protocol label.`);
    }
  }

  nodes.forEach(node => {
    if ((degreeByName.get(node.name) || 0) === 0) {
      addFinding('warning', 'ISOLATED_NODE', `${node.name} is disconnected.`);
    }
  });

  if (((categoryCounts.frontend || 0) + (categoryCounts.mobile || 0)) > 0 && categoryCounts.database && !categoryCounts.backend) {
    addFinding('critical', 'MISSING_APPLICATION_LAYER', 'Client and database layers require an application layer between them.');
  }

  if (((categoryCounts.frontend || 0) + (categoryCounts.mobile || 0)) > 0 && !categoryCounts.backend && !categoryCounts.external) {
    addFinding('critical', 'MISSING_BACKEND_LAYER', 'Client surfaces need a backend or external service to handle requests.');
  }

  if (((categoryCounts.frontend || 0) + (categoryCounts.mobile || 0)) > 0 && !categoryCounts.auth) {
    addFinding('info', 'NO_AUTH_LAYER', 'Client-facing systems should model an auth layer.');
  }

  if (complexityScore >= 10 && !hasObservability(nodes)) {
    addFinding('info', 'NO_OBSERVABILITY_LAYER', 'Production-scale systems should model observability.');
  }

  if ((categoryCounts.database || 0) === 1 && complexityScore >= 12) {
    addFinding('warning', 'SINGLE_DATASTORE_PRESSURE', 'Larger systems should avoid a single datastore bottleneck.');
  }

  getNodesByCategory(nodes, 'queue').forEach(queueNode => {
    const inboundEdges = incomingEdgesByName.get(queueNode.name) || [];
    const outboundEdges = outgoingEdgesByName.get(queueNode.name) || [];
    const hasProducer = inboundEdges.some(edge => {
      const sourceCategory = nodeByName.get(edge.source)?.category;
      return ['backend', 'external', 'queue'].includes(sourceCategory);
    });
    const hasConsumer = outboundEdges.some(edge => {
      const targetCategory = nodeByName.get(edge.target)?.category;
      return ['backend', 'queue'].includes(targetCategory);
    });

    if (!hasProducer) {
      addFinding('warning', 'QUEUE_WITHOUT_PRODUCER', `${queueNode.name} has no producer.`);
    }
    if (!hasConsumer) {
      addFinding('warning', 'QUEUE_WITHOUT_CONSUMER', `${queueNode.name} has no consumer.`);
    }
  });

  const backendNodes = getNodesByCategory(nodes, 'backend');
  const heavyBackendNodes = backendNodes.filter(backendNode => {
    const downstreamCategories = new Set(
      (outgoingEdgesByName.get(backendNode.name) || [])
        .map(edge => nodeByName.get(edge.target)?.category)
        .filter(category => ['database', 'storage', 'external', 'queue'].includes(category))
    );

    return downstreamCategories.size >= 2;
  });

  if (!categoryCounts.queue && (
    backendNodes.length >= 3 ||
    (heavyBackendNodes.length > 0 && ((categoryCounts.database || 0) + (categoryCounts.storage || 0) + (categoryCounts.external || 0)) >= 2)
  )) {
    addFinding('info', 'LIMITED_ASYNC_SCALING_PATH', 'Multiple downstream workloads should have queue-backed async processing.');
  }

  if (backendNodes.length === 1 && nodes.length >= 6) {
    const centralBackend = backendNodes[0];
    const downstreamCategories = new Set(
      (outgoingEdgesByName.get(centralBackend.name) || [])
        .map(edge => nodeByName.get(edge.target)?.category)
        .filter(category => ['database', 'auth', 'storage', 'external', 'queue'].includes(category))
    );

    if (downstreamCategories.size >= 3) {
      addFinding('info', 'CENTRAL_BACKEND_CHOKE_POINT', `${centralBackend.name} owns many downstream paths.`);
    }
  }

  if (categoryCounts.frontend && !categoryCounts.backend && !categoryCounts.external && !categoryCounts.database) {
    addFinding('info', 'FRONTEND_ONLY_ARCHITECTURE', 'Frontend-only diagrams need backend and data layers for production systems.');
  }

  if (!hasTrafficManager(nodes) && nodes.length >= 6 && complexityScore >= 8) {
    addFinding('info', 'MISSING_TRAFFIC_MANAGEMENT', 'Large systems should model traffic management.');
  }

  if (((categoryCounts.frontend || 0) + (categoryCounts.mobile || 0)) > 0 && !categoryCounts.storage && nodes.length >= 4) {
    addFinding('info', 'NO_STORAGE_LAYER', 'Client-facing systems should model object storage.');
  }

  if ((categoryCounts.database || 0) >= 2 && !hasCache(nodes) && complexityScore >= 8) {
    addFinding('info', 'MISSING_CACHE_LAYER', 'Multiple databases should have a cache layer.');
  }

  if (!categoryCounts.queue && backendNodes.length >= 2 && complexityScore >= 10) {
    addFinding('info', 'MISSING_ASYNC_PROCESSING', 'Multiple backend services should have queue-backed async processing.');
  }

  const criticalCount = findings.filter(finding => finding.severity === 'critical').length;
  const warningCount = findings.filter(finding => finding.severity === 'warning').length;
  const infoCount = findings.filter(finding => finding.severity === 'info').length;
  const signalCount = findings.filter(finding => finding.severity === 'info' && finding.title !== 'REVIEW_EDGE_PATTERN').length;
  let score = 100;
  const deductions = {
    critical: criticalCount * 15,
    warning: warningCount * 8,
    info: signalCount * 2,
  };

  score -= deductions.critical + deductions.warning + deductions.info;

  const bonuses = {};
  if (categoryCounts.backend > 0 && categoryCounts.database > 0) { score += 2; bonuses.backendDb = 2; }
  if (categoryCounts.auth > 0) { score += 2; bonuses.auth = 2; }
  if (hasCache(nodes)) { score += 3; bonuses.cache = 3; }
  if (categoryCounts.queue > 0) { score += 3; bonuses.queue = 3; }
  if (categoryCounts.storage > 0) { score += 2; bonuses.storage = 2; }
  if (categoryCounts.devops > 0) { score += 3; bonuses.observability = 3; }

  if (nodes.length === 0) score = 0;
  if (nodes.length === 1 && edges.length === 0) score = 10;
  score = Math.max(0, Math.min(100, score));

  let grade = 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 35) grade = 'D';

  return {
    score: { score, grade, criticalCount, warningCount, infoCount, breakdown: { deductions, bonuses } },
    findings,
  };
}

export function hardenNormalizedDiagramForReview(diagram) {
  const hardened = {
    nodes: [...(diagram.nodes || [])],
    edges: [...(diagram.edges || [])],
  };
  const changes = [];

  for (let pass = 0; pass < REVIEW_SAFE_MAX_PASSES; pass += 1) {
    const before = JSON.stringify(hardened);

    ensureProductionCompleteness(hardened.nodes, hardened.edges, changes);
    changes.push(...enforceArchitectureRules(hardened.nodes, hardened.edges));
    changes.push(...connectIsolatedNodes(hardened.nodes, hardened.edges));
    sanitizeInvalidConnections(hardened.nodes, hardened.edges, changes);
    ensureQueueTopology(hardened.nodes, hardened.edges, changes);
    sanitizeInvalidConnections(hardened.nodes, hardened.edges, changes);
    hardened.edges = dedupeNormalizedEdges(hardened.edges);

    if (JSON.stringify(hardened) === before) {
      break;
    }
  }

  const quality = reviewNormalizedDiagramForGeneration(hardened);
  const activeFindings = quality.findings.filter(finding => finding.severity === 'critical' || finding.severity === 'warning');

  if (activeFindings.length > 0) {
    ensureProductionCompleteness(hardened.nodes, hardened.edges, changes);
    ensureQueueTopology(hardened.nodes, hardened.edges, changes);
    sanitizeInvalidConnections(hardened.nodes, hardened.edges, changes);
    hardened.edges = dedupeNormalizedEdges(hardened.edges);
  }

  return {
    diagram: hardened,
    changes: [...new Set(changes)],
    quality: reviewNormalizedDiagramForGeneration(hardened),
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
      content: `Your previous response could not be accepted (${errorMessage}). Return ONLY valid JSON matching this shape: ${schemaHint}. Do not include markdown fences, prose, duplicate objects, or explanations. The diagram must have no rule violations, no direct client-to-database links, no isolated nodes, queue producer and consumer paths, and all production support layers needed to score 100/100.`
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
      const hardened = hardenNormalizedDiagramForReview(normalizedDiagram);
      const activeFindings = hardened.quality.findings
        .filter(finding => finding.severity === 'critical' || finding.severity === 'warning');

      if (activeFindings.length > 0 || hardened.quality.score.score < 100) {
        const findingTitles = activeFindings.map(finding => finding.title).join(', ') || `score ${hardened.quality.score.score}/100`;
        throw new Error(`Generated architecture failed deterministic review gate: ${findingTitles}`);
      }

      validateNormalizedDiagram(hardened.diagram);
      const nodes = generateNodesFromDiagram(hardened.diagram.nodes);
      const edges = generateEdgesFromDiagram(hardened.diagram.nodes, hardened.diagram.edges, nodes);

      return {
        model: resolvedModel,
        rawResponse,
        userMessage,
        nodes,
        edges,
        quality: hardened.quality,
        autoFixes: hardened.changes.length > 0 ? hardened.changes : undefined
      };
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      currentMessages = buildJsonRepairMessages(messages, rawResponse, error.message, JSON_SCHEMA_HINT);
    }
  }

  const failure = new Error(
    `Failed to produce a review-safe AI diagram after ${maxAttempts} attempt(s): ${lastError?.message || 'Unknown generation error'}`
  );
  failure.rawResponse = rawResponse;
  failure.model = resolvedModel;
  throw failure;
}
