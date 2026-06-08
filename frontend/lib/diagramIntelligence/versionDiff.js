import { normalizeTechLabel } from './utils';

export function buildVersionDiff(currentNodes, currentEdges, versionNodes, versionEdges) {
  const currentNodeSet = new Set((currentNodes || []).map(node => `${normalizeTechLabel(node.data?.label || node.name)}::${node.data?.category || node.category || 'unknown'}`));
  const versionNodeSet = new Set((versionNodes || []).map(node => `${normalizeTechLabel(node.name || node.data?.label)}::${node.category || node.data?.category || 'unknown'}`));

  const currentEdgeSet = new Set((currentEdges || []).map(edge => `${edge.source}->${edge.target}::${normalizeTechLabel(edge.label)}`));
  const versionEdgeSet = new Set((versionEdges || []).map(edge => `${edge.source}->${edge.target}::${normalizeTechLabel(edge.label)}`));

  let addedNodes = 0;
  let removedNodes = 0;
  let addedEdges = 0;
  let removedEdges = 0;

  versionNodeSet.forEach(signature => {
    if (!currentNodeSet.has(signature)) addedNodes += 1;
  });

  currentNodeSet.forEach(signature => {
    if (!versionNodeSet.has(signature)) removedNodes += 1;
  });

  versionEdgeSet.forEach(signature => {
    if (!currentEdgeSet.has(signature)) addedEdges += 1;
  });

  currentEdgeSet.forEach(signature => {
    if (!versionEdgeSet.has(signature)) removedEdges += 1;
  });

  return {
    addedNodes,
    removedNodes,
    addedEdges,
    removedEdges
  };
}
