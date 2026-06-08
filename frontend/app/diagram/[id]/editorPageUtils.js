import { canonicalConnectionRuleObjects } from '../../../../shared/connectionRules.js';

export const DEFAULT_CATEGORY_ORDER = ['mobile', 'frontend', 'auth', 'backend', 'database', 'queue', 'storage', 'external', 'devops'];

export const AUTO_LAYOUT = {
  nodeWidth: 220,
  nodeHeight: 96,
  zonePaddingX: 40,
  zonePaddingTop: 58,
  zonePaddingBottom: 40,
  nodeGapX: 48,
  nodeGapY: 36,
  zoneGapX: 72,
  startX: 140,
  startY: 140
};

export const GENERIC_PROTOCOL_LABELS = new Set(['CONNECTION', 'INFERRING...', '']);
export const REVIEW_NEW_NODE_TOKEN = '__NEW__';

export function getBalancedColumnCount(nodeCount) {
  if (nodeCount >= 24) return 5;
  if (nodeCount >= 16) return 4;
  if (nodeCount >= 9) return 3;
  if (nodeCount >= 4) return 2;
  return 1;
}

function average(values) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function createReviewSuggestionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `suggestion_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeSuggestionValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function buildSuggestionKey(suggestion) {
  return `${suggestion.category || 'backend'}:${normalizeSuggestionValue(suggestion.name)}`;
}

function buildConnectionSignature(connection) {
  return `${connection.source}->${connection.target}`;
}

function buildSuggestionRuleMap(connectionRules) {
  const effectiveRules = connectionRules && connectionRules.length > 0
    ? connectionRules
    : canonicalConnectionRuleObjects;

  return new Map(
    effectiveRules.map(rule => [
      `${rule.source_category || 'unknown'}->${rule.target_category || 'unknown'}`,
      rule
    ])
  );
}

function isInvalidSuggestionConnection(sourceCategory, targetCategory, ruleMap) {
  const rule = ruleMap.get(`${sourceCategory || 'unknown'}->${targetCategory || 'unknown'}`);
  return rule?.is_valid === false;
}

function getSuggestionProtocolFamily(label) {
  const protocol = String(label || '')
    .trim()
    .toUpperCase();

  if (protocol.includes('SIGNED URL') || protocol.includes('SIGNED_URL')) {
    return 'signed-url';
  }

  return 'other';
}

export function mergeReviewSuggestions(existingSuggestions, incomingSuggestions) {
  const existingByKey = new Map(
    (existingSuggestions || []).map(suggestion => [buildSuggestionKey(suggestion), suggestion])
  );
  const mergedIncoming = (incomingSuggestions || []).map(suggestion => {
    const key = buildSuggestionKey(suggestion);
    const existing = existingByKey.get(key);

    if (existing) {
      existingByKey.delete(key);
    }

    return {
      ...existing,
      ...suggestion,
      id: existing?.id || suggestion.id || createReviewSuggestionId()
    };
  });

  return [...mergedIncoming, ...existingByKey.values()];
}

function snapCoordinate(value) {
  return Math.round(value / 20) * 20;
}

function findOpenSuggestionPosition(basePosition, techNodes) {
  const baseX = Math.max(60, snapCoordinate(basePosition.x || 160));
  const baseY = Math.max(80, snapCoordinate(basePosition.y || 160));
  let x = baseX;
  let y = baseY;

  for (let attempt = 0; attempt < 16; attempt += 1) {
    const overlaps = techNodes.some(node => {
      const nodeX = node.position?.x || 0;
      const nodeY = node.position?.y || 0;

      return Math.abs(nodeX - x) < AUTO_LAYOUT.nodeWidth + 24 &&
        Math.abs(nodeY - y) < AUTO_LAYOUT.nodeHeight + 24;
    });

    if (!overlaps) {
      return { x, y };
    }

    y += 140;

    if (attempt > 0 && attempt % 4 === 0) {
      x += 60;
      y = baseY;
    }
  }

  return { x, y };
}

export function computeSuggestedNodePosition(suggestion, nodes) {
  const techNodes = (nodes || []).filter(node => node.type === 'customNode');

  if (techNodes.length === 0) {
    return { x: 160, y: 160 };
  }

  const nodeById = new Map(techNodes.map(node => [node.id, node]));
  const upstreamNodes = (suggestion.connections || [])
    .filter(connection => connection.target === REVIEW_NEW_NODE_TOKEN)
    .map(connection => nodeById.get(connection.source))
    .filter(Boolean);
  const downstreamNodes = (suggestion.connections || [])
    .filter(connection => connection.source === REVIEW_NEW_NODE_TOKEN)
    .map(connection => nodeById.get(connection.target))
    .filter(Boolean);
  const anchorNodes = [...new Set([...upstreamNodes, ...downstreamNodes])];

  if (anchorNodes.length === 0) {
    const rightmostX = Math.max(...techNodes.map(node => node.position?.x || 0), 120);
    const anchorY = average(techNodes.map(node => node.position?.y || 0)) ?? 140;

    return findOpenSuggestionPosition({
      x: rightmostX + AUTO_LAYOUT.nodeWidth + 80,
      y: anchorY
    }, techNodes);
  }

  const xCandidates = [];

  if (upstreamNodes.length > 0) {
    xCandidates.push(
      Math.max(...upstreamNodes.map(node => (node.position?.x || 0) + AUTO_LAYOUT.nodeWidth + 60))
    );
  }

  if (downstreamNodes.length > 0) {
    xCandidates.push(
      Math.min(...downstreamNodes.map(node => (node.position?.x || 0) - AUTO_LAYOUT.nodeWidth - 60))
    );
  }

  const baseX = average(xCandidates) ?? average(anchorNodes.map(node => node.position?.x || 0)) ?? 160;
  const baseY = average(anchorNodes.map(node => node.position?.y || 0)) ?? 140;

  return findOpenSuggestionPosition({ x: baseX, y: baseY }, techNodes);
}

function buildNodeDegreeLookup(nodes, edges) {
  const techNodes = (nodes || []).filter(node => node.type === 'customNode');
  const degrees = new Map(techNodes.map(node => [node.id, 0]));

  (edges || []).forEach(edge => {
    if (degrees.has(edge.source)) {
      degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
    }

    if (degrees.has(edge.target)) {
      degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
    }
  });

  return degrees;
}

function pickPreferredAnchorNode(nodes, degreeLookup, categories, excludedIds = new Set()) {
  return (nodes || [])
    .filter(node => (
      node.type === 'customNode' &&
      categories.includes(node.data?.category) &&
      !excludedIds.has(node.id)
    ))
    .sort((left, right) => {
      const degreeDelta = (degreeLookup.get(right.id) || 0) - (degreeLookup.get(left.id) || 0);

      if (degreeDelta !== 0) {
        return degreeDelta;
      }

      return (left.position?.x || 0) - (right.position?.x || 0);
    })[0] || null;
}

function buildFallbackSuggestionConnections(suggestion, nodes, edges) {
  const techNodes = (nodes || []).filter(node => node.type === 'customNode');

  if (techNodes.length === 0) {
    return [];
  }

  const degreeLookup = buildNodeDegreeLookup(techNodes, edges);
  const connections = [];
  const usedAnchors = new Set();
  const addConnection = (source, target, label, reason) => {
    if (!source || !target || source === target) {
      return;
    }

    const signature = `${source}->${target}`;

    if (connections.some(connection => buildConnectionSignature(connection) === signature)) {
      return;
    }

    if (source !== REVIEW_NEW_NODE_TOKEN) {
      usedAnchors.add(source);
    }

    if (target !== REVIEW_NEW_NODE_TOKEN) {
      usedAnchors.add(target);
    }

    connections.push({ source, target, label, reason });
  };
  const pickAny = (categories) => pickPreferredAnchorNode(techNodes, degreeLookup, categories);
  const category = suggestion.category;

  if (category === 'backend') {
    const client = pickAny(['frontend', 'mobile']);
    const database = pickAny(['database']);
    const auth = pickAny(['auth']);
    const queue = pickAny(['queue']);
    const storage = pickAny(['storage']);
    const external = pickAny(['external']);

    if (client) addConnection(client.id, REVIEW_NEW_NODE_TOKEN, 'REST', 'Client traffic should flow through an application layer.');
    if (database) addConnection(REVIEW_NEW_NODE_TOKEN, database.id, 'SQL', 'The backend should own database access for this flow.');
    if (auth) addConnection(REVIEW_NEW_NODE_TOKEN, auth.id, 'OIDC', 'The backend usually coordinates identity or token validation.');
    if (queue) addConnection(REVIEW_NEW_NODE_TOKEN, queue.id, 'ASYNC', 'Background or deferred work should hang off the backend layer.');
    if (storage) addConnection(REVIEW_NEW_NODE_TOKEN, storage.id, 'S3', 'The backend should mediate asset access and file workflows.');
    if (external) addConnection(REVIEW_NEW_NODE_TOKEN, external.id, 'HTTPS', 'External integrations are typically orchestrated by the backend.');
  }

  if (category === 'frontend') {
    const backend = pickAny(['backend']);
    const auth = pickAny(['auth']);

    if (backend) addConnection(REVIEW_NEW_NODE_TOKEN, backend.id, 'REST', 'The frontend should call into the backend or BFF.');
    if (auth) addConnection(REVIEW_NEW_NODE_TOKEN, auth.id, 'OIDC', 'Client-facing login flows commonly integrate with the auth layer.');
  }

  if (category === 'mobile') {
    const backend = pickAny(['backend']);
    const auth = pickAny(['auth']);

    if (backend) addConnection(REVIEW_NEW_NODE_TOKEN, backend.id, 'REST', 'The mobile client should rely on an application API.');
    if (auth) addConnection(REVIEW_NEW_NODE_TOKEN, auth.id, 'OIDC', 'Mobile sign-in typically depends on the auth provider.');
  }

  if (category === 'database') {
    const backend = pickAny(['backend']);

    if (backend) addConnection(backend.id, REVIEW_NEW_NODE_TOKEN, 'SQL', 'The application layer should own database access.');
  }

  if (category === 'auth') {
    const client = pickAny(['frontend', 'mobile']);
    const backend = pickAny(['backend']);

    if (client) addConnection(client.id, REVIEW_NEW_NODE_TOKEN, 'OIDC', 'The auth layer should serve the client-facing sign-in flow.');
    if (backend) addConnection(backend.id, REVIEW_NEW_NODE_TOKEN, 'JWT', 'The backend typically validates or exchanges identity tokens here.');
  }

  if (category === 'queue') {
    const backend = pickAny(['backend']);

    if (backend) addConnection(backend.id, REVIEW_NEW_NODE_TOKEN, 'ASYNC', 'Queues are usually fed by backend services or workers.');
  }

  if (category === 'storage') {
    const backend = pickAny(['backend']);

    if (backend) addConnection(backend.id, REVIEW_NEW_NODE_TOKEN, 'S3', 'The backend commonly brokers storage access and uploads.');
  }

  if (category === 'external') {
    const backend = pickAny(['backend']);
    const client = pickAny(['frontend', 'mobile']);

    if (backend) addConnection(backend.id, REVIEW_NEW_NODE_TOKEN, 'HTTPS', 'Most third-party integrations should sit behind the backend.');
    else if (client) addConnection(client.id, REVIEW_NEW_NODE_TOKEN, 'HTTPS', 'If there is no backend yet, this external integration is client-facing.');
  }

  if (category === 'devops') {
    const backend = pickAny(['backend']);
    const frontend = pickAny(['frontend']);

    if (backend) addConnection(REVIEW_NEW_NODE_TOKEN, backend.id, 'OBSERVE', 'Operational tooling should observe or manage the backend surface.');
    if (frontend) addConnection(REVIEW_NEW_NODE_TOKEN, frontend.id, 'DEPLOY', 'This layer may also cover delivery or monitoring for the frontend.');
  }

  return connections;
}

function sanitizeSuggestionConnections(connections, suggestionCategory, nodes, connectionRules) {
  const techNodes = (nodes || []).filter(node => node.type === 'customNode');
  const nodeById = new Map(techNodes.map(node => [node.id, node]));
  const ruleMap = buildSuggestionRuleMap(connectionRules);
  const hasBackendControlPlane = techNodes.some(node => node.data?.category === 'backend');

  return (connections || []).map(connection => {
    const sourceCategory = connection.source === REVIEW_NEW_NODE_TOKEN
      ? suggestionCategory
      : nodeById.get(connection.source)?.data?.category;
    const targetCategory = connection.target === REVIEW_NEW_NODE_TOKEN
      ? suggestionCategory
      : nodeById.get(connection.target)?.data?.category;

    if (!sourceCategory || !targetCategory) {
      return connection;
    }

    const signedStorageAccessPattern = getSuggestionProtocolFamily(connection.label) === 'signed-url'
      && (sourceCategory === 'frontend' || sourceCategory === 'mobile')
      && targetCategory === 'storage';
    const forwardInvalid = isInvalidSuggestionConnection(sourceCategory, targetCategory, ruleMap);

    if (!forwardInvalid || (signedStorageAccessPattern && hasBackendControlPlane)) {
      return connection;
    }

    if (signedStorageAccessPattern) {
      return null;
    }

    const reverseInvalid = isInvalidSuggestionConnection(targetCategory, sourceCategory, ruleMap);

    if (!reverseInvalid) {
      return {
        ...connection,
        source: connection.target,
        target: connection.source
      };
    }

    return null;
  }).filter(Boolean);
}

export function enrichSuggestionConnections(suggestion, nodes, edges, connectionRules) {
  const explicitConnections = Array.isArray(suggestion.connections) ? suggestion.connections : [];
  const sanitizedExplicitConnections = sanitizeSuggestionConnections(
    explicitConnections,
    suggestion.category,
    nodes,
    connectionRules
  );
  const fallbackConnections = sanitizeSuggestionConnections(
    buildFallbackSuggestionConnections(suggestion, nodes, edges),
    suggestion.category,
    nodes,
    connectionRules
  );
  const mergedConnections = [];
  const seen = new Set();

  [...sanitizedExplicitConnections, ...fallbackConnections].forEach(connection => {
    const signature = buildConnectionSignature(connection);

    if (seen.has(signature)) {
      return;
    }

    seen.add(signature);
    mergedConnections.push(connection);
  });

  return {
    ...suggestion,
    connections: mergedConnections
  };
}

export function formatStagedSuggestionNames(suggestions) {
  return suggestions
    .map(suggestion => suggestion.name)
    .filter(Boolean)
    .join(', ');
}

export function getCategoryLayoutOrder(nodesByCategory) {
  const extraCategories = Object.keys(nodesByCategory)
    .filter(category => !DEFAULT_CATEGORY_ORDER.includes(category))
    .sort((left, right) => left.localeCompare(right));

  return [...DEFAULT_CATEGORY_ORDER, ...extraCategories]
    .filter(category => (nodesByCategory[category] || []).length > 0);
}

function buildRankLookup(laneNodesByCategory) {
  const rankLookup = new Map();

  Object.values(laneNodesByCategory).forEach(nodesInLane => {
    nodesInLane.forEach((node, index) => {
      rankLookup.set(node.id, index);
    });
  });

  return rankLookup;
}

function sortNodesByConnectionGravity(nodesInLane, {
  relevantCategories,
  neighborIdsByNodeId,
  categoryByNodeId,
  rankLookup
}) {
  const previousIndexByNodeId = new Map(nodesInLane.map((node, index) => [node.id, index]));

  return [...nodesInLane]
    .map(node => {
      const neighborIds = [...(neighborIdsByNodeId.get(node.id) || [])];
      const scopedRanks = [];
      const fallbackRanks = [];
      let crossLaneConnections = 0;

      neighborIds.forEach(neighborId => {
        const rank = rankLookup.get(neighborId);

        if (rank !== undefined) {
          fallbackRanks.push(rank);
        }

        if (!relevantCategories.has(categoryByNodeId.get(neighborId))) {
          return;
        }

        crossLaneConnections += 1;

        if (rank !== undefined) {
          scopedRanks.push(rank);
        }
      });

      return {
        node,
        crossLaneConnections,
        totalConnections: neighborIds.length,
        gravity: average(scopedRanks) ?? average(fallbackRanks),
        previousIndex: previousIndexByNodeId.get(node.id) || 0
      };
    })
    .sort((left, right) => {
      const leftHasGravity = left.gravity !== null;
      const rightHasGravity = right.gravity !== null;

      if (leftHasGravity && rightHasGravity && left.gravity !== right.gravity) {
        return left.gravity - right.gravity;
      }

      if (leftHasGravity !== rightHasGravity) {
        return leftHasGravity ? -1 : 1;
      }

      if (right.crossLaneConnections !== left.crossLaneConnections) {
        return right.crossLaneConnections - left.crossLaneConnections;
      }

      if (right.totalConnections !== left.totalConnections) {
        return right.totalConnections - left.totalConnections;
      }

      if (left.previousIndex !== right.previousIndex) {
        return left.previousIndex - right.previousIndex;
      }

      return (left.node.data.label || '').localeCompare(right.node.data.label || '');
    })
    .map(item => item.node);
}

export function optimizeLaneNodeOrder(nodesByCategory, orderedCategories, neighborIdsByNodeId, categoryByNodeId) {
  const laneNodesByCategory = Object.fromEntries(
    orderedCategories.map(category => [
      category,
      [...nodesByCategory[category]].sort((left, right) => {
        const leftDegree = (neighborIdsByNodeId.get(left.id) || new Set()).size;
        const rightDegree = (neighborIdsByNodeId.get(right.id) || new Set()).size;

        if (rightDegree !== leftDegree) {
          return rightDegree - leftDegree;
        }

        return (left.data.label || '').localeCompare(right.data.label || '');
      })
    ])
  );

  for (let sweep = 0; sweep < 4; sweep += 1) {
    let rankLookup = buildRankLookup(laneNodesByCategory);

    orderedCategories.forEach((category, index) => {
      const relevantCategories = new Set(orderedCategories.slice(0, index));

      if (relevantCategories.size === 0) {
        return;
      }

      laneNodesByCategory[category] = sortNodesByConnectionGravity(laneNodesByCategory[category], {
        relevantCategories,
        neighborIdsByNodeId,
        categoryByNodeId,
        rankLookup
      });
    });

    rankLookup = buildRankLookup(laneNodesByCategory);

    [...orderedCategories].reverse().forEach((category, reverseIndex) => {
      const categoryIndex = orderedCategories.length - reverseIndex - 1;
      const relevantCategories = new Set(orderedCategories.slice(categoryIndex + 1));

      if (relevantCategories.size === 0) {
        return;
      }

      laneNodesByCategory[category] = sortNodesByConnectionGravity(laneNodesByCategory[category], {
        relevantCategories,
        neighborIdsByNodeId,
        categoryByNodeId,
        rankLookup
      });
    });
  }

  return laneNodesByCategory;
}

export function buildAutoLayoutResult(nodes, edges) {
  const techNodes = (nodes || []).filter(node => node.type === 'customNode');

  if (techNodes.length === 0) {
    return null;
  }

  const measuredNodeWidth = Math.max(
    AUTO_LAYOUT.nodeWidth,
    ...techNodes.map(node => node.width || node.measured?.width || AUTO_LAYOUT.nodeWidth)
  );
  const measuredNodeHeight = Math.max(
    AUTO_LAYOUT.nodeHeight,
    ...techNodes.map(node => node.height || node.measured?.height || AUTO_LAYOUT.nodeHeight)
  );

  const nodesByCategory = {};
  const categoryByNodeId = new Map();
  const techNodeIds = new Set(techNodes.map(node => node.id));
  const neighborIdsByNodeId = new Map(techNodes.map(node => [node.id, new Set()]));

  techNodes.forEach(node => {
    const category = node.data.category || 'backend';
    if (!nodesByCategory[category]) nodesByCategory[category] = [];
    nodesByCategory[category].push(node);
    categoryByNodeId.set(node.id, category);
  });

  (edges || []).forEach(edge => {
    if (!techNodeIds.has(edge.source) || !techNodeIds.has(edge.target) || edge.source === edge.target) {
      return;
    }

    neighborIdsByNodeId.get(edge.source)?.add(edge.target);
    neighborIdsByNodeId.get(edge.target)?.add(edge.source);
  });

  const orderedCategories = getCategoryLayoutOrder(nodesByCategory);
  const laneNodesByCategory = optimizeLaneNodeOrder(
    nodesByCategory,
    orderedCategories,
    neighborIdsByNodeId,
    categoryByNodeId
  );

  const laneConfigs = orderedCategories.map(category => {
    const nodesInCategory = laneNodesByCategory[category];
    const columnCount = Math.min(getBalancedColumnCount(nodesInCategory.length), nodesInCategory.length);
    const rowCount = Math.ceil(nodesInCategory.length / columnCount);
    const nodeBlockHeight = (rowCount * measuredNodeHeight) + ((rowCount - 1) * AUTO_LAYOUT.nodeGapY);

    return {
      category,
      nodesInCategory,
      columnCount,
      rowCount,
      nodeBlockHeight,
      zoneWidth:
        (columnCount * measuredNodeWidth) +
        ((columnCount - 1) * AUTO_LAYOUT.nodeGapX) +
        (AUTO_LAYOUT.zonePaddingX * 2)
    };
  });

  const maxNodeBlockHeight = Math.max(
    ...laneConfigs.map(config => config.nodeBlockHeight),
    measuredNodeHeight
  );
  const uniformZoneHeight =
    AUTO_LAYOUT.zonePaddingTop + maxNodeBlockHeight + AUTO_LAYOUT.zonePaddingBottom;

  const arrangedNodes = [];
  const zones = [];
  let cursorX = AUTO_LAYOUT.startX;

  laneConfigs.forEach(config => {
    const zoneX = cursorX;
    const zoneY = AUTO_LAYOUT.startY;
    const topOffset = (maxNodeBlockHeight - config.nodeBlockHeight) / 2;

    zones.push({
      id: `zone-${config.category}`,
      type: 'zoneNode',
      data: {
        label: config.category.toUpperCase(),
        count: config.nodesInCategory.length,
        columns: config.columnCount
      },
      position: { x: zoneX, y: zoneY },
      style: { width: config.zoneWidth, height: uniformZoneHeight, zIndex: -1 },
      draggable: false,
      selectable: false,
      connectable: false,
      focusable: false,
    });

    config.nodesInCategory.forEach((node, index) => {
      const columnIndex = index % config.columnCount;
      const rowIndex = Math.floor(index / config.columnCount);

      arrangedNodes.push({
        ...node,
        position: {
          x: zoneX + AUTO_LAYOUT.zonePaddingX + (columnIndex * (measuredNodeWidth + AUTO_LAYOUT.nodeGapX)),
          y:
            zoneY +
            AUTO_LAYOUT.zonePaddingTop +
            topOffset +
            (rowIndex * (measuredNodeHeight + AUTO_LAYOUT.nodeGapY))
        }
      });
    });

    cursorX += config.zoneWidth + AUTO_LAYOUT.zoneGapX;
  });

  return {
    arrangedNodes,
    zones,
    nodes: [...zones, ...arrangedNodes]
  };
}

export function isZoneNode(node) {
  return node?.type === 'zoneNode' || node?.id?.startsWith('zone-');
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function buildPersistedNodesPayload(nodes) {
  return nodes
    .filter(node => node.type === 'customNode')
    .map(node => ({
      id: node.id,
      name: node.data.label,
      category: node.data.category,
      role: node.data.role,
      reason: node.data.reason,
      icon: node.data.icon,
      products: node.data.products,
      position: node.position
    }));
}

export function buildPersistedEdgesPayload(edges) {
  return edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: 'step'
  }));
}

export function serializeDiagramSnapshot(name, nodesData, edgesData) {
  return JSON.stringify({
    name: name || 'Untitled diagram',
    nodes: nodesData,
    edges: edgesData
  });
}

export function buildAssistantDraftStorageKey(userId, diagramId) {
  if (!userId || !diagramId) {
    return null;
  }

  return `archflow:assistant-review:${userId}:${diagramId}`;
}
