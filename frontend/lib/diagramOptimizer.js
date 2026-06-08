import {
  buildArchitectureReview,
  buildArchitectureScore,
  normalizeTechLabel
} from '@/lib/diagramIntelligence';

function getNodeLabel(node) {
  return node?.data?.label || node?.name || node?.id || 'SYSTEM';
}

function getFixEdgeLabel(category) {
  if (category === 'auth') return 'OIDC';
  if (category === 'queue') return 'KAFKA';
  if (category === 'storage') return 'S3';
  if (category === 'database') return 'SQL';
  if (category === 'devops') return 'HTTP';
  return 'HTTPS';
}

function buildFixSpecs({ nodes, existingLabels, existingCategories, primaryBackend }) {
  const backendLabel = normalizeTechLabel(getNodeLabel(primaryBackend)).replace(/\W+/g, '_') || 'BACKEND';
  const backendCount = nodes.filter(node => node.data?.category === 'backend').length;
  const databaseCount = nodes.filter(node => node.data?.category === 'database').length;
  const hasBackend = existingCategories.has('backend');

  return [
    {
      titles: ['NO_AUTH_LAYER'],
      label: 'CLERK',
      category: 'auth',
      icon: 'shield',
      role: 'Authentication and user management',
      check: () => !existingCategories.has('auth') && hasBackend
    },
    {
      titles: ['NO_OBSERVABILITY_LAYER'],
      label: 'GRAFANA',
      category: 'devops',
      icon: 'bar-chart',
      role: 'Monitoring and observability',
      check: () => !existingCategories.has('devops') && nodes.length >= 5 && hasBackend
    },
    {
      titles: ['MISSING_CACHE_LAYER'],
      label: 'REDIS',
      category: 'database',
      icon: 'database',
      role: 'Caching and session store',
      edgeLabel: 'TCP',
      check: () => !existingLabels.has('REDIS') && databaseCount >= 2 && hasBackend
    },
    {
      titles: ['MISSING_ASYNC_PROCESSING', 'LIMITED_ASYNC_SCALING_PATH', 'CENTRAL_BACKEND_CHOKE_POINT'],
      label: 'KAFKA',
      category: 'queue',
      icon: 'message-square',
      role: 'Async message broker and event stream',
      companion: {
        label: 'KAFKA_WORKER',
        category: 'backend',
        icon: 'server',
        role: 'Async worker'
      },
      check: () => !existingCategories.has('queue') && backendCount >= 1 && hasBackend
    },
    {
      titles: ['NO_STORAGE_LAYER'],
      label: 'S3',
      category: 'storage',
      icon: 'hard-drive',
      role: 'Object storage for assets',
      check: () => !existingCategories.has('storage') && nodes.length >= 4 && hasBackend
    },
    {
      titles: ['MISSING_TRAFFIC_MANAGEMENT'],
      label: 'NGINX',
      category: 'devops',
      icon: 'server',
      role: 'Reverse proxy and load balancer',
      direction: 'new-to-backend',
      check: () => !existingLabels.has('NGINX') && nodes.length >= 6 && hasBackend
    },
    {
      titles: ['SINGLE_DATASTORE_PRESSURE'],
      label: `${backendLabel}_DB_REPLICA`,
      category: 'database',
      icon: 'database',
      role: 'Read replica for scaling',
      check: () => hasBackend && existingCategories.has('database') && databaseCount === 1
    }
  ];
}

function findOpenPosition(nodes, additionsLength) {
  const techNodes = nodes.filter(node => node.type === 'customNode');
  const rightmostX = Math.max(...techNodes.map(node => node.position?.x || 0), 120);
  const anchorY = Math.round(
    techNodes.reduce((sum, node) => sum + (node.position?.y || 0), 0) / Math.max(techNodes.length, 1)
  );

  return {
    x: rightmostX + 220 + additionsLength * 60,
    y: anchorY + additionsLength * 80
  };
}

