import {
  addNormalizedEdge,
  addNormalizedNode,
  hasNodeNamed
} from './hardenerConnections.js';
import { fixNodeIcon } from './hardenerCatalog.js';
import { normalizeIdentifier } from './hardenerIdentifiers.js';

const AUTONOMOUS_WAREHOUSE_MATCHER = /\b(autonomous warehouse|fulfillment centers?|warehouse robots?|robotic task scheduling|cold-chain|package sorting|barcode scanning|supply-chain platform)\b/i;

const GENERIC_RUNTIME_NAMES = new Set([
  'EXPRESS',
  'FASTAPI',
  'NESTJS',
  'DJANGO',
  'SPRING_BOOT',
  'GO',
  'NODE_JS',
  'PYTHON',
  'JAVA',
  'SCALA',
  'ERLANG',
  'PHP',
  'FLASK',
  'GIN',
  'RUST'
]);

const GENERIC_RUNTIME_ROLES = /\b(core service|business logic|api service|worker service|realtime service)\b/i;

const COMMON_RELATIONSHIPS = [
  ['CLOUDFLARE', 'API_GATEWAY', 'HTTPS'],
  ['ARGOCD', 'KUBERNETES', 'HTTPS'],
  ['API_GATEWAY', 'KEYCLOAK', 'OIDC'],
  ['API_GATEWAY', 'CLERK', 'OIDC'],
  ['API_GATEWAY', 'VAULT', 'HTTPS'],
  ['AUDIT_LOG_SERVICE', 'AUDIT_ARCHIVE', 'S3'],
  ['BILLING_SERVICE', 'STRIPE', 'HTTPS'],
  ['PAYMENT_SERVICE', 'STRIPE', 'HTTPS'],
  ['NOTIFICATION_SERVICE', 'TWILIO', 'HTTPS'],
  ['ANALYTICS_PIPELINE', 'CLICKHOUSE', 'SQL'],
  ['TELEMETRY_INGESTION_SERVICE', 'KAFKA', 'KAFKA'],
  ['KAFKA', 'ANALYTICS_PIPELINE', 'KAFKA'],
  ['KAFKA', 'NOTIFICATION_SERVICE', 'KAFKA'],
  ['KAFKA', 'AUDIT_LOG_SERVICE', 'KAFKA'],
  ['KAFKA', 'DEAD_LETTER_QUEUE', 'KAFKA'],
  ['DEAD_LETTER_QUEUE', 'RESILIENCE_CONTROL', 'KAFKA'],
  ['PROMETHEUS', 'GRAFANA', 'HTTP'],
  ['KUBERNETES', 'PROMETHEUS', 'HTTP']
];

