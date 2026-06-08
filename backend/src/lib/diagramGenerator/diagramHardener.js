import {
  BACKEND_TECH_NAMES,
  CLIENT_CATEGORIES,
  REVIEW_SAFE_MAX_PASSES
} from './hardenerCatalog.js';
import {
  addNormalizedEdge,
  addNormalizedNode,
  getNodesByCategory,
  hasNodeNamed,
  isConnectionValid,
  normalizeEdgeLabelForConnection
} from './hardenerConnections.js';
import { connectIsolatedNodes } from './hardenerConnectivity.js';
import {
  buildDiagramComplexityScore,
  countCategories,
  hasCache,
  hasObservability,
  hasTrafficManager
} from './hardenerMetrics.js';
import { reviewNormalizedDiagramForGeneration } from './hardenerReview.js';

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
