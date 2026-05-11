import { builtInTech, getCategoryProducts } from './tech.js';

export const VALID_TECH_CATEGORIES = new Set([
  'mobile',
  'frontend',
  'backend',
  'database',
  'queue',
  'auth',
  'storage',
  'external',
  'devops',
]);

export const REVIEW_NEW_NODE_TOKEN = '__NEW__';

const FALLBACK_ICON_BY_CATEGORY = {
  mobile: 'Smartphone',
  frontend: 'LayoutTemplate',
  backend: 'Server',
  database: 'Database',
  queue: 'MessageSquare',
  auth: 'ShieldCheck',
  storage: 'HardDrive',
  external: 'PlugZap',
  devops: 'CloudCog',
};

export function normalizeProtocolLabel(label) {
  const normalized = String(label || 'REST')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w.+/-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

  return normalized || 'REST';
}

export function normalizeReviewText(value, fallback = '') {
  const normalized = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized || fallback;
}

export function normalizeReviewIcon(icon, category) {
  const normalized = String(icon || '').trim();

  if (/^[A-Z][A-Za-z0-9]+$/.test(normalized)) {
    return normalized;
  }

  return FALLBACK_ICON_BY_CATEGORY[category] || 'Layers';
}

export function normalizeReviewProduct(product, category) {
  if (!product || typeof product !== 'object' || Array.isArray(product)) {
    return null;
  }

  const name = normalizeReviewText(product.name);

  if (!name) {
    return null;
  }

  const url = String(product.url || '').trim();

  return {
    name,
    description: normalizeReviewText(
      product.description,
      `Recommended option for the ${category} layer in this architecture.`,
    ),
    url: /^https?:\/\//i.test(url) ? url : 'https://example.com',
  };
}

export function normalizeReviewConnection(connection, validNodeIds) {
  if (!connection || typeof connection !== 'object' || Array.isArray(connection)) {
    return null;
  }

  const source = String(connection.source || '').trim();
  const target = String(connection.target || '').trim();

  if (!source || !target || source === target) {
    return null;
  }

  const touchesNewNode = [source, target].filter(value => value === REVIEW_NEW_NODE_TOKEN).length === 1;

  if (!touchesNewNode) {
    return null;
  }

  const existingNodeId = source === REVIEW_NEW_NODE_TOKEN ? target : source;

  if (!validNodeIds.has(existingNodeId)) {
    return null;
  }

  return {
    source,
    target,
    label: normalizeProtocolLabel(connection.label),
    reason: normalizeReviewText(connection.reason),
  };
}

export function normalizeReviewSuggestion(suggestion, validNodeIds) {
  if (!suggestion || typeof suggestion !== 'object' || Array.isArray(suggestion)) {
    return null;
  }

  const name = normalizeReviewText(suggestion.name);
  const normalizedCategory = String(suggestion.category || '').trim().toLowerCase();

  if (!name || !VALID_TECH_CATEGORIES.has(normalizedCategory)) {
    return null;
  }

  const products = Array.isArray(suggestion.products)
    ? suggestion.products
        .map(product => normalizeReviewProduct(product, normalizedCategory))
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const connections = Array.isArray(suggestion.connections)
    ? suggestion.connections
        .map(connection => normalizeReviewConnection(connection, validNodeIds))
        .filter(Boolean)
        .slice(0, 6)
    : [];

  return {
    name,
    category: normalizedCategory,
    role: normalizeReviewText(
      suggestion.role,
      `${name} covers the ${normalizedCategory} layer for this system.`,
    ),
    reason: normalizeReviewText(
      suggestion.reason,
      `${name} fills a missing responsibility in the current architecture.`,
    ),
    icon: normalizeReviewIcon(suggestion.icon, normalizedCategory),
    products: products.length > 0 ? products : getCategoryProducts(normalizedCategory),
    connections,
  };
}

export function buildDiagramReviewSummary(nodes, edges, reviewFindings) {
  const categoryCounts = (nodes || []).reduce((acc, node) => {
    const category = String(node.category || 'unknown').trim().toLowerCase();
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const findingCounts = (reviewFindings || []).reduce((acc, finding) => {
    const severity = normalizeReviewText(finding.severity, 'warning').toLowerCase();
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  return {
    nodeCount: (nodes || []).length,
    edgeCount: (edges || []).length,
    categoryCounts,
    clientSurfaceCount: (categoryCounts.frontend || 0) + (categoryCounts.mobile || 0),
    backendServiceCount: categoryCounts.backend || 0,
    runtimeDependencyCount:
      (categoryCounts.database || 0)
      + (categoryCounts.queue || 0)
      + (categoryCounts.storage || 0)
      + (categoryCounts.external || 0)
      + (categoryCounts.auth || 0),
    findingCounts,
    criticalSignals: (reviewFindings || [])
      .filter(finding => normalizeReviewText(finding.severity, 'warning').toLowerCase() === 'critical')
      .map(finding => normalizeReviewText(finding.title, 'REVIEW_SIGNAL'))
      .slice(0, 6),
  };
}

export function buildDiagramReviewContext({ diagramName, nodes, edges, reviewFindings }) {
  const normalizedNodes = (nodes || []).slice(0, 60).map(node => ({
    id: String(node.id || '').trim(),
    name: normalizeReviewText(node.name),
    category: String(node.category || 'backend').trim().toLowerCase(),
    role: normalizeReviewText(node.role),
  }));
  const normalizedEdges = (edges || []).slice(0, 80).map(edge => ({
    source: String(edge.source || '').trim(),
    target: String(edge.target || '').trim(),
    label: normalizeProtocolLabel(edge.label),
  }));
  const normalizedReviewFindings = (reviewFindings || []).slice(0, 20).map(finding => ({
    severity: normalizeReviewText(finding.severity, 'warning'),
    title: normalizeReviewText(finding.title, 'REVIEW_SIGNAL'),
    detail: normalizeReviewText(finding.detail),
  }));

  return {
    diagramName: normalizeReviewText(diagramName, 'Untitled diagram'),
    nodes: normalizedNodes,
    edges: normalizedEdges,
    reviewFindings: normalizedReviewFindings,
    summary: buildDiagramReviewSummary(normalizedNodes, normalizedEdges, normalizedReviewFindings),
    builtInCatalog: Object.fromEntries(
      Object.entries(builtInTech).map(([category, items]) => [
        category,
        items.slice(0, 8).map(item => item.name),
      ]),
    ),
    connectionToken: REVIEW_NEW_NODE_TOKEN,
  };
}
