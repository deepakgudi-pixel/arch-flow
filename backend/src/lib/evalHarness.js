import { canonicalConnectionRules } from './connectionRules.js';

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function ruleKey(sourceCategory, targetCategory) {
  return `${sourceCategory || 'unknown'}->${targetCategory || 'unknown'}`;
}

function buildRuleMap(connectionRules = canonicalConnectionRules) {
  return new Map(
    connectionRules.map(rule => {
      const normalized = Array.isArray(rule)
        ? {
            source_category: rule[0],
            target_category: rule[1],
            is_valid: rule[2],
            warning_message: rule[3]
          }
        : rule;

      return [ruleKey(normalized.source_category, normalized.target_category), normalized];
    })
  );
}

function sanitizePromptText(promptText) {
  if (!promptText) {
    return '';
  }

  return normalizeWhitespace(promptText.replace(/^AI_SYNTHESIS:\s*/i, ''));
}

function buildPromptText(family, clientType, scaleLevel, constraint) {
  return normalizeWhitespace(
    `Design a ${scaleLevel.label} ${family.description} for ${clientType.label} users with ${constraint.label} as a hard constraint. Make the architecture production-ready, explicit about major components, and clear about data flow.`
  );
}

export function generatePromptMatrix(matrix, maxPrompts = 24) {
  const combinationTemplates = [];
  for (const scaleLevel of matrix.scaleLevels || []) {
    for (const clientType of matrix.clientTypes || []) {
      for (const constraint of matrix.constraints || []) {
        combinationTemplates.push({ constraint, scaleLevel, clientType });
      }
    }
  }

  const families = matrix.families || [];
  const buckets = combinationTemplates.map((combo, comboIndex) => {
    const rotatedFamilies = families.map((_, familyOffset) => {
      const family = families[(comboIndex + familyOffset) % families.length];

      return {
        id: `${family.id}__${combo.clientType.id}__${combo.scaleLevel.id}__${combo.constraint.id}`,
        source: 'matrix',
        prompt: buildPromptText(family, combo.clientType, combo.scaleLevel, combo.constraint),
        template: family.template || null,
        requiredCategories: uniq([
          ...(family.expectedCategories || []),
          ...(combo.clientType.expectedCategories || [])
        ]),
        requireAuth: Boolean(family.requireAuth || combo.constraint.requireAuth),
        requireQueue: Boolean(family.requireQueue || combo.scaleLevel.requireQueue),
        requireDevops: Boolean(family.requireDevops || combo.scaleLevel.requireDevops),
        metadata: {
          family: family.id,
          clientType: combo.clientType.id,
          scaleLevel: combo.scaleLevel.id,
          constraint: combo.constraint.id
        }
      };
    });

    return rotatedFamilies;
  });

  const selected = [];
  while (selected.length < maxPrompts && buckets.some(bucket => bucket.length > 0)) {
    for (const bucket of buckets) {
      if (selected.length >= maxPrompts) {
        break;
      }

      const nextPrompt = bucket.shift();
      if (nextPrompt) {
        selected.push(nextPrompt);
      }
    }
  }

  return selected;
}

export async function minePromptHistory(pool, limit = 8) {
  if (!limit || limit <= 0) {
    return [];
  }

  const result = await pool.query(
    `SELECT DISTINCT prompt_text
     FROM diagram_versions
     WHERE COALESCE(prompt_text, '') <> ''
     ORDER BY prompt_text
     LIMIT $1`,
    [limit * 3]
  );

  const prompts = [];
  const seen = new Set();

  for (const row of result.rows) {
    const sanitized = sanitizePromptText(row.prompt_text);

    if (!sanitized || sanitized.length < 15 || seen.has(sanitized)) {
      continue;
    }

    seen.add(sanitized);
    prompts.push({
      id: `history_${prompts.length + 1}`,
      source: 'history',
      prompt: sanitized,
      template: null,
      requiredCategories: [],
      requireAuth: false,
      requireQueue: false,
      requireDevops: false,
      metadata: {
        origin: 'diagram_versions'
      }
    });

    if (prompts.length >= limit) {
      break;
    }
  }

  return prompts;
}

