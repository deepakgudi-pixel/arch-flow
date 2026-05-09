import { categoryOrder, categorizeTech, getCategoryProducts } from './tech.js';
import { callOpenRouter, DIAGRAM_MODEL, robustParseJSON } from './openRouter.js';

const VALID_CATEGORIES = new Set(categoryOrder);

function normalizeIdentifier(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w.+/-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

function normalizeNodeCategory(category, name) {
  const normalized = String(category || '').trim().toLowerCase();
  if (VALID_CATEGORIES.has(normalized)) {
    return normalized;
  }

  return categorizeTech(name || '');
}

function normalizeEdgeLabel(label) {
  const normalized = normalizeIdentifier(label);
  return normalized || 'CONNECTION';
}

function normalizeDiagramStructure(parsed) {
  const nodeMap = new Map();
  const normalizedNodes = [];

  for (const rawNode of parsed.nodes || []) {
    const name = normalizeIdentifier(rawNode?.name);

    if (!name || nodeMap.has(name)) {
      continue;
    }

    const category = normalizeNodeCategory(rawNode?.category, name);
    const normalizedNode = {
      name,
      category,
      role: rawNode?.role || `Handles ${name.toLowerCase().replace(/_/g, ' ')} operations`,
      reason: rawNode?.reason || `Selected to satisfy the ${category} layer in this architecture.`,
      icon: rawNode?.icon || 'Layers'
    };

    nodeMap.set(name, normalizedNode);
    normalizedNodes.push(normalizedNode);
  }

  const seenEdges = new Set();
  const normalizedEdges = [];

  for (const rawEdge of parsed.edges || []) {
    const source = normalizeIdentifier(rawEdge?.source);
    const target = normalizeIdentifier(rawEdge?.target);
    const label = normalizeEdgeLabel(rawEdge?.label);

    if (!source || !target || source === target) {
      continue;
    }

    if (!nodeMap.has(source) || !nodeMap.has(target)) {
      continue;
    }

    const edgeKey = `${source}->${target}::${label}`;
    if (seenEdges.has(edgeKey)) {
      continue;
    }

    seenEdges.add(edgeKey);
    normalizedEdges.push({ source, target, label });
  }

  return {
    nodes: normalizedNodes,
    edges: normalizedEdges
  };
}

function validateNormalizedDiagram(diagram) {
  if (!Array.isArray(diagram.nodes) || diagram.nodes.length === 0) {
    throw new Error('Generated architecture did not contain any valid nodes.');
  }

  if (diagram.nodes.length > 1 && diagram.edges.length === 0) {
    throw new Error('Generated architecture contained nodes but no valid connections.');
  }
}

export const DIAGRAM_SYSTEM_PROMPT = `You are a Senior Principal Infrastructure Architect. Your mandate is to design technically accurate, production-grade systems. Accuracy is paramount; do not include irrelevant or vague components.

PRECISION_MANDATE:
- RELEVANCE: Only include components that are strictly necessary for the architecture.
- SPECIFICITY: Use real-world, industry-standard technology names (e.g., KAFKA instead of GENERIC_QUEUE).
- PLATFORM_INTEGRITY: Distinguish clearly between Mobile and Web. If the user specifies 'Mobile', use mobile-native tech (e.g., SWIFT, KOTLIN, REACT_NATIVE). If 'Web', use web tech (e.g., NEXT.JS, REACT). Do not blend them unless a cross-platform or multi-client system is requested.

ARCHITECTURAL_RIGOR:
- SECURITY_FIRST: Always consider if a system needs an AUTH gateway, Firewall, or Secret Management (e.g., VAULT).
- DATA_FLOW_STRICTNESS: Labels on connections should describe the ACTION or PATTERN (e.g., EVENT_PUBLISH, SYNC_FETCH, BATCH_WRITE) when appropriate.
- OBSERVABILITY: For non-trivial systems, include logging and monitoring components (e.g., GRAFANA, DATADOG, ELK) in the 'devops' category.

JSON_STRUCTURE_SPECIFICATION:
{
  "nodes": [
    {
      "name": "TECH_NAME_UPPERCASE",
      "category": "mobile|frontend|backend|database|queue|auth|storage|external|devops",
      "role": "Specific technical function (e.g., INVENTORY_CACHE)",
      "reason": "Technical justification based on the user's specific requirements",
      "icon": "Lucide icon name (e.g., database, server, shield, smartphone, message-square, storage)"
    }
  ],
  "edges": [
    {
      "source": "TECH_NAME_UPPERCASE",
      "target": "TECH_NAME_UPPERCASE",
      "label": "EXACT_PROTOCOL (e.g., gRPC, AMQP, SQL, OIDC)"
    }
  ]
}

STRICT_CONSTRAINTS:
1. Names must be uppercase and technically precise (e.g., NODEJS_API, POSTGRESQL_DB).
2. Category must be strictly: mobile, frontend, backend, database, queue, auth, storage, external, devops.
3. FRONTENDS MUST NEVER CONNECT DIRECTLY TO DATABASES. Always place a Backend/API layer in between for security and business logic.
4. Edges must represent actual data dependencies.
5. Output ONLY the JSON object.

ARCH_PATTERN_ADVICE:
- Standard 3-Tier: For web/mobile apps, always default to a Frontend/Mobile -> Backend -> Database flow.
- Focused: Ensure the technology choice matches the scale implied by the prompt.`;

export function buildDiagramUserMessage(description, template) {
  return template
    ? `Create a system design for a ${template} application. ${description}`
    : description;
}

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

export async function generateDiagramFromPrompt({ description, template, model = DIAGRAM_MODEL, onChunk } = {}) {
  const userMessage = buildDiagramUserMessage(description, template);
  const { content: rawResponse, model: resolvedModel } = await callOpenRouter(
    [
      { role: 'system', content: DIAGRAM_SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ],
    model,
    onChunk
  );

  const parsed = robustParseJSON(rawResponse);
  const normalizedDiagram = normalizeDiagramStructure(parsed);
  validateNormalizedDiagram(normalizedDiagram);
  const nodes = generateNodesFromDiagram(normalizedDiagram.nodes);
  const edges = generateEdgesFromDiagram(normalizedDiagram.nodes, normalizedDiagram.edges, nodes);

  return {
    model: resolvedModel,
    rawResponse,
    userMessage,
    nodes,
    edges
  };
}
