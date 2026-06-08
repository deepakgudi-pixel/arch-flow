import { fixNodeIcon, VALID_CATEGORIES } from './hardenerCatalog.js';
import {
  normalizeEdgeLabel,
  normalizeIdentifier,
  normalizeNodeCategory
} from './hardenerIdentifiers.js';

export function normalizeDiagramStructure(parsed) {
  const nodeMap = new Map();
  const normalizedNodes = [];

  for (const rawNode of parsed.nodes || []) {
    const name = normalizeIdentifier(rawNode?.name);

    if (!name || nodeMap.has(name)) {
      continue;
    }

    const category = normalizeNodeCategory(rawNode?.category, name);

    if (!VALID_CATEGORIES.has(category)) {
      continue;
    }

    const fixedIcon = fixNodeIcon(name);
    const normalizedNode = {
      name,
      category,
      role: rawNode?.role || `Handles ${name.toLowerCase().replace(/_/g, ' ')} operations`,
      reason: rawNode?.reason || `Selected to satisfy the ${category} layer in this architecture.`,
      icon: fixedIcon || rawNode?.icon || 'server'
    };

    nodeMap.set(name, normalizedNode);
    normalizedNodes.push(normalizedNode);
  }

  const seenEdges = new Set();
  const normalizedEdges = [];

  for (const rawEdge of parsed.edges || []) {
    const source = normalizeIdentifier(rawEdge?.source);
    const target = normalizeIdentifier(rawEdge?.target);
    const label = normalizeEdgeLabel(rawEdge?.label);

    if (!source || !target || source === target) {
      continue;
    }

    if (!nodeMap.has(source) || !nodeMap.has(target)) {
      continue;
    }

    const edgeKey = `${source}->${target}::${label}`;
    if (seenEdges.has(edgeKey)) {
      continue;
    }

    seenEdges.add(edgeKey);
    normalizedEdges.push({ source, target, label });
  }

  return {
    nodes: normalizedNodes,
    edges: normalizedEdges
  };
}