export async function mineAIFailurePrompts(pool, limit = 6) {
  if (!limit || limit <= 0) {
    return [];
  }

  const result = await pool.query(
    `SELECT input_payload
     FROM ai_failures
     WHERE kind = 'generate-diagram'
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit * 3]
  );

  const prompts = [];
  const seen = new Set();

  for (const row of result.rows) {
    const payload = row.input_payload || {};
    const sanitized = sanitizePromptText(payload.description);

    if (!sanitized || sanitized.length < 15 || seen.has(sanitized)) {
      continue;
    }

    seen.add(sanitized);
    prompts.push({
      id: `failure_${prompts.length + 1}`,
      source: 'ai_failure',
      prompt: sanitized,
      template: payload.template || null,
      requiredCategories: [],
      requireAuth: false,
      requireQueue: false,
      requireDevops: false,
      metadata: {
        origin: 'ai_failures'
      }
    });

    if (prompts.length >= limit) {
      break;
    }
  }

  return prompts;
}

export function mergePromptSets(primaryPrompts, secondaryPrompts = [], maxPrompts = null) {
  const merged = [];
  const seen = new Set();

  for (const promptSpec of [...primaryPrompts, ...secondaryPrompts]) {
    const normalizedPrompt = sanitizePromptText(promptSpec.prompt);
    if (!normalizedPrompt || seen.has(normalizedPrompt)) {
      continue;
    }

    seen.add(normalizedPrompt);
    merged.push({
      ...promptSpec,
      prompt: normalizedPrompt
    });

    if (maxPrompts && merged.length >= maxPrompts) {
      break;
    }
  }

  return merged;
}

function addCheck(checks, key, passed, detail) {
  checks.push({ key, passed, detail });
}

export function evaluateDiagram(diagram, promptSpec, connectionRules = canonicalConnectionRules) {
  const nodes = diagram.nodes || [];
  const edges = diagram.edges || [];
  const checks = [];
  const ruleMap = buildRuleMap(connectionRules);
  const nodeById = new Map(nodes.map(node => [node.id, node]));
  const degreeById = new Map(nodes.map(node => [node.id, 0]));
  const categoryCounts = {};

  nodes.forEach(node => {
    categoryCounts[node.category] = (categoryCounts[node.category] || 0) + 1;
  });

  addCheck(checks, 'HAS_COMPONENTS', nodes.length > 0, `Found ${nodes.length} nodes.`);
  if (nodes.length > 1) {
    addCheck(checks, 'HAS_DATA_FLOW', edges.length > 0, `Found ${edges.length} edges.`);
  }

  const invalidConnections = [];
  const clientDatabaseBypass = [];

  edges.forEach(edge => {
    const sourceNode = nodeById.get(edge.source);
    const targetNode = nodeById.get(edge.target);

    if (!sourceNode || !targetNode) {
      return;
    }

    degreeById.set(edge.source, (degreeById.get(edge.source) || 0) + 1);
    degreeById.set(edge.target, (degreeById.get(edge.target) || 0) + 1);

    const sourceCategory = sourceNode.category;
    const targetCategory = targetNode.category;
    const rule = ruleMap.get(ruleKey(sourceCategory, targetCategory));

    if (rule && rule.is_valid === false) {
      invalidConnections.push(`${sourceNode.name} -> ${targetNode.name}`);
    }

    if (
      (sourceCategory === 'frontend' || sourceCategory === 'mobile') &&
      targetCategory === 'database'
    ) {
      clientDatabaseBypass.push(`${sourceNode.name} -> ${targetNode.name}`);
    }
  });

  addCheck(
    checks,
    'NO_INVALID_CONNECTIONS',
    invalidConnections.length === 0,
    invalidConnections.length === 0
      ? 'No invalid category-to-category connections.'
      : `Invalid links: ${invalidConnections.join(', ')}`
  );

  addCheck(
    checks,
    'NO_CLIENT_DATABASE_BYPASS',
    clientDatabaseBypass.length === 0,
    clientDatabaseBypass.length === 0
      ? 'No direct client-to-database links.'
      : `Direct client/database links: ${clientDatabaseBypass.join(', ')}`
  );

  for (const category of promptSpec.requiredCategories || []) {
    addCheck(
      checks,
      `HAS_${category.toUpperCase()}`,
      Boolean(categoryCounts[category]),
      categoryCounts[category]
        ? `Found ${categoryCounts[category]} ${category} node(s).`
        : `Missing expected ${category} layer.`
    );
  }

  if (promptSpec.requireAuth) {
    addCheck(
      checks,
      'HAS_AUTH',
      Boolean(categoryCounts.auth),
      categoryCounts.auth
        ? `Found ${categoryCounts.auth} auth node(s).`
        : 'Security-oriented prompt expected an explicit auth layer.'
    );
  }

  if (promptSpec.requireQueue) {
    addCheck(
      checks,
      'HAS_ASYNC_LAYER',
      Boolean(categoryCounts.queue),
      categoryCounts.queue
        ? `Found ${categoryCounts.queue} queue node(s).`
        : 'Scale-sensitive prompt expected a queue or event stream.'
    );
  }

  if (promptSpec.requireDevops) {
    addCheck(
      checks,
      'HAS_DEVOPS_LAYER',
      Boolean(categoryCounts.devops),
      categoryCounts.devops
        ? `Found ${categoryCounts.devops} devops node(s).`
        : 'Production-oriented prompt expected observability or deployment infrastructure.'
    );
  }

  const disconnectedRequiredNodes = nodes
    .filter(node => (promptSpec.requiredCategories || []).includes(node.category))
    .filter(node => (degreeById.get(node.id) || 0) === 0)
    .map(node => node.name);

  if ((promptSpec.requiredCategories || []).length > 1) {
    addCheck(
      checks,
      'REQUIRED_LAYERS_CONNECTED',
      disconnectedRequiredNodes.length === 0,
      disconnectedRequiredNodes.length === 0
        ? 'Expected layers are connected to the broader graph.'
        : `Disconnected expected nodes: ${disconnectedRequiredNodes.join(', ')}`
    );
  }

  const passedChecks = checks.filter(check => check.passed).length;
  const failedChecks = checks.length - passedChecks;
  const score = checks.length === 0 ? 100 : Math.round((passedChecks / checks.length) * 100);

  return {
    score,
    checks,
    passedChecks,
    failedChecks
  };
}

function buildNodeSignatureSet(nodes) {
  return new Set(
    (nodes || []).map(node => `${(node.name || '').toUpperCase()}::${node.category || 'unknown'}`)
  );
}

function buildEdgeSignatureSet(nodes, edges) {
  const nodeNameById = new Map((nodes || []).map(node => [node.id, node.name || node.id]));

  return new Set(
    (edges || []).map(edge => {
      const sourceName = (nodeNameById.get(edge.source) || edge.source).toUpperCase();
      const targetName = (nodeNameById.get(edge.target) || edge.target).toUpperCase();
      const label = (edge.label || '').toUpperCase();
      return `${sourceName}->${targetName}::${label}`;
    })
  );
}

function jaccardSimilarity(leftSet, rightSet) {
  const union = new Set([...leftSet, ...rightSet]);
  if (union.size === 0) {
    return 1;
  }

  let intersectionSize = 0;
  leftSet.forEach(value => {
    if (rightSet.has(value)) {
      intersectionSize += 1;
    }
  });

  return intersectionSize / union.size;
}

function diagramSimilarity(leftDiagram, rightDiagram) {
  const leftNodes = buildNodeSignatureSet(leftDiagram.nodes);
  const rightNodes = buildNodeSignatureSet(rightDiagram.nodes);
  const leftEdges = buildEdgeSignatureSet(leftDiagram.nodes, leftDiagram.edges);
  const rightEdges = buildEdgeSignatureSet(rightDiagram.nodes, rightDiagram.edges);

  const nodeSimilarity = jaccardSimilarity(leftNodes, rightNodes);
  const edgeSimilarity = jaccardSimilarity(leftEdges, rightEdges);

  return Number(((nodeSimilarity * 0.65) + (edgeSimilarity * 0.35)).toFixed(3));
}

export function computeRunStability(diagrams) {
  if (!diagrams || diagrams.length <= 1) {
    return 1;
  }

  const similarities = [];

  for (let leftIndex = 0; leftIndex < diagrams.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < diagrams.length; rightIndex += 1) {
      similarities.push(diagramSimilarity(diagrams[leftIndex], diagrams[rightIndex]));
    }
  }

  if (similarities.length === 0) {
    return 1;
  }

  const averageSimilarity = similarities.reduce((sum, value) => sum + value, 0) / similarities.length;
  return Number(averageSimilarity.toFixed(3));
}

export function summarizePromptRuns(promptSpec, runResults, connectionRules = canonicalConnectionRules) {
  const successfulRuns = runResults.filter(result => !result.error);
  const evaluatedRuns = successfulRuns.map(result => ({
    ...result,
    evaluation: evaluateDiagram(result, promptSpec, connectionRules)
  }));

  const averageScore = evaluatedRuns.length === 0
    ? 0
    : Math.round(
        evaluatedRuns.reduce((sum, result) => sum + result.evaluation.score, 0) / evaluatedRuns.length
      );

  const stability = computeRunStability(successfulRuns);
  const failedCheckCounts = new Map();

  evaluatedRuns.forEach(result => {
    result.evaluation.checks
      .filter(check => !check.passed)
      .forEach(check => {
        failedCheckCounts.set(check.key, (failedCheckCounts.get(check.key) || 0) + 1);
      });
  });

  const topFailures = [...failedCheckCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([key, count]) => ({ key, count }));

  return {
    id: promptSpec.id,
    source: promptSpec.source,
    prompt: promptSpec.prompt,
    metadata: promptSpec.metadata,
    runCount: runResults.length,
    successCount: successfulRuns.length,
    failureCount: runResults.length - successfulRuns.length,
    averageScore,
    stability,
    topFailures,
    runs: runResults.map(result => ({
      index: result.index,
      error: result.error || null,
      nodeCount: result.nodes?.length || 0,
      edgeCount: result.edges?.length || 0,
      score: result.evaluation?.score || null,
      failedChecks: result.evaluation
        ? result.evaluation.checks.filter(check => !check.passed)
        : []
    }))
  };
}
