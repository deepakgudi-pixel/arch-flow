export const JSON_SCHEMA_HINT = `{"nodes":[{"name":"TECH_NAME","category":"mobile|frontend|backend|database|queue|auth|storage|external|devops","role":"function","reason":"justification","icon":"icon-name"}],"edges":[{"source":"TECH_NAME","target":"TECH_NAME","label":"PROTOCOL"}]}`;

export function validateNormalizedDiagram(diagram) {
  if (!Array.isArray(diagram.nodes) || diagram.nodes.length === 0) {
    throw new Error('Generated architecture did not contain any valid nodes.');
  }

  if (diagram.nodes.length > 1 && diagram.edges.length === 0) {
    throw new Error('Generated architecture contained nodes but no valid connections.');
  }
}

export function assertReviewSafeGeneration(hardened) {
  const activeFindings = hardened.quality.findings
    .filter(finding => finding.severity === 'critical' || finding.severity === 'warning');

  if (activeFindings.length > 0 || hardened.quality.score.score < 100) {
    const findingTitles = activeFindings.map(finding => finding.title).join(', ') || `score ${hardened.quality.score.score}/100`;
    throw new Error(`Generated architecture failed deterministic review gate: ${findingTitles}`);
  }
}

export function buildJsonRepairMessages(messages, rawResponse, errorMessage, schemaHint = JSON_SCHEMA_HINT) {
  return [
    ...messages,
    { role: 'assistant', content: rawResponse },
    {
      role: 'user',
      content: `Your previous response could not be accepted (${errorMessage}). Return ONLY valid JSON matching this shape: ${schemaHint}. Do not include markdown fences, prose, duplicate objects, or explanations. The diagram must have no rule violations, no direct client-to-database links, no isolated nodes, queue producer and consumer paths, and all production support layers needed to score 100/100.`
    }
  ];
}
