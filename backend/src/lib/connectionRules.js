export const canonicalConnectionRules = [
  ['frontend', 'backend', true, null],
  ['frontend', 'database', false, 'Frontend should not connect directly to the database.'],
  ['frontend', 'queue', false, 'Frontend should not connect directly to a queue.'],
  ['frontend', 'auth', true, 'Direct auth provider integration is valid, but verify the auth flow is intentional.'],
  ['frontend', 'storage', false, 'Direct storage access usually needs a backend or signed upload flow.'],
  ['frontend', 'external', true, 'Direct external integrations should be verified for security and resiliency.'],
  ['mobile', 'backend', true, null],
  ['mobile', 'database', false, 'Mobile clients should not connect directly to the database.'],
  ['mobile', 'queue', false, 'Mobile clients should not connect directly to a queue.'],
  ['mobile', 'auth', true, 'Direct auth provider integration is valid, but verify the auth flow is intentional.'],
  ['mobile', 'storage', false, 'Direct storage access usually needs a backend or signed upload flow.'],
  ['mobile', 'external', true, 'Direct external integrations should be verified for security and resiliency.'],
  ['backend', 'frontend', true, null],
  ['backend', 'backend', true, 'Service-to-service links are valid, but protocol choice matters.'],
  ['backend', 'database', true, null],
  ['backend', 'queue', true, null],
  ['backend', 'auth', true, null],
  ['backend', 'storage', true, null],
  ['backend', 'external', true, null],
  ['database', 'database', true, 'Database-to-database links are valid, but verify replication or synchronization intent.'],
  ['database', 'backend', false, 'Databases should not initiate application-layer connections.'],
  ['queue', 'queue', true, 'Queue chaining is valid, but review whether the event topology is intentional.'],
  ['queue', 'backend', false, 'Queues should not initiate application-layer connections.'],
  ['devops', 'frontend', true, null],
  ['devops', 'backend', true, null],
  ['devops', 'database', true, null],
  ['devops', 'queue', true, null],
  ['devops', 'storage', true, null],
  ['devops', 'auth', true, null],
  ['auth', 'backend', true, null],
  ['auth', 'frontend', false, 'Auth providers should not initiate frontend application flows.'],
  ['storage', 'backend', true, null],
  ['storage', 'frontend', false, 'Storage providers should not initiate frontend application flows.'],
  ['external', 'backend', true, null],
  ['external', 'frontend', true, 'Direct frontend-to-external traffic should be reviewed for security, latency, and resilience.']
];

export async function syncCanonicalConnectionRules(pool) {
  for (const [sourceCategory, targetCategory, isValid, warningMessage] of canonicalConnectionRules) {
    await pool.query(
      `INSERT INTO connection_rules (source_category, target_category, is_valid, warning_message)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (source_category, target_category)
       DO UPDATE SET
         is_valid = EXCLUDED.is_valid,
         warning_message = EXCLUDED.warning_message`,
      [sourceCategory, targetCategory, isValid, warningMessage]
    );
  }
}