const WAREHOUSE_RELATIONSHIPS = [
  ['OPERATOR_DASHBOARD', 'API_GATEWAY', 'HTTPS'],
  ['HANDHELD_SCANNERS', 'EDGE_COMMAND_BUFFER', 'HTTPS'],
  ['WAREHOUSE_ROBOT_FLEET', 'EDGE_COMMAND_BUFFER', 'MQTT'],
  ['EDGE_COMMAND_BUFFER', 'TELEMETRY_INGESTION_SERVICE', 'MQTT'],
  ['COMMAND_AUTHORIZATION_SERVICE', 'EDGE_COMMAND_BUFFER', 'gRPC'],
  ['EDGE_COMMAND_BUFFER', 'WAREHOUSE_ROBOT_FLEET', 'MQTT'],
  ['API_GATEWAY', 'ORDER_SERVICE', 'HTTP'],
  ['API_GATEWAY', 'RETURNS_SERVICE', 'HTTP'],
  ['API_GATEWAY', 'BILLING_SERVICE', 'HTTP'],
  ['API_GATEWAY', 'INVENTORY_SERVICE', 'HTTP'],
  ['API_GATEWAY', 'SHIPMENT_TRACKING_SERVICE', 'HTTP'],
  ['ORDER_SERVICE', 'ORDER_ALLOCATION_SERVICE', 'gRPC'],
  ['ORDER_ALLOCATION_SERVICE', 'INVENTORY_SERVICE', 'gRPC'],
  ['INVENTORY_SERVICE', 'ROBOTIC_TASK_SCHEDULING_SERVICE', 'gRPC'],
  ['ROBOTIC_TASK_SCHEDULING_SERVICE', 'ROUTE_OPTIMIZATION_SERVICE', 'gRPC'],
  ['ROBOTIC_TASK_SCHEDULING_SERVICE', 'COMMAND_AUTHORIZATION_SERVICE', 'gRPC'],
  ['HANDHELD_SCANNERS', 'BARCODE_SCANNING_SERVICE', 'HTTPS'],
  ['BARCODE_SCANNING_SERVICE', 'INVENTORY_SERVICE', 'gRPC'],
  ['BARCODE_SCANNING_SERVICE', 'PACKAGE_SORTING_SERVICE', 'gRPC'],
  ['PACKAGE_SORTING_SERVICE', 'SHIPMENT_TRACKING_SERVICE', 'gRPC'],
  ['SHIPMENT_TRACKING_SERVICE', 'NOTIFICATION_SERVICE', 'gRPC'],
  ['RETURNS_SERVICE', 'INVENTORY_SERVICE', 'gRPC'],
  ['SUPPLIER_NETWORK', 'INVENTORY_SERVICE', 'WEBHOOK'],
  ['BILLING_SERVICE', 'FRAUD_ENGINE', 'gRPC'],
  ['BILLING_SERVICE', 'STRIPE', 'HTTPS'],
  ['ORDER_SERVICE', 'POSTGRESQL', 'SQL'],
  ['INVENTORY_SERVICE', 'POSTGRESQL', 'SQL'],
  ['INVENTORY_SERVICE', 'REDIS', 'TCP'],
  ['EDGE_COMMAND_BUFFER', 'REDIS', 'TCP'],
  ['ROUTE_OPTIMIZATION_SERVICE', 'REDIS', 'TCP'],
  ['TELEMETRY_INGESTION_SERVICE', 'TIMESCALEDB', 'SQL'],
  ['COLD_CHAIN_MONITORING_SERVICE', 'TIMESCALEDB', 'SQL'],
  ['PREDICTIVE_MAINTENANCE_SERVICE', 'TIMESCALEDB', 'SQL'],
  ['ANALYTICS_PIPELINE', 'TIMESCALEDB', 'SQL'],
  ['KAFKA', 'COLD_CHAIN_MONITORING_SERVICE', 'KAFKA'],
  ['KAFKA', 'PREDICTIVE_MAINTENANCE_SERVICE', 'KAFKA'],
  ['KAFKA', 'SHIPMENT_TRACKING_SERVICE', 'KAFKA'],
  ['ORDER_SERVICE', 'KAFKA', 'KAFKA'],
  ['INVENTORY_SERVICE', 'KAFKA', 'KAFKA'],
  ['SHIPMENT_TRACKING_SERVICE', 'KAFKA', 'KAFKA'],
  ['COMMAND_AUTHORIZATION_SERVICE', 'VAULT', 'HTTPS']
];

const WAREHOUSE_GATEWAY_TARGETS = new Set([
  'ANALYTICS_PIPELINE',
  'AUDIT_LOG_SERVICE',
  'BARCODE_SCANNING_SERVICE',
  'COLD_CHAIN_MONITORING_SERVICE',
  'COMMAND_AUTHORIZATION_SERVICE',
  'DEAD_LETTER_QUEUE',
  'FRAUD_ENGINE',
  'KAFKA',
  'NOTIFICATION_SERVICE',
  'ORDER_ALLOCATION_SERVICE',
  'PACKAGE_SORTING_SERVICE',
  'PREDICTIVE_MAINTENANCE_SERVICE',
  'REALTIME_GATEWAY',
  'RESILIENCE_CONTROL',
  'ROBOTIC_TASK_SCHEDULING_SERVICE',
  'ROUTE_OPTIMIZATION_SERVICE',
  'TELEMETRY_INGESTION_SERVICE'
]);

