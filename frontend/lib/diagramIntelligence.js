import { formatTechDisplayLabel } from '@/lib/displayNames';

const FALLBACK_CONNECTION_RULES = [
  { source_category: 'mobile', target_category: 'backend', is_valid: true, warning_message: null },
  { source_category: 'mobile', target_category: 'frontend', is_valid: true, warning_message: 'Mobile-to-frontend may indicate server-rendered content or a webview.' },
  { source_category: 'mobile', target_category: 'database', is_valid: false, warning_message: 'Mobile clients must never connect directly to the database.' },
  { source_category: 'mobile', target_category: 'queue', is_valid: false, warning_message: 'Mobile clients must never connect directly to a queue.' },
  { source_category: 'mobile', target_category: 'auth', is_valid: true, warning_message: 'Direct auth provider integration is valid, but verify the auth flow is intentional.' },
  { source_category: 'mobile', target_category: 'storage', is_valid: false, warning_message: 'Direct storage access from mobile needs a backend or signed upload flow.' },
  { source_category: 'mobile', target_category: 'external', is_valid: true, warning_message: 'Direct external integrations should be verified for security and resiliency.' },
  { source_category: 'mobile', target_category: 'devops', is_valid: false, warning_message: 'Mobile should not connect to devops infrastructure directly.' },
  { source_category: 'mobile', target_category: 'mobile', is_valid: false, warning_message: 'Peer-to-peer mobile connections are unusual in standard architectures.' },
  { source_category: 'frontend', target_category: 'backend', is_valid: true, warning_message: null },
  { source_category: 'frontend', target_category: 'mobile', is_valid: false, warning_message: 'Frontend should not connect to mobile clients directly.' },
  { source_category: 'frontend', target_category: 'database', is_valid: false, warning_message: 'Frontend must never connect directly to the database.' },
  { source_category: 'frontend', target_category: 'queue', is_valid: false, warning_message: 'Frontend must never connect directly to a queue.' },
  { source_category: 'frontend', target_category: 'auth', is_valid: true, warning_message: 'Direct auth provider integration is valid, but verify the auth flow is intentional.' },
  { source_category: 'frontend', target_category: 'storage', is_valid: false, warning_message: 'Direct storage access from frontend needs a backend or signed upload flow.' },
  { source_category: 'frontend', target_category: 'external', is_valid: true, warning_message: 'Direct external integrations should be verified for security and resiliency.' },
  { source_category: 'frontend', target_category: 'devops', is_valid: false, warning_message: 'Frontend should not connect to devops infrastructure directly.' },
  { source_category: 'frontend', target_category: 'frontend', is_valid: false, warning_message: 'Frontend-to-frontend connections are unusual in standard architectures.' },
  { source_category: 'backend', target_category: 'frontend', is_valid: true, warning_message: 'Backend-initiated connections to frontend (e.g., SSE, WebSocket) are valid.' },
  { source_category: 'backend', target_category: 'mobile', is_valid: true, warning_message: 'Backend-initiated push to mobile (e.g., WebSocket, push notifications) is valid.' },
  { source_category: 'backend', target_category: 'backend', is_valid: true, warning_message: 'Service-to-service links are valid, but protocol choice matters.' },
  { source_category: 'backend', target_category: 'database', is_valid: true, warning_message: null },
  { source_category: 'backend', target_category: 'queue', is_valid: true, warning_message: null },
  { source_category: 'backend', target_category: 'auth', is_valid: true, warning_message: null },
  { source_category: 'backend', target_category: 'storage', is_valid: true, warning_message: null },
  { source_category: 'backend', target_category: 'external', is_valid: true, warning_message: null },
  { source_category: 'backend', target_category: 'devops', is_valid: true, warning_message: 'Backend reporting to observability/monitoring is valid.' },
  { source_category: 'database', target_category: 'database', is_valid: true, warning_message: 'Database-to-database links are valid for replication or synchronization.' },
  { source_category: 'database', target_category: 'backend', is_valid: false, warning_message: 'Databases should not initiate application-layer connections.' },
  { source_category: 'database', target_category: 'frontend', is_valid: false, warning_message: 'Databases must never initiate connections to frontends.' },
  { source_category: 'database', target_category: 'mobile', is_valid: false, warning_message: 'Databases must never initiate connections to mobile clients.' },
  { source_category: 'database', target_category: 'queue', is_valid: false, warning_message: 'Databases should not push directly to queues; use a backend trigger.' },
  { source_category: 'database', target_category: 'auth', is_valid: false, warning_message: 'Databases should not initiate auth flows.' },
  { source_category: 'database', target_category: 'storage', is_valid: false, warning_message: 'Database-to-storage links should go through a backend.' },
  { source_category: 'database', target_category: 'external', is_valid: false, warning_message: 'Databases should not connect directly to external services.' },
  { source_category: 'database', target_category: 'devops', is_valid: true, warning_message: 'Database metrics reporting to devops/monitoring is valid.' },
  { source_category: 'queue', target_category: 'queue', is_valid: true, warning_message: 'Queue chaining is valid, but review whether the event topology is intentional.' },
  { source_category: 'queue', target_category: 'backend', is_valid: true, warning_message: 'Queue-to-backend data flow represents a consumer subscription pattern. Verify the worker or subscriber architecture is intentional.' },
  { source_category: 'queue', target_category: 'frontend', is_valid: false, warning_message: 'Queues must never initiate frontend connections.' },
  { source_category: 'queue', target_category: 'mobile', is_valid: false, warning_message: 'Queues must never initiate mobile connections.' },
  { source_category: 'queue', target_category: 'database', is_valid: false, warning_message: 'Queues should not write directly to databases; use a backend worker.' },
  { source_category: 'queue', target_category: 'auth', is_valid: false, warning_message: 'Queues should not initiate auth flows.' },
  { source_category: 'queue', target_category: 'storage', is_valid: false, warning_message: 'Queues should not write directly to storage; use a backend worker.' },
  { source_category: 'queue', target_category: 'external', is_valid: false, warning_message: 'Queues should not connect directly to external services.' },
  { source_category: 'queue', target_category: 'devops', is_valid: true, warning_message: 'Queue metrics reporting to devops/monitoring is valid.' },
  { source_category: 'auth', target_category: 'backend', is_valid: true, warning_message: 'Auth callbacks to backend for token verification are valid.' },
  { source_category: 'auth', target_category: 'frontend', is_valid: false, warning_message: 'Auth providers should not initiate frontend application flows.' },
  { source_category: 'auth', target_category: 'mobile', is_valid: false, warning_message: 'Auth providers should not initiate mobile application flows.' },
  { source_category: 'auth', target_category: 'database', is_valid: false, warning_message: 'Auth providers should not connect to databases directly.' },
  { source_category: 'auth', target_category: 'queue', is_valid: false, warning_message: 'Auth providers should not connect to queues directly.' },
  { source_category: 'auth', target_category: 'storage', is_valid: false, warning_message: 'Auth providers should not connect to storage directly.' },
  { source_category: 'auth', target_category: 'external', is_valid: false, warning_message: 'Auth providers should not connect to external services.' },
  { source_category: 'auth', target_category: 'devops', is_valid: true, warning_message: 'Auth metrics reporting to monitoring is valid.' },
  { source_category: 'auth', target_category: 'auth', is_valid: true, warning_message: 'Auth provider chaining (e.g., social login federation) is valid.' },
  { source_category: 'storage', target_category: 'backend', is_valid: true, warning_message: 'Storage callbacks or signed URLs for backend consumption are valid.' },
  { source_category: 'storage', target_category: 'frontend', is_valid: false, warning_message: 'Storage should not initiate frontend connections.' },
  { source_category: 'storage', target_category: 'mobile', is_valid: false, warning_message: 'Storage should not initiate mobile connections.' },
  { source_category: 'storage', target_category: 'database', is_valid: false, warning_message: 'Storage should not connect directly to databases.' },
  { source_category: 'storage', target_category: 'queue', is_valid: false, warning_message: 'Storage should not push directly to queues.' },
  { source_category: 'storage', target_category: 'auth', is_valid: false, warning_message: 'Storage should not initiate auth flows.' },
  { source_category: 'storage', target_category: 'external', is_valid: false, warning_message: 'Storage should not connect directly to external services.' },
  { source_category: 'storage', target_category: 'devops', is_valid: true, warning_message: 'Storage metrics reporting to monitoring is valid.' },
  { source_category: 'storage', target_category: 'storage', is_valid: true, warning_message: 'Storage replication between regions is valid.' },
  { source_category: 'external', target_category: 'backend', is_valid: true, warning_message: 'Webhook callbacks from external services to backend are valid.' },
  { source_category: 'external', target_category: 'frontend', is_valid: true, warning_message: 'Direct frontend-to-external traffic should be reviewed for security, latency, and resilience.' },
  { source_category: 'external', target_category: 'mobile', is_valid: true, warning_message: 'Direct mobile-to-external traffic should be reviewed for security.' },
  { source_category: 'external', target_category: 'database', is_valid: false, warning_message: 'External services should not connect to databases directly.' },
  { source_category: 'external', target_category: 'queue', is_valid: false, warning_message: 'External services should not connect to queues directly.' },
  { source_category: 'external', target_category: 'auth', is_valid: false, warning_message: 'External services should not initiate auth flows.' },
  { source_category: 'external', target_category: 'storage', is_valid: false, warning_message: 'External services should not connect to storage directly.' },
  { source_category: 'external', target_category: 'devops', is_valid: true, warning_message: 'External service metrics to monitoring is valid.' },
  { source_category: 'external', target_category: 'external', is_valid: true, warning_message: 'External-to-external chaining may represent service integrations.' },
  { source_category: 'devops', target_category: 'frontend', is_valid: true, warning_message: 'Devops monitoring of frontend health is valid.' },
  { source_category: 'devops', target_category: 'backend', is_valid: true, warning_message: 'Devops monitoring of backend health is valid.' },
  { source_category: 'devops', target_category: 'mobile', is_valid: true, warning_message: 'Devops monitoring of mobile health is valid.' },
  { source_category: 'devops', target_category: 'database', is_valid: true, warning_message: 'Devops monitoring of database health is valid.' },
  { source_category: 'devops', target_category: 'queue', is_valid: true, warning_message: 'Devops monitoring of queue health is valid.' },
  { source_category: 'devops', target_category: 'storage', is_valid: true, warning_message: 'Devops monitoring of storage health is valid.' },
  { source_category: 'devops', target_category: 'auth', is_valid: true, warning_message: 'Devops monitoring of auth health is valid.' },
  { source_category: 'devops', target_category: 'external', is_valid: true, warning_message: 'Devops monitoring of external integrations is valid.' },
  { source_category: 'devops', target_category: 'devops', is_valid: true, warning_message: 'Devops tool-to-tool connections (e.g., Prometheus -> Grafana) are valid.' }
];

