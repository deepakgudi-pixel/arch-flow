import { callOpenRouter, DIAGRAM_MODEL, robustParseJSON } from './openRouter.js';
import {
  DIAGRAM_SYSTEM_PROMPT,
  buildDiagramUserMessage
} from './diagramGenerator/promptBuilder.js';
import { normalizeDiagramStructure } from './diagramGenerator/diagramNormalizer.js';
import { hardenNormalizedDiagramForReview } from './diagramGenerator/diagramHardener.js';
import { applyDomainBlueprint } from './diagramGenerator/domainBlueprints.js';
import { applyPromptCapabilityRequirements } from './diagramGenerator/capabilityCompletion.js';
import { applyWorkflowRelationships } from './diagramGenerator/workflowRelationships.js';
import {
  generateEdgesFromDiagram,
  generateNodesFromDiagram
} from './diagramGenerator/diagramLayout.js';
import {
  DIAGRAM_RESPONSE_SCHEMA,
  JSON_SCHEMA_HINT,
  assertReviewSafeGeneration,
  buildJsonRepairMessages,
  validateNormalizedDiagram
} from './diagramGenerator/generationReviewGate.js';

export {
  DIAGRAM_SYSTEM_PROMPT,
  buildDiagramUserMessage,
  generateEdgesFromDiagram,
  generateNodesFromDiagram,
  hardenNormalizedDiagramForReview
};

function parseAttemptCount(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function generateDiagramFromPrompt({
  description,
  template,
  model = DIAGRAM_MODEL,
  onChunk,
  signal,
  callModel = callOpenRouter
} = {}) {
  const userMessage = buildDiagramUserMessage(description, template);
  const messages = [
    { role: 'system', content: DIAGRAM_SYSTEM_PROMPT },
    { role: 'user', content: userMessage }
  ];

  let lastError = null;
  let resolvedModel = model;
  let rawResponse = '';
  let currentMessages = messages;
  const maxAttempts = parseAttemptCount(process.env.OPENROUTER_DIAGRAM_MAX_ATTEMPTS, 4);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await callModel(
      currentMessages,
      attempt === 1 ? model : DIAGRAM_MODEL,
      onChunk,
      signal,
      true,
      {
        responseSchema: DIAGRAM_RESPONSE_SCHEMA
      }
    );
    rawResponse = response.content;
    resolvedModel = response.model || model;

    try {
      const parsed = robustParseJSON(rawResponse);
      const normalizedDiagram = normalizeDiagramStructure(parsed);
      const domainTuned = applyDomainBlueprint(normalizedDiagram, { description, template });
      const capabilityTuned = applyPromptCapabilityRequirements(
        domainTuned.diagram,
        { description, template }
      );
      const workflowTuned = applyWorkflowRelationships(
        capabilityTuned.diagram,
        { description, template }
      );
      const hardened = hardenNormalizedDiagramForReview(workflowTuned.diagram, { description, template });

      assertReviewSafeGeneration(hardened);
      validateNormalizedDiagram(hardened.diagram);

      const nodes = generateNodesFromDiagram(hardened.diagram.nodes);
      const edges = generateEdgesFromDiagram(hardened.diagram.nodes, hardened.diagram.edges, nodes);

      return {
        model: resolvedModel,
        rawResponse,
        userMessage,
        nodes,
        edges,
        quality: hardened.quality,
        autoFixes: [...domainTuned.changes, ...capabilityTuned.changes, ...workflowTuned.changes, ...hardened.changes].length > 0
          ? [...domainTuned.changes, ...capabilityTuned.changes, ...workflowTuned.changes, ...hardened.changes]
          : undefined
      };
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      currentMessages = buildJsonRepairMessages(messages, rawResponse, error.message, JSON_SCHEMA_HINT);
    }
  }

  const failure = new Error(
    `Failed to produce a review-safe AI diagram after ${maxAttempts} attempt(s): ${lastError?.message || 'Unknown generation error'}`
  );
  failure.rawResponse = rawResponse;
  failure.model = resolvedModel;
  throw failure;
}
