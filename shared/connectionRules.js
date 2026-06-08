export const canonicalConnectionRules = [
  ['mobile', 'backend', true, null],
  ['mobile', 'frontend', true, 'Mobile-to-frontend may indicate server-rendered content or a webview.'],
  ['mobile', 'database', false, 'Mobile clients must never connect directly to the database.'],
  ['mobile', 'queue', false, 'Mobile clients must never connect directly to a queue.'],
  ['mobile', 'auth', true, 'Direct auth provider integration is valid, but verify the auth flow is intentional.'],
  ['mobile', 'storage', false, 'Direct storage access from mobile needs a backend or signed upload flow.'],
  ['mobile', 'external', true, 'Direct external integrations should be verified for security and resiliency.'],
  ['mobile', 'devops', false, 'Mobile should not connect to devops infrastructure directly.'],
  ['mobile', 'mobile', false, 'Peer-to-peer mobile connections are unusual in standard architectures.'],

  ['frontend', 'backend', true, null],
  ['frontend', 'mobile', false, 'Frontend should not connect to mobile clients directly.'],
  ['frontend', 'database', false, 'Frontend must never connect directly to the database.'],
  ['frontend', 'queue', false, 'Frontend must never connect directly to a queue.'],
  ['frontend', 'auth', true, 'Direct auth provider integration is valid, but verify the auth flow is intentional.'],
  ['frontend', 'storage', false, 'Direct storage access from frontend needs a backend or signed upload flow.'],
  ['frontend', 'external', true, 'Direct external integrations should be verified for security and resiliency.'],
  ['frontend', 'devops', false, 'Frontend should not connect to devops infrastructure directly.'],
  ['frontend', 'frontend', false, 'Frontend-to-frontend connections are unusual in standard architectures.'],

  ['backend', 'frontend', true, 'Backend-initiated connections to frontend (e.g., SSE, WebSocket) are valid.'],
  ['backend', 'mobile', true, 'Backend-initiated push to mobile (e.g., WebSocket, push notifications) is valid.'],
  ['backend', 'backend', true, 'Service-to-service links are valid, but protocol choice matters.'],
  ['backend', 'database', true, null],
  ['backend', 'queue', true, null],
  ['backend', 'auth', true, null],
  ['backend', 'storage', true, null],
  ['backend', 'external', true, null],
  ['backend', 'devops', true, 'Backend reporting to observability/monitoring is valid.'],

  ['database', 'database', true, 'Database-to-database links are valid for replication or synchronization.'],
  ['database', 'backend', false, 'Databases should not initiate application-layer connections.'],
  ['database', 'frontend', false, 'Databases must never initiate connections to frontends.'],
  ['database', 'mobile', false, 'Databases must never initiate connections to mobile clients.'],
  ['database', 'queue', false, 'Databases should not push directly to queues; use a backend trigger.'],
  ['database', 'auth', false, 'Databases should not initiate auth flows.'],
  ['database', 'storage', false, 'Database-to-storage links should go through a backend.'],
  ['database', 'external', false, 'Databases should not connect directly to external services.'],
  ['database', 'devops', true, 'Database metrics reporting to devops/monitoring is valid.'],

  ['queue', 'queue', true, 'Queue chaining is valid, but review whether the event topology is intentional.'],
  ['queue', 'backend', true, 'Queue-to-backend data flow represents a consumer subscription or worker polling pattern. This is valid in event-driven architectures.'],
  ['queue', 'frontend', false, 'Queues must never initiate frontend connections.'],
  ['queue', 'mobile', false, 'Queues must never initiate mobile connections.'],
  ['queue', 'database', false, 'Queues should not write directly to databases; use a backend worker.'],
  ['queue', 'auth', false, 'Queues should not initiate auth flows.'],
  ['queue', 'storage', false, 'Queues should not write directly to storage; use a backend worker.'],
  ['queue', 'external', false, 'Queues should not connect directly to external services.'],
  ['queue', 'devops', true, 'Queue metrics reporting to devops/monitoring is valid.'],

  ['auth', 'backend', true, 'Auth callbacks to backend for token verification are valid.'],
  ['auth', 'frontend', false, 'Auth providers should not initiate frontend application flows.'],
  ['auth', 'mobile', false, 'Auth providers should not initiate mobile application flows.'],
  ['auth', 'database', false, 'Auth providers should not connect to databases directly.'],
  ['auth', 'queue', false, 'Auth providers should not connect to queues directly.'],
  ['auth', 'storage', false, 'Auth providers should not connect to storage directly.'],
  ['auth', 'external', false, 'Auth providers should not connect to external services.'],
  ['auth', 'devops', true, 'Auth metrics reporting to monitoring is valid.'],
  ['auth', 'auth', true, 'Auth provider chaining (e.g., social login federation) is valid.'],

  ['storage', 'backend', true, 'Storage callbacks or signed URLs for backend consumption are valid.'],
  ['storage', 'frontend', false, 'Storage should not initiate frontend connections.'],
  ['storage', 'mobile', false, 'Storage should not initiate mobile connections.'],
  ['storage', 'database', false, 'Storage should not connect directly to databases.'],
  ['storage', 'queue', false, 'Storage should not push directly to queues.'],
  ['storage', 'auth', false, 'Storage should not initiate auth flows.'],
  ['storage', 'external', false, 'Storage should not connect directly to external services.'],
  ['storage', 'devops', true, 'Storage metrics reporting to monitoring is valid.'],
  ['storage', 'storage', true, 'Storage replication between regions is valid.'],

  ['external', 'backend', true, 'Webhook callbacks from external services to backend are valid.'],
  ['external', 'frontend', true, 'Direct frontend-to-external traffic should be reviewed for security, latency, and resilience.'],
  ['external', 'mobile', true, 'Direct mobile-to-external traffic should be reviewed for security.'],
  ['external', 'database', false, 'External services should not connect to databases directly.'],
  ['external', 'queue', false, 'External services should not connect to queues directly.'],
  ['external', 'auth', false, 'External services should not initiate auth flows.'],
  ['external', 'storage', false, 'External services should not connect directly to storage.'],
  ['external', 'devops', true, 'External service metrics to monitoring is valid.'],
  ['external', 'external', true, 'External-to-external chaining may represent service integrations.'],

  ['devops', 'frontend', true, 'Devops monitoring of frontend health is valid.'],
  ['devops', 'backend', true, 'Devops monitoring of backend health is valid.'],
  ['devops', 'mobile', true, 'Devops monitoring of mobile health is valid.'],
  ['devops', 'database', true, 'Devops monitoring of database health is valid.'],
  ['devops', 'queue', true, 'Devops monitoring of queue health is valid.'],
  ['devops', 'storage', true, 'Devops monitoring of storage health is valid.'],
  ['devops', 'auth', true, 'Devops monitoring of auth health is valid.'],
  ['devops', 'external', true, 'Devops monitoring of external integrations is valid.'],
  ['devops', 'devops', true, 'Devops tool-to-tool connections (e.g., Prometheus -> Grafana) are valid.']
];

export function connectionRuleTupleToObject([
  sourceCategory,
  targetCategory,
  isValid,
  warningMessage
]) {
  return {
    source_category: sourceCategory,
    target_category: targetCategory,
    is_valid: isValid,
    warning_message: warningMessage
  };
}

export const canonicalConnectionRuleObjects = canonicalConnectionRules.map(connectionRuleTupleToObject);
