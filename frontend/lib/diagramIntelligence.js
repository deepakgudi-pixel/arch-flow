export {
  buildCategoryCounts,
  buildDiagramComplexityScore,
  buildRuleMap,
  GENERIC_EDGE_LABELS,
  getProtocolFamily,
  getRuleKey,
  normalizeProtocolLabel,
  normalizeTechLabel
} from './diagramIntelligence/utils';
export { buildArchitectureReview } from './diagramIntelligence/review';
export { buildArchitectureScore } from './diagramIntelligence/score';
export {
  buildConnectionTrustProfile,
  buildNodeTrustProfile
} from './diagramIntelligence/trustProfiles';
export { getReplacementCandidates } from './diagramIntelligence/inventory';
export { buildVersionDiff } from './diagramIntelligence/versionDiff';
