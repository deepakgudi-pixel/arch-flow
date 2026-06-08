export const DIAGRAM_VIEW_MODES = [
  { id: 'full', label: 'Full' },
  { id: 'simplify', label: 'Simplify' },
  { id: 'data', label: 'Data Flow' },
  { id: 'reliability', label: 'Reliability' }
];

const SIMPLIFY_HIDDEN_CATEGORIES = new Set(['devops', 'auth', 'storage']);
const DATA_CATEGORIES = new Set(['frontend', 'mobile', 'backend', 'database', 'storage']);
const RELIABILITY_CATEGORIES = new Set(['backend', 'auth', 'queue', 'storage', 'devops', 'database']);

function getCategory(node) {
  return node?.data?.category || node?.category || 'unknown';
}

export function buildDiagramViewProjection({ nodes = [], edges = [], mode = 'full' }) {
  const nodeById = new Map(nodes.map(node => [node.id, node]));
  const hiddenNodeIds = new Set();
  const highlightedNodeIds = new Set();
  const dimmedNodeIds = new Set();
  const hiddenEdgeIds = new Set();
  const highlightedEdgeIds = new Set();
  const dimmedEdgeIds = new Set();

  if (mode === 'simplify') {
    nodes.forEach(node => {
      if (SIMPLIFY_HIDDEN_CATEGORIES.has(getCategory(node))) {
        hiddenNodeIds.add(node.id);
      }
    });
  }

  if (mode === 'data' || mode === 'reliability') {
    const activeCategories = mode === 'data' ? DATA_CATEGORIES : RELIABILITY_CATEGORIES;

    nodes.forEach(node => {
      if (activeCategories.has(getCategory(node))) {
        highlightedNodeIds.add(node.id);
      } else {
        dimmedNodeIds.add(node.id);
      }
    });
  }

  edges.forEach(edge => {
    const sourceNode = nodeById.get(edge.source);
    const targetNode = nodeById.get(edge.target);

    if (hiddenNodeIds.has(edge.source) || hiddenNodeIds.has(edge.target)) {
      hiddenEdgeIds.add(edge.id);
      return;
    }

    if (mode === 'data' || mode === 'reliability') {
      const sourceHighlighted = highlightedNodeIds.has(sourceNode?.id);
      const targetHighlighted = highlightedNodeIds.has(targetNode?.id);

      if (sourceHighlighted && targetHighlighted) {
        highlightedEdgeIds.add(edge.id);
      } else {
        dimmedEdgeIds.add(edge.id);
      }
    }
  });

  return {
    hiddenNodeIds,
    highlightedNodeIds,
    dimmedNodeIds,
    hiddenEdgeIds,
    highlightedEdgeIds,
    dimmedEdgeIds
  };
}
