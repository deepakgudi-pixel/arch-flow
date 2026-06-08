import {
  buildCategoryCounts,
  normalizeTechLabel
} from './utils';

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
