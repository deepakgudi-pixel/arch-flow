import { canonicalConnectionRules } from '../connectionRules.js';
import {
  CACHE_NAMES,
  CLIENT_CATEGORIES,
  GENERIC_EDGE_LABELS,
  fixNodeIcon
} from './hardenerCatalog.js';
import {
  normalizeEdgeLabel,
  normalizeIdentifier,
  normalizeNodeCategory
} from './hardenerIdentifiers.js';

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

export function getConnectionRule(sourceCategory, targetCategory) {
  return GENERATION_RULE_MAP.get(ruleKey(sourceCategory, targetCategory));
}

export function isConnectionValid(sourceCategory, targetCategory) {
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

export function addNormalizedNode(nodes, name, category, role, reason, icon, changes) {
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

export function hasNodeNamed(nodes, name) {
  const normalizedName = normalizeIdentifier(name);
  return nodes.some(node => node.name === normalizedName);
}

export function getNodesByCategory(nodes, category) {
  return nodes.filter(node => node.category === category);
}

export function protocolForConnection(sourceCategory, targetCategory, sourceName = '', targetName = '') {
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

export function normalizeEdgeLabelForConnection(label, sourceCategory, targetCategory, sourceName = '', targetName = '') {
  const normalizedIdentifier = normalizeIdentifier(label);

  if (GENERIC_EDGE_LABELS.has(normalizedIdentifier)) {
    return protocolForConnection(sourceCategory, targetCategory, sourceName, targetName);
  }

  return normalizeEdgeLabel(label || protocolForConnection(sourceCategory, targetCategory, sourceName, targetName));
}

export function addNormalizedEdge(edges, nodes, source, target, label, changes, reason) {
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
