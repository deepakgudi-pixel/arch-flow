import type { ArchitectureScore, DiagramEdge, DiagramNode, ReviewFinding } from '../../shared/types/diagram';

type ReactFlowDiagramNode = {
  id: string;
  type?: string;
  data?: {
    label?: string;
    category?: DiagramNode['category'];
    role?: string;
    reason?: string;
  };
  name?: string;
  category?: DiagramNode['category'];
};

type ReactFlowDiagramEdge = DiagramEdge & {
  label?: string;
};

export interface ArchitectureNarrative {
  title: string;
  summary: string;
  strengths: string[];
  reviewNote: string;
}

function getCategory(node: ReactFlowDiagramNode): string {
  return node.data?.category || node.category || 'unknown';
}

function getLabel(node: ReactFlowDiagramNode): string {
  return node.data?.label || node.name || node.id;
}

export function buildArchitectureNarrative({
  nodes,
  edges,
  findings,
  score
}: {
  nodes: ReactFlowDiagramNode[];
  edges: ReactFlowDiagramEdge[];
  findings: ReviewFinding[];
  score?: ArchitectureScore;
}): ArchitectureNarrative {
  const techNodes = (nodes || []).filter(node => node.type === 'customNode' || node.data || node.name);
  const categoryCounts = techNodes.reduce<Record<string, number>>((acc, node) => {
    const category = getCategory(node);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const activeFindings = (findings || []).filter(finding => finding.severity === 'critical' || finding.severity === 'warning');
  const hasClient = Boolean(categoryCounts.frontend || categoryCounts.mobile);
  const hasBackend = Boolean(categoryCounts.backend);
  const hasData = Boolean(categoryCounts.database || categoryCounts.storage);
  const hasAsync = Boolean(categoryCounts.queue);
  const hasOps = Boolean(categoryCounts.devops);
  const hasAuth = Boolean(categoryCounts.auth);
  const firstBackend = techNodes.find(node => getCategory(node) === 'backend');
  const firstData = techNodes.find(node => ['database', 'storage'].includes(getCategory(node)));
  const firstClient = techNodes.find(node => ['frontend', 'mobile'].includes(getCategory(node)));

  const strengths = [
    hasClient && hasBackend
      ? `${getLabel(firstClient as ReactFlowDiagramNode)} sends user traffic through an application layer instead of reaching data systems directly.`
      : null,
    hasBackend && hasData
      ? `${getLabel(firstBackend as ReactFlowDiagramNode)} acts as the control plane for persistence and downstream services.`
      : null,
    hasAsync
      ? 'An async messaging layer is present, which gives the design a path for background work, retries, and burst absorption.'
      : null,
    hasAuth
      ? 'Identity is modeled explicitly, so access control is visible instead of hidden inside application code.'
      : null,
    hasOps
      ? 'Observability or delivery tooling is part of the diagram, which makes runtime reliability reviewable.'
      : null,
    firstData
      ? `${getLabel(firstData)} gives the system a named persistence boundary that can be inspected for scale and failure modes.`
      : null
  ].filter(Boolean).slice(0, 4) as string[];

  const summary = activeFindings.length === 0
    ? `This architecture is review-ready because the major trust boundaries, data paths, and reliability layers are explicit across ${techNodes.length} components and ${edges?.length || 0} connections.`
    : `This architecture is understandable, but ${activeFindings.length} active review signal${activeFindings.length === 1 ? '' : 's'} should be resolved before treating it as production-ready.`;

  return {
    title: score?.score === 100 && activeFindings.length === 0 ? 'Why This Architecture Works' : 'Architecture Readout',
    summary,
    strengths: strengths.length > 0 ? strengths : ['The diagram now has enough structure to inspect component responsibilities and connection intent.'],
    reviewNote: score
      ? `Current internal quality gate: ${score.score}/100 (${score.grade}).`
      : 'Open Architecture Review to see the latest internal quality gate.'
  };
}
