import { categoryOrder, getCategoryProducts } from '../tech.js';

export function generateNodesFromDiagram(nodes) {
  const categoryColumns = {};
  const columnWidth = 300;
  const nodeHeight = 80;
  const startX = 100;
  const startY = 100;

  categoryOrder.forEach((category, index) => {
    categoryColumns[category] = startX + (index * columnWidth);
  });

  const nodesByCategory = {};
  nodes.forEach(node => {
    const category = node.category || 'backend';
    if (!nodesByCategory[category]) {
      nodesByCategory[category] = [];
    }
    nodesByCategory[category].push(node);
  });

  let idCounter = 1;
  const positionedNodes = [];

  categoryOrder.forEach(category => {
    const categoryNodes = nodesByCategory[category] || [];
    const x = categoryColumns[category];

    categoryNodes.forEach((node, index) => {
      positionedNodes.push({
        id: `n${idCounter++}`,
        name: node.name,
        category,
        role: node.role || `Handles ${node.name.toLowerCase()} operations`,
        reason: node.reason || `Selected for its strength in handling ${category} requirements`,
        icon: node.icon || 'tech',
        workflow: node.workflow,
        position: {
          x,
          y: startY + (index * nodeHeight)
        },
        products: getCategoryProducts(category)
      });
    });
  });

  return positionedNodes;
}

export function generateEdgesFromDiagram(nodes, edges, positionedNodes) {
  const nodeNameToId = {};
  positionedNodes.forEach(node => {
    nodeNameToId[node.name.toLowerCase()] = node.id;
  });

  return edges.map((edge, index) => ({
    id: `e${index + 1}`,
    source: nodeNameToId[edge.source.toLowerCase()] || `n${index + 1}`,
    target: nodeNameToId[edge.target.toLowerCase()] || `n${index + 2}`,
    label: edge.label || 'Connection',
    type: 'step'
  }));
}
