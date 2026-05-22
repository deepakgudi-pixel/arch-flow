import { callOpenRouter, DIAGRAM_MODEL, robustParseJSON } from './openRouter.js';
import {
  DIAGRAM_SYSTEM_PROMPT,
  buildDiagramUserMessage
} from './diagramGenerator/promptBuilder.js';
import { normalizeDiagramStructure } from './diagramGenerator/diagramNormalizer.js';
import { hardenNormalizedDiagramForReview } from './diagramGenerator/diagramHardener.js';
import {
  generateEdgesFromDiagram,
  generateNodesFromDiagram
} from './diagramGenerator/diagramLayout.js';
import {
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
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await callModel(
      currentMessages,
      attempt === 1 ? model : DIAGRAM_MODEL,
      attempt === 1 ? onChunk : undefined,
      signal,
      true
    );
    rawResponse = response.content;
    resolvedModel = response.model || model;

    try {
      const parsed = robustParseJSON(rawResponse);
      const normalizedDiagram = normalizeDiagramStructure(parsed);
      const hardened = hardenNormalizedDiagramForReview(normalizedDiagram);

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
        autoFixes: hardened.changes.length > 0 ? hardened.changes : undefined
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