const GENERIC_EDGE_LABELS = new Set(['CONNECTION', 'INFERRING...', 'API']);

export function normalizeTechLabel(value) {
  return (value || '').trim().toUpperCase();
}

function getRuleKey(sourceCategory, targetCategory) {
  return `${sourceCategory || 'unknown'}->${targetCategory || 'unknown'}`;
}

function buildRuleMap(connectionRules) {
  const effectiveRules = connectionRules && connectionRules.length > 0
    ? connectionRules
    : FALLBACK_CONNECTION_RULES;

  return new Map(
    effectiveRules.map(rule => [
      getRuleKey(rule.source_category, rule.target_category),
      rule
    ])
  );
}

function pushFinding(findings, finding) {
  findings.push({
    id: finding.id || `finding_${findings.length + 1}`,
    severity: finding.severity || 'warning',
    title: finding.title,
    detail: finding.detail,
    nodeIds: finding.nodeIds || [],
    edgeIds: finding.edgeIds || []
  });
}

function getFallbackReason(category, label) {
  const displayLabel = formatTechDisplayLabel(label, category);

  if (category === 'frontend') return `${displayLabel} anchors the end-user interaction layer and keeps presentation concerns separated from core services.`;
  if (category === 'mobile') return `${displayLabel} acts as the client delivery surface for mobile workflows and user journeys.`;
  if (category === 'backend') return `${displayLabel} owns application logic, orchestration, and secure integration points.`;
  if (category === 'database') return `${displayLabel} persists application state and supports the main operational data path.`;
  if (category === 'queue') return `${displayLabel} absorbs async load and decouples producers from downstream processing.`;
  if (category === 'auth') return `${displayLabel} centralizes identity, session, and permission management.`;
  if (category === 'storage') return `${displayLabel} manages binary assets and unstructured data outside the transactional plane.`;
  if (category === 'devops') return `${displayLabel} supports delivery, observability, and runtime reliability.`;
  return `${displayLabel} fills a focused role within the architecture.`;
}

