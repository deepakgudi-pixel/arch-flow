import {
  CACHE_NAMES,
  OBSERVABILITY_NAMES,
  TRAFFIC_MANAGER_NAMES
} from './hardenerCatalog.js';

export function countCategories(nodes) {
  return nodes.reduce((acc, node) => {
    acc[node.category] = (acc[node.category] || 0) + 1;
    return acc;
  }, {});
}

export function hasObservability(nodes) {
  return nodes.some(node => OBSERVABILITY_NAMES.has(node.name));
}

export function hasTrafficManager(nodes) {
  return nodes.some(node => TRAFFIC_MANAGER_NAMES.has(node.name));
}

export function hasCache(nodes) {
  return nodes.some(node => CACHE_NAMES.has(node.name));
}

export function buildDiagramComplexityScore(nodes, edges, categoryCounts = countCategories(nodes)) {
  const bonusCategories = ['auth', 'storage', 'external', 'queue', 'devops']
    .reduce((sum, category) => sum + ((categoryCounts[category] || 0) > 0 ? 1 : 0), 0);

  return nodes.length
    + Math.min((edges || []).length, 4)
    + bonusCategories
    + ((categoryCounts.backend || 0) >= 2 ? 1 : 0);
}
