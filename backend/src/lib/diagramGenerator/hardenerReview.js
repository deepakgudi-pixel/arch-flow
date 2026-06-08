import {
  CLIENT_CATEGORIES,
  DATABASE_CATEGORIES,
  GENERIC_EDGE_LABELS
} from './hardenerCatalog.js';
import { getNodesByCategory, isConnectionValid } from './hardenerConnections.js';
import { normalizeIdentifier } from './hardenerIdentifiers.js';
import {
  buildDiagramComplexityScore,
  countCategories,
  hasCache,
  hasObservability,
  hasTrafficManager
} from './hardenerMetrics.js';

export function reviewNormalizedDiagramForGeneration(diagram) {
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