function normalizeProtocolLabel(value) {
  return (value || 'connection').trim();
}

function getProtocolFamily(protocolLabel) {
  const protocol = normalizeTechLabel(protocolLabel);

  if (!protocol || GENERIC_EDGE_LABELS.has(protocol)) return 'generic';
  if (protocol.includes('WEBSOCKET') || protocol.includes('SOCKET')) return 'realtime';
  if (protocol.includes('GRPC')) return 'rpc';
  if (protocol.includes('GRAPHQL')) return 'graphql';
  if (protocol.includes('KAFKA') || protocol.includes('AMQP') || protocol.includes('QUEUE') || protocol.includes('SQS') || protocol.includes('EVENT')) return 'async';
  if (protocol.includes('OIDC') || protocol.includes('OAUTH') || protocol.includes('SAML')) return 'identity';
  if (protocol.includes('SIGNED URL') || protocol.includes('SIGNED_URL')) return 'signed-url';
  if (protocol.includes('REST') || protocol.includes('HTTP') || protocol.includes('HTTPS') || protocol.includes('API')) return 'request-response';
  return 'specific';
}

function getConnectionSummary(sourceNode, targetNode, protocolLabel, protocolFamily) {
  const sourceLabel = sourceNode
    ? formatTechDisplayLabel(sourceNode.data?.label, sourceNode.data?.category)
    : 'This unit';
  const targetLabel = targetNode
    ? formatTechDisplayLabel(targetNode.data?.label, targetNode.data?.category)
    : 'the downstream unit';

  if (protocolFamily === 'async') {
    return `${sourceLabel} pushes work toward ${targetLabel} asynchronously, so the system can decouple producers from downstream processing.`;
  }

  if (protocolFamily === 'realtime') {
    return `${sourceLabel} maintains a low-latency realtime path into ${targetLabel}, which is useful for live updates, presence, or interactive collaboration.`;
  }

  if (protocolFamily === 'identity') {
    return `${sourceLabel} relies on ${targetLabel} for identity and session handshakes through ${protocolLabel}.`;
  }

  if (protocolFamily === 'graphql') {
    return `${sourceLabel} queries ${targetLabel} through ${protocolLabel}, which can reduce over-fetching when the client needs flexible shapes of data.`;
  }

  if (protocolFamily === 'rpc') {
    return `${sourceLabel} calls ${targetLabel} over ${protocolLabel}, which usually points to an internal, contract-driven service interaction.`;
  }

  if (protocolFamily === 'signed-url') {
    return `${sourceLabel} uses ${protocolLabel} to reach ${targetLabel} while keeping direct access scoped and time-bound.`;
  }

  if (protocolFamily === 'generic') {
    return `${sourceLabel} is connected to ${targetLabel}, but the exact interaction pattern still needs clarification before users can trust the flow fully.`;
  }

  return `${sourceLabel} communicates with ${targetLabel} over ${protocolLabel}, forming part of the core system data path.`;
}