function appendEdge(nextEdges, edge) {
  if (!edge.source || !edge.target || edge.source === edge.target) {
    return;
  }

  const edgeKey = `${edge.source}->${edge.target}`;
  if (nextEdges.some(existing => `${existing.source}->${existing.target}` === edgeKey)) {
    return;
  }

  nextEdges.push(edge);
}

export function buildOptimizeTo100Result({
  nodes,
  edges,
  connectionRules,
  connectionMode,
  simulateFlow = false,
  idPrefix = 'node_opt',
  reasonPrefix = 'Auto-added'
}) {
  const findings = buildArchitectureReview({ nodes, edges, connectionRules, connectionMode });
  const score = buildArchitectureScore(findings, nodes, edges);
  const techNodes = nodes.filter(node => node.type === 'customNode');
  const existingLabels = new Set(techNodes.map(node => normalizeTechLabel(getNodeLabel(node))));
  const existingCategories = new Set(techNodes.map(node => node.data?.category));
  const primaryBackend = techNodes.find(node => node.data?.category === 'backend');
  const additions = [];

  if (!primaryBackend || score.score >= 100) {
    return { nodes, edges, additions, findings, score };
  }

  const fixSpecs = buildFixSpecs({
    nodes: techNodes,
    existingLabels,
    existingCategories,
    primaryBackend
  });

  findings.forEach(finding => {
    const match = fixSpecs.find(spec => spec.titles.includes(finding.title) && spec.check());
    if (!match) return;
    if (additions.some(addition => addition.label === match.label)) return;
    const position = findOpenPosition(techNodes, additions.length);
    additions.push({ ...match, ...position });
    existingLabels.add(match.label);
    existingCategories.add(match.category);

    if (match.companion) {
      existingLabels.add(match.companion.label);
      existingCategories.add(match.companion.category);
    }
  });

  if (additions.length === 0) {
    return { nodes, edges, additions, findings, score };
  }

  const timestamp = Date.now();
  const nextNodes = [...nodes];
  const nextEdges = [...edges];

  additions.forEach((addition, index) => {
    const nodeId = `${idPrefix}_${timestamp}_${index}`;
    const node = {
      id: nodeId,
      type: 'customNode',
      position: { x: addition.x, y: addition.y },
      data: {
        label: addition.label,
        category: addition.category,
        role: addition.role,
        reason: `${reasonPrefix}: missing ${addition.category} layer`,
        icon: addition.icon,
        products: []
      }
    };
    nextNodes.push(node);

    if (addition.direction === 'new-to-backend') {
      appendEdge(nextEdges, {
        id: `e_${idPrefix}_${timestamp}_${index}`,
        source: nodeId,
        target: primaryBackend.id,
        label: addition.edgeLabel || getFixEdgeLabel(addition.category),
        animated: simulateFlow
      });
    } else {
      appendEdge(nextEdges, {
        id: `e_${idPrefix}_${timestamp}_${index}`,
        source: primaryBackend.id,
        target: nodeId,
        label: addition.edgeLabel || getFixEdgeLabel(addition.category),
        animated: simulateFlow
      });
    }

    if (addition.companion) {
      const companionId = `${idPrefix}_${timestamp}_${index}_worker`;
      nextNodes.push({
        id: companionId,
        type: 'customNode',
        position: { x: addition.x + 280, y: addition.y + 100 },
        data: {
          label: addition.companion.label,
          category: addition.companion.category,
          role: addition.companion.role,
          reason: `${reasonPrefix}: queue consumer for async processing`,
          icon: addition.companion.icon,
          products: []
        }
      });
      appendEdge(nextEdges, {
        id: `e_${idPrefix}_${timestamp}_${index}_worker`,
        source: nodeId,
        target: companionId,
        label: getFixEdgeLabel(addition.category),
        animated: simulateFlow
      });
    }
  });

  return { nodes: nextNodes, edges: nextEdges, additions, findings, score };
}