const WORKFLOW_HINTS = [
  ['edge', /(OPERATOR_DASHBOARD|HANDHELD_SCANNERS|WAREHOUSE_ROBOT_FLEET|EDGE_COMMAND_BUFFER|COMMAND_AUTHORIZATION)/],
  ['fulfillment', /(ORDER|ALLOCATION|INVENTORY|BARCODE|PACKAGE_SORTING|ROBOTIC_TASK|ROUTE_OPTIMIZATION|SHIPMENT|RETURNS|SUPPLIER)/],
  ['telemetry', /(TELEMETRY|COLD_CHAIN|PREDICTIVE_MAINTENANCE|ANALYTICS)/],
  ['finance', /(BILLING|PAYMENT|FRAUD|STRIPE)/],
  ['assurance', /(AUDIT|NOTIFICATION|RESILIENCE|DEAD_LETTER)/],
  ['platform', /(API_GATEWAY|AUTH|CLERK|KEYCLOAK|REDIS|POSTGRESQL|TIMESCALEDB|CLICKHOUSE|KAFKA|S3|VAULT|KUBERNETES|CLOUDFLARE|ARGOCD|PROMETHEUS|GRAFANA|NGINX)/]
];

function replaceNode(nodes, edges, fromName, replacement, changes) {
  const normalizedFrom = normalizeIdentifier(fromName);
  const normalizedTo = normalizeIdentifier(replacement.name);
  const existing = nodes.find(node => node.name === normalizedFrom);

  if (!existing) {
    return addNormalizedNode(
      nodes,
      normalizedTo,
      replacement.category,
      replacement.role,
      replacement.reason,
      replacement.icon,
      changes
    );
  }

  const duplicate = nodes.find(node => node.name === normalizedTo && node !== existing);
  if (duplicate) {
    edges.forEach(edge => {
      if (edge.source === normalizedFrom) edge.source = normalizedTo;
      if (edge.target === normalizedFrom) edge.target = normalizedTo;
    });
    nodes.splice(nodes.indexOf(existing), 1);
    return duplicate;
  }

  edges.forEach(edge => {
    if (edge.source === normalizedFrom) edge.source = normalizedTo;
    if (edge.target === normalizedFrom) edge.target = normalizedTo;
  });
  existing.name = normalizedTo;
  existing.category = replacement.category;
  existing.role = replacement.role;
  existing.reason = replacement.reason;
  existing.icon = fixNodeIcon(normalizedTo) || replacement.icon || existing.icon;
  changes.push(`Workflow tuned: modeled ${normalizedTo} as ${replacement.category}`);
  return existing;
}

function removeNode(nodes, edges, name, changes) {
  const normalizedName = normalizeIdentifier(name);
  const index = nodes.findIndex(node => node.name === normalizedName);

  if (index === -1) {
    return;
  }

  nodes.splice(index, 1);
  edges.splice(
    0,
    edges.length,
    ...edges.filter(edge => edge.source !== normalizedName && edge.target !== normalizedName)
  );
  changes.push(`Workflow tuned: removed redundant ${normalizedName}`);
}

function removeEdges(edges, predicate) {
  edges.splice(0, edges.length, ...edges.filter(edge => !predicate(edge)));
}

function addRelationships(edges, nodes, relationships, changes) {
  relationships.forEach(([source, target, label]) => {
    if (hasNodeNamed(nodes, source) && hasNodeNamed(nodes, target)) {
      addNormalizedEdge(
        edges,
        nodes,
        source,
        target,
        label,
        changes,
        `Workflow tuned: ${source} -> ${target}`
      );
    }
  });
}

function pruneGenericRuntime(nodes, edges, changes) {
  if (!hasNodeNamed(nodes, 'API_GATEWAY')) {
    return;
  }

  [...nodes].forEach(node => {
    if (
      GENERIC_RUNTIME_NAMES.has(node.name) &&
      GENERIC_RUNTIME_ROLES.test(`${node.role || ''} ${node.reason || ''}`)
    ) {
      removeNode(nodes, edges, node.name, changes);
    }
  });
}

function normalizeInfrastructure(nodes, edges, context, changes) {
  const description = String(context.description || '');

  if (
    hasNodeNamed(nodes, 'CLOUDFLARE') &&
    hasNodeNamed(nodes, 'API_GATEWAY') &&
    hasNodeNamed(nodes, 'NGINX') &&
    !/\bnginx\b/i.test(description)
  ) {
    removeNode(nodes, edges, 'NGINX', changes);
  }

  removeEdges(edges, edge => (
    (edge.source === 'API_GATEWAY' && ['ARGOCD', 'CLOUDFLARE', 'KUBERNETES'].includes(edge.target)) ||
    (edge.source === 'API_GATEWAY' && edge.target === 'VAULT') ||
    (edge.source === 'ARGOCD' && edge.target === 'CLOUDFLARE') ||
    (edge.source === 'KUBERNETES' && edge.target === 'CLOUDFLARE')
  ));

  addRelationships(edges, nodes, COMMON_RELATIONSHIPS, changes);
}