function getProtocolWhyChosen(sourceNode, targetNode, protocolLabel, protocolFamily) {
  const sourceCategory = sourceNode?.data?.category || 'unknown';
  const targetCategory = targetNode?.data?.category || 'unknown';

  if (protocolFamily === 'request-response') {
    return `${protocolLabel} fits a direct request and response loop between the ${sourceCategory} and ${targetCategory} layers, keeping the interaction explicit and easy to reason about.`;
  }

  if (protocolFamily === 'rpc') {
    return `${protocolLabel} suggests a more tightly defined service contract, which is often a good fit when backend systems need efficient internal communication.`;
  }

  if (protocolFamily === 'graphql') {
    return `${protocolLabel} helps when the calling layer benefits from asking for a shaped response instead of receiving a fixed payload every time.`;
  }

  if (protocolFamily === 'realtime') {
    return `${protocolLabel} is appropriate when this path needs server-pushed events, bidirectional updates, or lower-latency coordination than plain polling.`;
  }

  if (protocolFamily === 'async') {
    return `${protocolLabel} creates separation between producers and consumers, which usually improves resilience for bursty or background workloads.`;
  }

  if (protocolFamily === 'identity') {
    return `${protocolLabel} is a strong fit for identity handoffs because it standardizes token exchange, session establishment, or delegated authorization.`;
  }

  if (protocolFamily === 'signed-url') {
    return `${protocolLabel} is useful when the client needs limited direct access to storage without exposing permanent credentials or broad write permissions.`;
  }

  if (protocolFamily === 'generic') {
    return `This connection is structurally useful, but the protocol label is still too generic to explain why the interaction works the way it does.`;
  }

  return `${protocolLabel} gives this connection a named interaction pattern, which makes the architecture easier to inspect and discuss.`;
}

