import { formatTechDisplayLabel } from '@/lib/displayNames';
import {
  buildCategoryCounts,
  buildDiagramComplexityScore,
  buildRuleMap,
  GENERIC_EDGE_LABELS,
  getProtocolFamily,
  getRuleKey,
  isSignedStorageAccessPattern,
  normalizeTechLabel,
  pushFinding
} from './utils';

export function buildArchitectureReview({ nodes, edges, connectionRules, connectionMode, mode }) {
  const relaxed = mode === 'relaxed';
  const techNodes = (nodes || []).filter(node => node.type === 'customNode');
  const findings = [];

  if (techNodes.length === 0) {
    return findings;
  }

  if (relaxed) {
    return findings;
  }

  const nodeById = new Map(techNodes.map(node => [node.id, node]));
  const degreeByNodeId = new Map(techNodes.map(node => [node.id, 0]));
  const incomingEdgesByNodeId = new Map(techNodes.map(node => [node.id, []]));
  const outgoingEdgesByNodeId = new Map(techNodes.map(node => [node.id, []]));
  const categoryCounts = buildCategoryCounts(techNodes);
  const complexityScore = buildDiagramComplexityScore(techNodes, edges, categoryCounts);
  const ruleMap = buildRuleMap(connectionRules);

  if ((edges || []).length === 0 && techNodes.length > 1) {
    pushFinding(findings, {
      severity: 'critical',
      title: 'NO_DATA_FLOW',
      detail: 'The diagram has multiple nodes but no connections, so the system flow is impossible to validate.',
      nodeIds: techNodes.map(node => node.id)
    });
  }

  (edges || []).forEach(edge => {
    const sourceNode = nodeById.get(edge.source);
    const targetNode = nodeById.get(edge.target);

    if (!sourceNode || !targetNode) {
      return;
    }

    degreeByNodeId.set(edge.source, (degreeByNodeId.get(edge.source) || 0) + 1);
    degreeByNodeId.set(edge.target, (degreeByNodeId.get(edge.target) || 0) + 1);
    incomingEdgesByNodeId.get(edge.target)?.push(edge);
    outgoingEdgesByNodeId.get(edge.source)?.push(edge);

    const sourceCategory = sourceNode.data.category || 'unknown';
    const targetCategory = targetNode.data.category || 'unknown';
    const protocolFamily = getProtocolFamily(edge.label);
    const rule = ruleMap.get(getRuleKey(sourceCategory, targetCategory));
    const signedStorageAccessPattern = isSignedStorageAccessPattern({
      sourceCategory,
      targetCategory,
      protocolFamily
    });
    const signedStorageHasBackendControlPlane = signedStorageAccessPattern && (categoryCounts.backend || 0) > 0;

    if (sourceCategory === 'frontend' && targetCategory === 'database') {
      pushFinding(findings, {
        severity: 'critical',
        title: 'FRONTEND_DIRECT_TO_DATABASE',
        detail: 'Frontend should not connect directly to the database. Introduce a backend or BFF layer.',
        nodeIds: [sourceNode.id, targetNode.id],
        edgeIds: [edge.id]
      });
    }

    if (sourceCategory === 'mobile' && targetCategory === 'database') {
      pushFinding(findings, {
        severity: 'critical',
        title: 'MOBILE_DIRECT_TO_DATABASE',
        detail: 'Mobile clients should not connect directly to the database. Route traffic through an application service.',
        nodeIds: [sourceNode.id, targetNode.id],
        edgeIds: [edge.id]
      });
    }

    if (signedStorageAccessPattern && !signedStorageHasBackendControlPlane && connectionMode !== 'sandbox') {
      pushFinding(findings, {
        severity: 'warning',
        title: 'MISSING_STORAGE_CONTROL_PLANE',
        detail: 'The client is using a signed storage access pattern, but no backend or signing service is present to issue scoped upload/download credentials.',
        nodeIds: [sourceNode.id, targetNode.id],
        edgeIds: [edge.id]
      });
    } else if (signedStorageHasBackendControlPlane && connectionMode !== 'sandbox') {
      pushFinding(findings, {
        severity: 'info',
        title: 'SIGNED_STORAGE_PATH',
        detail: 'The client reaches storage through a signed access flow. Verify the backend is issuing short-lived, tightly scoped credentials or URLs.',
        nodeIds: [sourceNode.id, targetNode.id],
        edgeIds: [edge.id]
      });
    } else if (rule && rule.is_valid === false && connectionMode !== 'sandbox') {
      pushFinding(findings, {
        severity: connectionMode === 'strict' ? 'critical' : 'warning',
        title: 'RULE_VIOLATION',
        detail: rule.warning_message || `${sourceCategory} should not connect directly to ${targetCategory}.`,
        nodeIds: [sourceNode.id, targetNode.id],
        edgeIds: [edge.id]
      });
    } else if (rule && rule.warning_message && connectionMode !== 'sandbox') {
      pushFinding(findings, {
        severity: 'info',
        title: 'REVIEW_EDGE_PATTERN',
        detail: rule.warning_message,
        nodeIds: [sourceNode.id, targetNode.id],
        edgeIds: [edge.id]
      });
    }

    if (GENERIC_EDGE_LABELS.has(normalizeTechLabel(edge.label))) {
      pushFinding(findings, {
        severity: 'info',
        title: 'GENERIC_PROTOCOL_LABEL',
        detail: `${formatTechDisplayLabel(sourceNode.data.label, sourceNode.data.category)} to ${formatTechDisplayLabel(targetNode.data.label, targetNode.data.category)} still uses a generic connection label. Clarify the protocol or interaction pattern.`,
        nodeIds: [sourceNode.id, targetNode.id],
        edgeIds: [edge.id]
      });
    }
  });

  techNodes.forEach(node => {
    if ((degreeByNodeId.get(node.id) || 0) === 0) {
      pushFinding(findings, {
        severity: 'warning',
        title: 'ISOLATED_NODE',
        detail: `${formatTechDisplayLabel(node.data.label, node.data.category)} is disconnected from the rest of the system.`,
        nodeIds: [node.id]
      });
    }
  });

  if ((categoryCounts.frontend || categoryCounts.mobile) && categoryCounts.database && !categoryCounts.backend) {
    pushFinding(findings, {
      severity: 'critical',
      title: 'MISSING_APPLICATION_LAYER',
      detail: 'Client-facing layers are present with a database, but no backend/application layer exists between them.',
      nodeIds: techNodes
        .filter(node => ['frontend', 'mobile', 'database'].includes(node.data.category))
        .map(node => node.id)
    });
  }

  if ((categoryCounts.frontend || categoryCounts.mobile) && !categoryCounts.auth && connectionMode !== 'sandbox') {
    pushFinding(findings, {
      severity: 'info',
      title: 'NO_AUTH_LAYER',
      detail: 'This architecture has client-facing surfaces but no explicit auth layer. That may be intentional, but it should be confirmed.',
      nodeIds: techNodes
        .filter(node => ['frontend', 'mobile'].includes(node.data.category))
        .map(node => node.id)
    });
  }

  if (complexityScore >= 10 && !categoryCounts.devops) {
    pushFinding(findings, {
      severity: 'info',
      title: 'NO_OBSERVABILITY_LAYER',
      detail: 'The architecture has enough moving parts to justify explicit observability or delivery tooling, but no devops layer is modeled yet.',
      nodeIds: techNodes.map(node => node.id)
    });
  }

  if ((categoryCounts.database || 0) === 1 && complexityScore >= 12) {
    pushFinding(findings, {
      severity: 'warning',
      title: 'SINGLE_DATASTORE_PRESSURE',
      detail: 'A larger system is relying on a single explicit datastore. Review whether this becomes a throughput or failure bottleneck.',
      nodeIds: techNodes.filter(node => node.data.category === 'database').map(node => node.id)
    });
  }

  const queueNodes = techNodes.filter(node => node.data.category === 'queue');
  queueNodes.forEach(node => {
    const inboundEdges = incomingEdgesByNodeId.get(node.id) || [];
    const outboundEdges = outgoingEdgesByNodeId.get(node.id) || [];
    const hasProducer = inboundEdges.some(edge => {
      const sourceCategory = nodeById.get(edge.source)?.data?.category;
      return sourceCategory === 'backend' || sourceCategory === 'external' || sourceCategory === 'queue';
    });
    const hasConsumer = outboundEdges.some(edge => {
      const targetCategory = nodeById.get(edge.target)?.data?.category;
      return targetCategory === 'backend' || targetCategory === 'queue';
    });

    if (!hasProducer || !hasConsumer) {
      pushFinding(findings, {
        severity: 'warning',
        title: !hasProducer ? 'QUEUE_WITHOUT_PRODUCER' : 'QUEUE_WITHOUT_CONSUMER',
        detail: !hasProducer
          ? `${formatTechDisplayLabel(node.data.label, node.data.category)} has no clear producer. Model which service or external event source publishes work into the queue.`
          : `${formatTechDisplayLabel(node.data.label, node.data.category)} has no clear consumer. Model the worker or backend service that drains and processes this queue.`,
        nodeIds: [node.id],
        edgeIds: [...inboundEdges, ...outboundEdges].map(edge => edge.id).filter(Boolean)
      });
    }
  });

  const backendNodes = techNodes.filter(node => node.data.category === 'backend');
  const heavyBackendNodes = backendNodes.filter(node => {
    const outgoingEdges = outgoingEdgesByNodeId.get(node.id) || [];
    const downstreamCategories = new Set(
      outgoingEdges
        .map(edge => nodeById.get(edge.target)?.data?.category)
        .filter(category => ['database', 'storage', 'external', 'queue'].includes(category))
    );

    return downstreamCategories.size >= 2;
  });

  if (
    !categoryCounts.queue
    && (
      backendNodes.length >= 3
      || (
        heavyBackendNodes.length > 0
        && ((categoryCounts.database || 0) + (categoryCounts.storage || 0) + (categoryCounts.external || 0)) >= 2
      )
    )
  ) {
    pushFinding(findings, {
      severity: 'info',
      title: 'LIMITED_ASYNC_SCALING_PATH',
      detail: 'The system has multiple downstream workloads but no explicit queue or event stream, so background processing and retries may stay tightly coupled to synchronous request paths.',
      nodeIds: backendNodes.map(node => node.id)
    });
  }

  if (backendNodes.length === 1 && techNodes.length >= 6) {
    const centralBackend = backendNodes[0];
    const downstreamCategories = new Set(
      (outgoingEdgesByNodeId.get(centralBackend.id) || [])
        .map(edge => nodeById.get(edge.target)?.data?.category)
        .filter(category => ['database', 'auth', 'storage', 'external', 'queue'].includes(category))
    );

    if (downstreamCategories.size >= 3) {
      pushFinding(findings, {
        severity: 'info',
        title: 'CENTRAL_BACKEND_CHOKE_POINT',
        detail: `${formatTechDisplayLabel(centralBackend.data.label, centralBackend.data.category)} is carrying several downstream responsibilities on its own. Review whether this becomes a scaling or failure choke point as the product grows.`,
        nodeIds: [centralBackend.id]
      });
    }
  }

  if ((categoryCounts.frontend || categoryCounts.mobile) && !categoryCounts.backend && !categoryCounts.external) {
    pushFinding(findings, {
      severity: 'critical',
      title: 'MISSING_BACKEND_LAYER',
      detail: 'Client surfaces exist with no backend or external service to handle requests. Add an API layer.',
      nodeIds: techNodes.filter(n => ['frontend', 'mobile'].includes(n.data.category)).map(n => n.id)
    });
  }

  if (categoryCounts.frontend && !categoryCounts.backend && !categoryCounts.external && !categoryCounts.database) {
    pushFinding(findings, {
      severity: 'info',
      title: 'FRONTEND_ONLY_ARCHITECTURE',
      detail: 'The diagram only contains frontend components. A complete system needs backend, data, and infrastructure layers.',
      nodeIds: techNodes.map(n => n.id)
    });
  }

  const hasLoadBalancerOrCDN = techNodes.some(n =>
    ['NGINX', 'CLOUDFLARE', 'KUBERNETES', 'AWS_CLOUDFRONT', 'AKAMAI', 'ENVOY'].includes(n.data.label)
  );
  if (!hasLoadBalancerOrCDN && techNodes.length >= 6 && complexityScore >= 8) {
    pushFinding(findings, {
      severity: 'info',
      title: 'MISSING_TRAFFIC_MANAGEMENT',
      detail: 'A system of this size typically benefits from a load balancer, reverse proxy, or CDN (e.g., NGINX, CLOUDFLARE) to handle traffic distribution and edge caching.',
      nodeIds: techNodes.map(n => n.id)
    });
  }

  const hasStorage = categoryCounts.storage > 0;
  if ((categoryCounts.frontend || categoryCounts.mobile) && !hasStorage && techNodes.length >= 4) {
    pushFinding(findings, {
      severity: 'info',
      title: 'NO_STORAGE_LAYER',
      detail: 'Client-facing systems usually need object storage (S3, R2, GCS) for user-generated content, assets, and uploads.',
      nodeIds: techNodes.filter(n => ['frontend', 'mobile'].includes(n.data.category)).map(n => n.id)
    });
  }

  const hasRedis = techNodes.some(n => normalizeTechLabel(n.data.label) === 'REDIS');
  if ((categoryCounts.database || 0) >= 2 && !hasRedis && complexityScore >= 8) {
    pushFinding(findings, {
      severity: 'info',
      title: 'MISSING_CACHE_LAYER',
      detail: 'Multiple databases without a caching layer (REDIS, MEMCACHED) can lead to unnecessary load and higher latency for hot data.',
      nodeIds: techNodes.filter(n => n.data.category === 'database').map(n => n.id)
    });
  }

  const hasAsyncLayer = categoryCounts.queue > 0 || techNodes.some(n => normalizeTechLabel(n.data.label) === 'KAFKA');
  if (!hasAsyncLayer && backendNodes.length >= 2 && complexityScore >= 10) {
    pushFinding(findings, {
      severity: 'info',
      title: 'MISSING_ASYNC_PROCESSING',
      detail: 'Multiple backend services without an event bus or message queue (KAFKA, RABBITMQ) can lead to tight coupling and scaling bottlenecks for background work.',
      nodeIds: backendNodes.map(n => n.id)
    });
  }

  const deduped = new Map();
  findings.forEach(finding => {
    if (relaxed && finding.severity !== 'critical') {
      return;
    }
    const key = `${finding.title}:${finding.detail}:${finding.nodeIds.join(',')}:${finding.edgeIds.join(',')}`;
    if (!deduped.has(key)) {
      deduped.set(key, finding);
    }
  });

  return [...deduped.values()];
}
