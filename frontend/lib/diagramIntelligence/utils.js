import { formatTechDisplayLabel } from '@/lib/displayNames';
import { canonicalConnectionRuleObjects } from '../../../shared/connectionRules.js';

export const GENERIC_EDGE_LABELS = new Set(['CONNECTION', 'INFERRING...', 'API']);

export function normalizeTechLabel(value) {
  return (value || '').trim().toUpperCase();
}

export function getRuleKey(sourceCategory, targetCategory) {
  return `${sourceCategory || 'unknown'}->${targetCategory || 'unknown'}`;
}

export function buildRuleMap(connectionRules) {
  const effectiveRules = connectionRules && connectionRules.length > 0
    ? connectionRules
    : canonicalConnectionRuleObjects;

  return new Map(
    effectiveRules.map(rule => [
      getRuleKey(rule.source_category, rule.target_category),
      rule
    ])
  );
}

export function pushFinding(findings, finding) {
  findings.push({
    id: finding.id || `finding_${findings.length + 1}`,
    severity: finding.severity || 'warning',
    title: finding.title,
    detail: finding.detail,
    nodeIds: finding.nodeIds || [],
    edgeIds: finding.edgeIds || []
  });
}

export function getFallbackReason(category, label) {
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

export function normalizeProtocolLabel(value) {
  return (value || 'connection').trim();
}

export function getProtocolFamily(protocolLabel) {
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

export function getConnectionSummary(sourceNode, targetNode, protocolLabel, protocolFamily) {
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

export function getProtocolWhyChosen(sourceNode, targetNode, protocolLabel, protocolFamily) {
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
    return 'This connection is structurally useful, but the protocol label is still too generic to explain why the interaction works the way it does.';
  }

  return `${protocolLabel} gives this connection a named interaction pattern, which makes the architecture easier to inspect and discuss.`;
}

export function getConnectionAssumptions(sourceNode, targetNode, protocolFamily) {
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

export function isClientCategory(category) {
  return category === 'frontend' || category === 'mobile';
}

export function buildCategoryCounts(techNodes) {
  return techNodes.reduce((acc, node) => {
    const category = node.data.category || 'unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
}

export function buildDiagramComplexityScore(techNodes, edges, categoryCounts) {
  const bonusCategories = ['auth', 'storage', 'external', 'queue', 'devops']
    .reduce((sum, category) => sum + ((categoryCounts[category] || 0) > 0 ? 1 : 0), 0);

  return techNodes.length
    + Math.min((edges || []).length, 4)
    + bonusCategories
    + ((categoryCounts.backend || 0) >= 2 ? 1 : 0);
}

export function isSignedStorageAccessPattern({ sourceCategory, targetCategory, protocolFamily }) {
  return isClientCategory(sourceCategory)
    && targetCategory === 'storage'
    && protocolFamily === 'signed-url';
}