function getConnectionAssumptions(sourceNode, targetNode, protocolFamily) {
  const assumptions = [];
  const sourceCategory = sourceNode?.data?.category;
  const targetCategory = targetNode?.data?.category;

  if (protocolFamily === 'request-response' || protocolFamily === 'rpc' || protocolFamily === 'graphql') {
    assumptions.push('This path can tolerate synchronous dependency latency during normal user flows.');
  }

  if (protocolFamily === 'async') {
    assumptions.push('The workload benefits from decoupled processing more than from immediate end-to-end consistency.');
  }

  if (protocolFamily === 'realtime') {
    assumptions.push('The product experience justifies the operational complexity of maintaining persistent live connections.');
  }

  if (protocolFamily === 'identity') {
    assumptions.push('The auth boundary, callback flow, and token lifecycle are intentionally designed around this trust relationship.');
  }

  if ((sourceCategory === 'frontend' || sourceCategory === 'mobile') && targetCategory === 'backend') {
    assumptions.push('The backend remains the secure control plane for data access, business rules, and downstream orchestration.');
  }

  return assumptions;
}

function isClientCategory(category) {
  return category === 'frontend' || category === 'mobile';
}

function buildCategoryCounts(techNodes) {
  return techNodes.reduce((acc, node) => {
    const category = node.data.category || 'unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
}

function buildDiagramComplexityScore(techNodes, edges, categoryCounts) {
  const bonusCategories = ['auth', 'storage', 'external', 'queue', 'devops']
    .reduce((sum, category) => sum + ((categoryCounts[category] || 0) > 0 ? 1 : 0), 0);

  return techNodes.length
    + Math.min((edges || []).length, 4)
    + bonusCategories
    + ((categoryCounts.backend || 0) >= 2 ? 1 : 0);
}

function isSignedStorageAccessPattern({ sourceCategory, targetCategory, protocolFamily }) {
  return isClientCategory(sourceCategory)
    && targetCategory === 'storage'
    && protocolFamily === 'signed-url';
}

export function getReplacementCandidates(inventory, category, currentLabel) {
  if (!category) {
    return [];
  }

  const currentName = normalizeTechLabel(currentLabel);
  const builtInItems = inventory?.builtIn?.[category] || [];
  const communityItems = (inventory?.community || []).filter(item => item.category === category);
  const deduped = new Map();

  [...builtInItems, ...communityItems].forEach(item => {
    const normalizedName = normalizeTechLabel(item.name);

    if (!normalizedName || normalizedName === currentName || deduped.has(normalizedName)) {
      return;
    }

    deduped.set(normalizedName, {
      ...item,
      source: builtInItems.includes(item) ? 'BUILT_IN' : 'COMMUNITY'
    });
  });

  return [...deduped.values()].slice(0, 8);
}

export function buildVersionDiff(currentNodes, currentEdges, versionNodes, versionEdges) {
  const currentNodeSet = new Set((currentNodes || []).map(node => `${normalizeTechLabel(node.data?.label || node.name)}::${node.data?.category || node.category || 'unknown'}`));
  const versionNodeSet = new Set((versionNodes || []).map(node => `${normalizeTechLabel(node.name || node.data?.label)}::${node.category || node.data?.category || 'unknown'}`));

  const currentEdgeSet = new Set((currentEdges || []).map(edge => `${edge.source}->${edge.target}::${normalizeTechLabel(edge.label)}`));
  const versionEdgeSet = new Set((versionEdges || []).map(edge => `${edge.source}->${edge.target}::${normalizeTechLabel(edge.label)}`));

  let addedNodes = 0;
  let removedNodes = 0;
  let addedEdges = 0;
  let removedEdges = 0;

  versionNodeSet.forEach(signature => {
    if (!currentNodeSet.has(signature)) addedNodes += 1;
  });

  currentNodeSet.forEach(signature => {
    if (!versionNodeSet.has(signature)) removedNodes += 1;
  });

  versionEdgeSet.forEach(signature => {
    if (!currentEdgeSet.has(signature)) addedEdges += 1;
  });

  currentEdgeSet.forEach(signature => {
    if (!versionEdgeSet.has(signature)) removedEdges += 1;
  });

  return {
    addedNodes,
    removedNodes,
    addedEdges,
    removedEdges
  };
}

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
  const categories = new Map();
  const categoryCounts = buildCategoryCounts(techNodes);
  const complexityScore = buildDiagramComplexityScore(techNodes, edges, categoryCounts);

  techNodes.forEach(node => {
    categories.set(node.id, node.data.category || 'unknown');
  });

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
  const hasFileUploadExternal = techNodes.some(n =>
    ['SENDGRID', 'TWILIO', 'S3', 'CLOUDFLARE_R2'].includes(n.data.label)
  );
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

export function buildNodeTrustProfile(selectedNode, reviewFindings) {
  if (!selectedNode) {
    return null;
  }

  const nodeFindings = (reviewFindings || []).filter(finding => finding.nodeIds.includes(selectedNode.id));
  const groupedFindings = new Map();

  nodeFindings.forEach(finding => {
    const signature = `${finding.severity}:${finding.detail}`;
    const existing = groupedFindings.get(signature);

    if (existing) {
      existing.count += 1;
      return;
    }

    groupedFindings.set(signature, {
      severity: finding.severity,
      detail: finding.detail,
      count: 1
    });
  });

  const uniqueNodeFindings = [...groupedFindings.values()];
  const criticalCount = uniqueNodeFindings.filter(finding => finding.severity === 'critical').length;
  const warningCount = uniqueNodeFindings.filter(finding => finding.severity === 'warning').length;
  const infoCount = uniqueNodeFindings.filter(finding => finding.severity === 'info').length;

  let confidenceScore = selectedNode.data.reason ? 0.84 : 0.66;
  confidenceScore -= criticalCount * 0.22;
  confidenceScore -= warningCount * 0.11;
  confidenceScore -= infoCount * 0.04;
  confidenceScore = Math.max(0.18, Math.min(0.95, confidenceScore));

  let confidence = 'LOW';
  if (confidenceScore >= 0.8) confidence = 'HIGH';
  else if (confidenceScore >= 0.6) confidence = 'MEDIUM';

  const confidenceLabel = confidence === 'HIGH'
    ? 'SOLID'
    : confidence === 'MEDIUM'
      ? 'CHECK'
      : 'RISK';

  const assumptions = [];
  const category = selectedNode.data.category;

  if (category === 'frontend' || category === 'mobile') {
    assumptions.push('A secure application layer exists to enforce business logic and protect data access.');
  }
  if (category === 'backend') {
    assumptions.push('This service owns core orchestration and can safely mediate downstream systems.');
  }
  if (category === 'database') {
    assumptions.push('This datastore is appropriate for the system’s write/read pattern and operational scale.');
  }
  if (category === 'queue') {
    assumptions.push('Async workloads justify the added complexity of decoupled processing.');
  }
  if (category === 'storage') {
    assumptions.push('Unstructured assets should live outside the transactional data path.');
  }

  const risks = uniqueNodeFindings.map(finding =>
    finding.count > 1
      ? `${finding.detail} (appears on ${finding.count} connections)`
      : finding.detail
  );

  return {
    confidence,
    confidenceLabel,
    confidenceScore,
    whyChosen: selectedNode.data.reason || getFallbackReason(category, selectedNode.data.label),
    assumptions,
    risks
  };
}

export function buildArchitectureScore(findings, nodes, edges) {
  const techNodes = (nodes || []).filter(n => n.type === 'customNode');
  const categoryCounts = buildCategoryCounts(techNodes);
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;
  const infoCount = findings.filter(f => f.severity === 'info').length;
  const signalCount = findings.filter(f => f.severity === 'info' && f.title !== 'REVIEW_EDGE_PATTERN').length;

  let score = 100;
  const deductions = {
    critical: criticalCount * 15,
    warning: warningCount * 8,
    info: signalCount * 2
  };
  score -= deductions.critical;
  score -= deductions.warning;
  score -= deductions.info;

  const hasBackend = categoryCounts.backend > 0;
  const hasDatabase = categoryCounts.database > 0;
  const hasAuth = categoryCounts.auth > 0;
  const hasCache = techNodes.some(n => normalizeTechLabel(n.data.label) === 'REDIS');
  const hasQueue = categoryCounts.queue > 0;
  const hasStorage = categoryCounts.storage > 0;
  const hasObservability = categoryCounts.devops > 0;

  const bonuses = {};
  if (hasBackend && hasDatabase) { score += 2; bonuses.backendDb = 2; }
  if (hasAuth) { score += 2; bonuses.auth = 2; }
  if (hasCache) { score += 3; bonuses.cache = 3; }
  if (hasQueue) { score += 3; bonuses.queue = 3; }
  if (hasStorage) { score += 2; bonuses.storage = 2; }
  if (hasObservability) { score += 3; bonuses.observability = 3; }

  if (techNodes.length === 0) score = 0;
  if (techNodes.length === 1 && edges.length === 0) score = 10;

  score = Math.max(0, Math.min(100, score));

  let grade = 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 35) grade = 'D';

  const categoryCoverage = Object.keys(categoryCounts).length;
  const allCategories = ['mobile', 'frontend', 'backend', 'database', 'queue', 'auth', 'storage', 'external', 'devops'];
  const relevantMax = allCategories.filter(cat => {
    if (categoryCounts[cat]) return true;
    if (cat === 'auth' && (categoryCounts.frontend || categoryCounts.mobile)) return true;
    if (cat === 'storage' && (categoryCounts.frontend || categoryCounts.mobile)) return true;
    if (cat === 'devops' && techNodes.length >= 5) return true;
    if (cat === 'queue' && (categoryCounts.backend || 0) >= 2) return true;
    return false;
  }).length;
  const coveragePct = Math.round((categoryCoverage / Math.max(relevantMax, 1)) * 100);

  return { score, grade, criticalCount, warningCount, infoCount, categoryCoverage, coveragePct, breakdown: { deductions, bonuses } };
}

export function buildConnectionTrustProfile(selectedEdge, nodes, reviewFindings) {
  if (!selectedEdge) {
    return null;
  }

  const techNodes = (nodes || []).filter(node => node.type === 'customNode');
  const nodeById = new Map(techNodes.map(node => [node.id, node]));
  const sourceNode = nodeById.get(selectedEdge.source);
  const targetNode = nodeById.get(selectedEdge.target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const edgeFindings = (reviewFindings || []).filter(finding => finding.edgeIds.includes(selectedEdge.id));
  const protocolLabel = normalizeProtocolLabel(selectedEdge.label);
  const protocolFamily = getProtocolFamily(protocolLabel);

  let confidenceScore = protocolFamily === 'generic' ? 0.56 : 0.82;
  edgeFindings.forEach(finding => {
    if (finding.severity === 'critical') confidenceScore -= 0.24;
    if (finding.severity === 'warning') confidenceScore -= 0.12;
    if (finding.severity === 'info') confidenceScore -= 0.05;
  });
  confidenceScore = Math.max(0.18, Math.min(0.95, confidenceScore));

  let confidence = 'LOW';
  if (confidenceScore >= 0.8) confidence = 'HIGH';
  else if (confidenceScore >= 0.6) confidence = 'MEDIUM';

  const confidenceLabel = confidence === 'HIGH'
    ? 'SOLID'
    : confidence === 'MEDIUM'
      ? 'CHECK'
      : 'RISK';

  return {
    confidence,
    confidenceLabel,
    confidenceScore,
    protocolLabel,
    sourceLabel: formatTechDisplayLabel(sourceNode.data.label, sourceNode.data.category),
    sourceCategory: sourceNode.data.category,
    targetLabel: formatTechDisplayLabel(targetNode.data.label, targetNode.data.category),
    targetCategory: targetNode.data.category,
    summary: getConnectionSummary(sourceNode, targetNode, protocolLabel, protocolFamily),
    whyChosen: getProtocolWhyChosen(sourceNode, targetNode, protocolLabel, protocolFamily),
    assumptions: getConnectionAssumptions(sourceNode, targetNode, protocolFamily),
    risks: edgeFindings.map(finding => finding.detail)
  };
}
