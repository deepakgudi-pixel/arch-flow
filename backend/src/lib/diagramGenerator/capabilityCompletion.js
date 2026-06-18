import {
  addNormalizedEdge,
  addNormalizedNode,
  hasNodeNamed
} from './hardenerConnections.js';
import {
  buildDiagramRequirementText,
  extractPromptRequirements,
  isRequirementCovered
} from './capabilityRequirements.js';

function appendCoverageText(node, label) {
  const currentText = `${node.role || ''} ${node.reason || ''}`;

  if (currentText.toLowerCase().includes(label.toLowerCase())) {
    return;
  }

  node.reason = [node.reason, label]
    .filter(Boolean)
    .join('; ')
    .slice(0, 180);
}

function ensureCapabilityNode(nodes, spec, requirement, changes) {
  const [name, category, role, reason, icon] = spec;
  const existing = nodes.find(node => node.name === name);

  if (existing) {
    appendCoverageText(existing, requirement.label);
    return existing;
  }

  return addNormalizedNode(
    nodes,
    name,
    category,
    role,
    reason,
    icon,
    changes
  );
}

function findGateway(nodes) {
  return nodes.find(node => node.name === 'API_GATEWAY')
    || nodes.find(node => node.category === 'backend')
    || null;
}

function connectPrimaryNode(edges, nodes, gateway, primaryNode, changes) {
  if (!gateway || !primaryNode || gateway.name === primaryNode.name) {
    return;
  }

  if (primaryNode.category === 'frontend' || primaryNode.category === 'mobile') {
    addNormalizedEdge(edges, nodes, primaryNode.name, gateway.name, 'HTTPS', changes);
    return;
  }

  if (primaryNode.category === 'queue' && primaryNode.name === 'DEAD_LETTER_QUEUE' && hasNodeNamed(nodes, 'KAFKA')) {
    addNormalizedEdge(edges, nodes, 'KAFKA', primaryNode.name, 'KAFKA', changes);
    addNormalizedEdge(edges, nodes, primaryNode.name, gateway.name, 'KAFKA', changes);
    return;
  }

  addNormalizedEdge(edges, nodes, gateway.name, primaryNode.name, undefined, changes);
}

function connectCompanionNode(edges, nodes, primaryNode, companionNode, gateway, changes) {
  if (!companionNode || !primaryNode || companionNode.name === primaryNode.name) {
    return;
  }

  if (primaryNode.category === 'backend') {
    if (addNormalizedEdge(edges, nodes, primaryNode.name, companionNode.name, undefined, changes)) {
      return;
    }
  }

  connectPrimaryNode(edges, nodes, gateway, companionNode, changes);
}

export function applyPromptCapabilityRequirements(diagram, context = {}) {
  const nodes = [...(diagram.nodes || []).map(node => ({ ...node }))];
  const edges = [...(diagram.edges || []).map(edge => ({ ...edge }))];
  const changes = [];
  const requirements = extractPromptRequirements(context);
  let diagramText = buildDiagramRequirementText({ nodes });
  const missingRequirements = requirements
    .filter(requirement => !isRequirementCovered(diagramText, requirement));

  if (missingRequirements.length >= 3 && !hasNodeNamed(nodes, 'API_GATEWAY')) {
    addNormalizedNode(
      nodes,
      'API_GATEWAY',
      'backend',
      'API gateway',
      'Routes complex domain workflows',
      'server',
      changes
    );
  }

  for (const requirement of missingRequirements) {
    const requirementNodes = requirement.nodes
      .map(spec => ensureCapabilityNode(nodes, spec, requirement, changes))
      .filter(Boolean);
    const gateway = findGateway(nodes);
    const primaryNode = requirementNodes[0];

    connectPrimaryNode(edges, nodes, gateway, primaryNode, changes);
    requirementNodes.slice(1).forEach(companionNode => {
      connectCompanionNode(edges, nodes, primaryNode, companionNode, gateway, changes);
    });

    diagramText = buildDiagramRequirementText({ nodes });
    changes.push(`Requirement completed: ${requirement.label}`);
  }

  return {
    diagram: { nodes, edges },
    changes: [...new Set(changes)],
    requirements
  };
}
