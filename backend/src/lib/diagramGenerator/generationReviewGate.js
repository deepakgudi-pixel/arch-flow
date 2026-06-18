export const JSON_SCHEMA_HINT = `{"nodes":[{"name":"TECH_NAME","category":"mobile|frontend|backend|database|queue|auth|storage|external|devops","role":"function","reason":"justification","icon":"icon-name"}],"edges":[{"source":"TECH_NAME","target":"TECH_NAME","label":"PROTOCOL"}]}`;

export const DIAGRAM_RESPONSE_SCHEMA = {
  name: 'archflow_diagram',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['nodes', 'edges'],
    properties: {
      nodes: {
        type: 'array',
        minItems: 1,
        maxItems: 20,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'category', 'role', 'reason', 'icon'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 48,
              description: 'Unique uppercase component identifier. Use exact technology names for infrastructure and semantic names such as LEDGER_SERVICE for domain services.'
            },
            category: {
              type: 'string',
              enum: ['mobile', 'frontend', 'backend', 'database', 'queue', 'auth', 'storage', 'external', 'devops']
            },
            role: {
              type: 'string',
              minLength: 1,
              maxLength: 80
            },
            reason: {
              type: 'string',
              minLength: 1,
              maxLength: 120
            },
            icon: {
              type: 'string',
              minLength: 1,
              maxLength: 40
            }
          }
        }
      },
      edges: {
        type: 'array',
        minItems: 1,
        maxItems: 40,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['source', 'target', 'label'],
          properties: {
            source: {
              type: 'string',
              minLength: 1,
              maxLength: 48
            },
            target: {
              type: 'string',
              minLength: 1,
              maxLength: 48
            },
            label: {
              type: 'string',
              minLength: 1,
              maxLength: 24,
              description: 'Protocol label such as HTTPS, WEBSOCKET, SQL, TCP, KAFKA, S3, OIDC, HTTP, gRPC.'
            }
          }
        }
      }
    }
  }
};

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