function applyWarehouseModel(nodes, edges, changes) {
  replaceNode(nodes, edges, 'REACT', {
    name: 'OPERATOR_DASHBOARD',
    category: 'frontend',
    role: 'Warehouse operator dashboard',
    reason: 'Human oversight and exception handling',
    icon: 'layout-dashboard'
  }, changes);
  replaceNode(nodes, edges, 'KOTLIN', {
    name: 'HANDHELD_SCANNERS',
    category: 'mobile',
    role: 'Handheld worker devices',
    reason: 'Barcode scans and floor workflows',
    icon: 'scan-line'
  }, changes);
  replaceNode(nodes, edges, 'HANDHELD_WORKER_DEVICES_SERVICE', {
    name: 'HANDHELD_SCANNERS',
    category: 'mobile',
    role: 'Handheld worker devices',
    reason: 'Barcode scans and floor workflows',
    icon: 'scan-line'
  }, changes);
  replaceNode(nodes, edges, 'WAREHOUSE_ROBOTS_SERVICE', {
    name: 'WAREHOUSE_ROBOT_FLEET',
    category: 'mobile',
    role: 'Autonomous warehouse robots',
    reason: 'Executes physical movement commands',
    icon: 'bot'
  }, changes);
  replaceNode(nodes, edges, 'SUPPLIER_INTEGRATIONS_SERVICE', {
    name: 'SUPPLIER_NETWORK',
    category: 'external',
    role: 'Supplier integration network',
    reason: 'Inbound inventory and shipment updates',
    icon: 'plug-zap'
  }, changes);

  addNormalizedNode(
    nodes,
    'EDGE_COMMAND_BUFFER',
    'backend',
    'Offline edge command buffer',
    'Store-and-forward during connectivity loss',
    'database-backup',
    changes
  );
  addNormalizedNode(
    nodes,
    'TIMESCALEDB',
    'database',
    'Warehouse telemetry store',
    'Time-series device and sensor history',
    'database',
    changes
  );
  addNormalizedNode(
    nodes,
    'WAREHOUSE_ROBOT_FLEET',
    'mobile',
    'Autonomous warehouse robots',
    'Executes physical movement commands',
    'bot',
    changes
  );

  removeEdges(edges, edge => (
    (edge.source === 'API_GATEWAY' && (
      WAREHOUSE_GATEWAY_TARGETS.has(edge.target) ||
      ['EDGE_COMMAND_BUFFER', 'SUPPLIER_NETWORK'].includes(edge.target)
    )) ||
    (['WAREHOUSE_ROBOT_FLEET', 'HANDHELD_SCANNERS'].includes(edge.source) && edge.target === 'API_GATEWAY') ||
    (edge.source === 'DEAD_LETTER_QUEUE' && edge.target === 'API_GATEWAY')
  ));

  addRelationships(edges, nodes, WAREHOUSE_RELATIONSHIPS, changes);
}

function assignWorkflowHints(nodes) {
  nodes.forEach(node => {
    const match = WORKFLOW_HINTS.find(([, matcher]) => matcher.test(`${node.name} ${node.role || ''}`));
    node.workflow = match?.[0] || (node.category === 'backend' ? 'domain' : 'platform');
  });
}

export function applyWorkflowRelationships(diagram, context = {}) {
  const nodes = [...(diagram.nodes || []).map(node => ({ ...node }))];
  const edges = [...(diagram.edges || []).map(edge => ({ ...edge }))];
  const changes = [];
  const promptContext = `${context.description || ''} ${context.template || ''}`;

  pruneGenericRuntime(nodes, edges, changes);
  normalizeInfrastructure(nodes, edges, context, changes);

  if (AUTONOMOUS_WAREHOUSE_MATCHER.test(promptContext)) {
    applyWarehouseModel(nodes, edges, changes);
  }

  assignWorkflowHints(nodes);

  return {
    diagram: { nodes, edges },
    changes: [...new Set(changes)]
  };
}
