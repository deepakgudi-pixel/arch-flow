import { formatTechDisplayLabel } from '@/lib/displayNames';
import {
  getConnectionAssumptions,
  getConnectionSummary,
  getFallbackReason,
  getProtocolFamily,
  getProtocolWhyChosen,
  normalizeProtocolLabel
} from './utils';

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
    assumptions.push("This datastore is appropriate for the system's write/read pattern and operational scale.");
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
