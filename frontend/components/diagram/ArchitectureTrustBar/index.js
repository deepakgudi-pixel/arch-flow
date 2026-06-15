'use client';

import { CheckCircle2, Layers3, Presentation, ShieldCheck, Zap } from 'lucide-react';
import { TrustAction, TrustBarShell, TrustChip } from './ArchitectureTrustBar.styles';

function hasQueueConsumer(nodes, edges) {
  const nodeById = new Map((nodes || []).map(node => [node.id, node]));
  const queueNodes = (nodes || []).filter(node => node.data?.category === 'queue');

  if (queueNodes.length === 0) {
    return true;
  }

  return queueNodes.every(queueNode =>
    (edges || []).some(edge => {
      if (edge.source !== queueNode.id) return false;
      const targetNode = nodeById.get(edge.target);
      return targetNode?.data?.category === 'backend' || targetNode?.data?.category === 'queue';
    })
  );
}

export default function ArchitectureTrustBar({
  score,
  findings = [],
  nodes = [],
  edges = [],
  activeExample,
  autoFixes = [],
  onOpenReview,
  onPresent
}) {
  const activeFindings = findings.filter(finding => finding.severity === 'critical' || finding.severity === 'warning');
  const layerCount = new Set(nodes.map(node => node.data?.category).filter(Boolean)).size;
  const queueSafe = hasQueueConsumer(nodes, edges);

  if (nodes.length === 0) {
    return null;
  }

  return (
    <TrustBarShell aria-label="Architecture trust signals">
      <TrustChip $tone={score?.score === 100 && activeFindings.length === 0 ? 'success' : 'warning'}>
        <ShieldCheck size={13} />
        {score?.score ?? 0}/100
      </TrustChip>
      <TrustChip
        as="button"
        type="button"
        $tone={activeFindings.length === 0 ? 'success' : 'warning'}
        onClick={onOpenReview}
      >
        <CheckCircle2 size={13} />
        {activeFindings.length === 0 ? 'Rules clear' : `${activeFindings.length} signals`}
      </TrustChip>
      <TrustChip>
        <Layers3 size={13} />
        {layerCount} layer{layerCount === 1 ? '' : 's'} · {queueSafe ? 'queues ok' : 'queue gap'}
      </TrustChip>
      {autoFixes.length > 0 && (
        <TrustChip $tone="success">
          <Zap size={13} />
          {autoFixes.length} auto-fixes
        </TrustChip>
      )}
      {activeExample && (
        <TrustChip $tone="strong">
          {activeExample.name} demo
        </TrustChip>
      )}
      <TrustAction type="button" onClick={onPresent}>
        <Presentation size={13} />
        Present
      </TrustAction>
    </TrustBarShell>
  );
}
