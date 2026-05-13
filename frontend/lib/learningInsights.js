import { formatTechDisplayLabel } from '@/lib/displayNames';

function normalize(value) {
  return String(value || '').trim().toUpperCase();
}

function getNodeCategory(node) {
  return node?.data?.category || node?.category || 'unknown';
}

function getNodeLabel(node) {
  const category = getNodeCategory(node);
  const label = node?.data?.label || node?.name || node?.id || 'Unknown';

  return formatTechDisplayLabel(label, category) || String(label);
}

function getNodeId(node) {
  return node?.id || node?.name || node?.data?.label || '';
}

function getNodeById(nodes) {
  return new Map((nodes || []).map(node => [getNodeId(node), node]));
}

function getNodesByCategory(nodes, category) {
  return (nodes || []).filter(node => getNodeCategory(node) === category);
}

function pickNode(nodes, categories) {
  return (nodes || []).find(node => categories.includes(getNodeCategory(node))) || null;
}

function formatNodeList(nodes, limit = 3) {
  const labels = (nodes || []).map(getNodeLabel).filter(Boolean);

  if (labels.length === 0) {
    return '';
  }

  const visible = labels.slice(0, limit).join(', ');
  const remaining = labels.length - limit;

  return remaining > 0 ? `${visible}, +${remaining} more` : visible;
}

function findEdgesBetween(edges, nodeById, sourceCategories, targetCategories) {
  return (edges || []).filter(edge => {
    const sourceNode = nodeById.get(edge.source);
    const targetNode = nodeById.get(edge.target);

    return sourceNode &&
      targetNode &&
      sourceCategories.includes(getNodeCategory(sourceNode)) &&
      targetCategories.includes(getNodeCategory(targetNode));
  });
}

function describeEdge(edge, nodeById) {
  const sourceNode = nodeById.get(edge.source);
  const targetNode = nodeById.get(edge.target);
  const sourceLabel = sourceNode ? getNodeLabel(sourceNode) : edge.source;
  const targetLabel = targetNode ? getNodeLabel(targetNode) : edge.target;
  const protocol = edge.label ? ` over ${edge.label}` : '';

  return `${sourceLabel} -> ${targetLabel}${protocol}`;
}

export function buildDiagramStudyGuide(nodes = [], edges = []) {
  const studyNodes = nodes || [];
  const studyEdges = edges || [];

  if (studyNodes.length === 0) {
    return [];
  }

  const nodeById = getNodeById(studyNodes);
  const clientNodes = [
    ...getNodesByCategory(studyNodes, 'frontend'),
    ...getNodesByCategory(studyNodes, 'mobile'),
  ];
  const backendNodes = getNodesByCategory(studyNodes, 'backend');
  const databaseNodes = getNodesByCategory(studyNodes, 'database');
  const queueNodes = getNodesByCategory(studyNodes, 'queue');
  const authNodes = getNodesByCategory(studyNodes, 'auth');
  const storageNodes = getNodesByCategory(studyNodes, 'storage');
  const externalNodes = getNodesByCategory(studyNodes, 'external');
  const devopsNodes = getNodesByCategory(studyNodes, 'devops');
  const guide = [];

  const clientBackendEdges = findEdgesBetween(
    studyEdges,
    nodeById,
    ['frontend', 'mobile'],
    ['backend']
  );
  const primaryClient = clientNodes[0];
  const primaryBackend = backendNodes[0];

  if (clientBackendEdges.length > 0) {
    guide.push({
      title: 'Entry Flow',
      detail: `${describeEdge(clientBackendEdges[0], nodeById)} is the main user-facing request path. This keeps the client focused on experience while the backend owns validation, authorization, and downstream orchestration.`,
      inspect: 'Follow this path first when explaining the system in an interview or design review.',
    });
  } else if (primaryClient && primaryBackend) {
    guide.push({
      title: 'Entry Flow',
      detail: `${getNodeLabel(primaryClient)} and ${getNodeLabel(primaryBackend)} are both present, but their request path is not explicit yet.`,
      inspect: 'Add a clear HTTPS, GraphQL, or WebSocket connection so readers know how users enter the system.',
    });
  }

  const backendDatabaseEdges = findEdgesBetween(
    studyEdges,
    nodeById,
    ['backend'],
    ['database']
  );
  const cacheNodes = databaseNodes.filter(node => ['REDIS', 'MEMCACHED'].includes(normalize(node?.data?.label || node?.name)));
  const durableDataNodes = databaseNodes.filter(node => !cacheNodes.includes(node));

  if (backendDatabaseEdges.length > 0) {
    const dataStores = formatNodeList(durableDataNodes.length > 0 ? durableDataNodes : databaseNodes);
    const cacheText = cacheNodes.length > 0
      ? ` ${formatNodeList(cacheNodes)} handles hot data or session-style access so the durable stores avoid unnecessary load.`
      : '';

    guide.push({
      title: 'Data Path',
      detail: `After the application layer accepts a request, it reads or writes state through ${dataStores}.${cacheText}`,
      inspect: 'Ask what data needs transactions, what can be cached, and what recovery looks like after failure.',
    });
  } else if (databaseNodes.length > 0) {
    guide.push({
      title: 'Data Path',
      detail: `${formatNodeList(databaseNodes)} exists, but the diagram does not show which application service owns data access.`,
      inspect: 'Connect data stores through a backend so the trust boundary stays visible.',
    });
  }

  if (authNodes.length > 0) {
    const authEdges = findEdgesBetween(
      studyEdges,
      nodeById,
      ['frontend', 'mobile', 'backend'],
      ['auth']
    );
    guide.push({
      title: 'Identity Boundary',
      detail: `${formatNodeList(authNodes)} makes sign-in, sessions, and permission checks explicit.${authEdges.length > 0 ? ` Example path: ${describeEdge(authEdges[0], nodeById)}.` : ''}`,
      inspect: 'Check who receives tokens, who validates them, and which layer enforces permissions.',
    });
  } else if (clientNodes.length > 0) {
    guide.push({
      title: 'Identity Boundary',
      detail: 'The system has a user-facing surface but no explicit auth layer in the diagram.',
      inspect: 'For most production apps, model sign-in and token validation before trusting user actions.',
    });
  }

  if (queueNodes.length > 0) {
    const producerEdges = findEdgesBetween(studyEdges, nodeById, ['backend', 'external', 'queue'], ['queue']);
    const consumerEdges = findEdgesBetween(studyEdges, nodeById, ['queue'], ['backend', 'queue']);
    guide.push({
      title: 'Async Work',
      detail: `${formatNodeList(queueNodes)} decouples work that does not need to block the user request.${producerEdges.length > 0 ? ` Producer: ${describeEdge(producerEdges[0], nodeById)}.` : ''}${consumerEdges.length > 0 ? ` Consumer: ${describeEdge(consumerEdges[0], nodeById)}.` : ''}`,
      inspect: 'Look for retries, idempotency, dead-letter handling, and queue lag monitoring.',
    });
  }

  if (storageNodes.length > 0) {
    const storageEdges = findEdgesBetween(studyEdges, nodeById, ['backend', 'frontend', 'mobile'], ['storage']);
    guide.push({
      title: 'Files And Assets',
      detail: `${formatNodeList(storageNodes)} keeps uploads, media, exports, or binary assets outside the transactional database path.${storageEdges.length > 0 ? ` Access path: ${describeEdge(storageEdges[0], nodeById)}.` : ''}`,
      inspect: 'Check whether clients use signed URLs and whether the backend controls scope and expiry.',
    });
  }

  if (externalNodes.length > 0) {
    const externalEdges = findEdgesBetween(studyEdges, nodeById, ['backend', 'frontend', 'mobile'], ['external']);
    guide.push({
      title: 'External Dependencies',
      detail: `${formatNodeList(externalNodes)} adds managed capability outside your system boundary.${externalEdges.length > 0 ? ` Integration path: ${describeEdge(externalEdges[0], nodeById)}.` : ''}`,
      inspect: 'Ask what happens during vendor downtime, retries, duplicate callbacks, and reconciliation.',
    });
  }

  if (devopsNodes.length > 0) {
    guide.push({
      title: 'Operations Layer',
      detail: `${formatNodeList(devopsNodes)} makes the architecture operable: traffic, deployment, monitoring, alerts, or runtime health are visible instead of implied.`,
      inspect: 'In production, explain how the team detects failures and safely rolls out changes.',
    });
  }

  if (guide.length === 0) {
    const firstNode = pickNode(studyNodes, ['backend', 'frontend', 'mobile', 'database']) || studyNodes[0];
    guide.push({
      title: 'Start Here',
      detail: `${getNodeLabel(firstNode)} is present. Add explicit connections so the diagram can teach request flow, data ownership, and failure boundaries.`,
      inspect: 'A useful system diagram says who calls whom, over what protocol, and why that boundary exists.',
    });
  }

  return guide.slice(0, 6);
}

export function getLayerLearningProfile(category, label = '') {
  const displayName = String(label || 'This layer').trim() || 'This layer';

  const profiles = {
    mobile: {
      principle: 'Mobile clients should stay thin: they present workflows, collect input, and call trusted service APIs.',
      responsibilities: 'UI state, local device capabilities, offline hints, and authenticated API calls.',
      scalingCue: 'When mobile usage grows, protect battery, network retries, payload size, and version compatibility.',
      commonMistake: 'Do not let the app talk directly to databases, queues, or private infrastructure.',
      inspectQuestion: `What user journey starts in ${displayName}, and which backend owns the trusted work?`,
    },
    frontend: {
      principle: 'Frontend layers shape the user experience while leaving private data access and business rules behind an API boundary.',
      responsibilities: 'Rendering, interaction state, routing, forms, and calls to backend or identity services.',
      scalingCue: 'At scale, watch bundle size, caching, edge delivery, and API round trips.',
      commonMistake: 'Avoid direct database, queue, or raw storage access unless a backend issues scoped credentials.',
      inspectQuestion: `Which backend or BFF does ${displayName} rely on for secure operations?`,
    },
    backend: {
      principle: 'Backends are the control plane: they enforce rules, orchestrate dependencies, and protect downstream systems.',
      responsibilities: 'Business logic, API contracts, authorization checks, validation, orchestration, and retries.',
      scalingCue: 'Split or offload work when one service owns too many slow or failure-prone downstream paths.',
      commonMistake: 'Do not turn one backend into the place where every synchronous dependency blocks user requests.',
      inspectQuestion: `Which decisions and integrations does ${displayName} own?`,
    },
    database: {
      principle: 'Databases preserve system state and should usually be reached through application services, not clients.',
      responsibilities: 'Durable records, indexes, transactions, query patterns, and consistency boundaries.',
      scalingCue: 'At scale, watch hot tables, read/write split, replication, backup recovery, and query latency.',
      commonMistake: 'A database is not an application layer; it should not initiate product workflows by itself.',
      inspectQuestion: `What data model, consistency expectation, and access pattern justify ${displayName}?`,
    },
    queue: {
      principle: 'Queues decouple producers from consumers so background work can survive bursts, retries, and partial failures.',
      responsibilities: 'Buffering jobs/events, retrying work, smoothing spikes, and enabling async processing.',
      scalingCue: 'Healthy queues need visible producers, consumers, retry policy, dead-letter handling, and lag monitoring.',
      commonMistake: 'A queue with no producer or no consumer is not a flow; it is an unverified placeholder.',
      inspectQuestion: `Who publishes to ${displayName}, and who drains it?`,
    },
    auth: {
      principle: 'Auth centralizes identity so clients and services can make trusted authorization decisions.',
      responsibilities: 'Login, sessions, tokens, roles, permissions, and identity provider integration.',
      scalingCue: 'For larger systems, inspect token lifetime, refresh flow, tenant isolation, and service-to-service trust.',
      commonMistake: 'Do not treat auth as only a login screen; it is part of every protected data path.',
      inspectQuestion: `Which components trust ${displayName}, and what claims do they receive?`,
    },
    storage: {
      principle: 'Object storage keeps unstructured files out of transactional databases and scales asset delivery separately.',
      responsibilities: 'Uploads, media, exports, documents, backups, and large binary assets.',
      scalingCue: 'At scale, look for signed URLs, lifecycle policy, CDN delivery, virus scanning, and access scope.',
      commonMistake: 'Client uploads need a signing/control plane; raw bucket access is rarely acceptable.',
      inspectQuestion: `What assets does ${displayName} store, and who is allowed to read or write them?`,
    },
    external: {
      principle: 'External services add capability but also introduce third-party latency, failure modes, and trust boundaries.',
      responsibilities: 'Payments, emails, maps, search, analytics, fraud checks, or other managed capabilities.',
      scalingCue: 'Protect external calls with timeouts, retries, idempotency keys, webhooks, and fallback behavior.',
      commonMistake: 'Do not hide critical product state inside a vendor without modeling callbacks and reconciliation.',
      inspectQuestion: `What happens if ${displayName} is slow, down, or sends a duplicate webhook?`,
    },
    devops: {
      principle: 'Devops and observability layers make the system operable, measurable, deployable, and recoverable.',
      responsibilities: 'Traffic routing, monitoring, logging, deployment, alerting, infrastructure, and runtime health.',
      scalingCue: 'Production systems need clear metrics, logs, traces, rollout strategy, and incident feedback loops.',
      commonMistake: 'Do not leave operations implicit; a diagram without observability is hard to trust.',
      inspectQuestion: `What does ${displayName} tell the team during an incident?`,
    },
  };

  return profiles[category] || {
    principle: `${displayName} fills a focused responsibility in the architecture.`,
    responsibilities: 'Clarify what this unit owns, what it depends on, and what it should not own.',
    scalingCue: 'At scale, make the ownership boundary and failure behavior explicit.',
    commonMistake: 'Avoid vague boxes that do not map to a real responsibility.',
    inspectQuestion: `What would break if ${displayName} disappeared?`,
  };
}

export function getProtocolLearningProfile(protocolLabel, sourceCategory, targetCategory) {
  const protocol = normalize(protocolLabel);
  const categories = `${sourceCategory || 'source'} to ${targetCategory || 'target'}`;

  if (protocol.includes('GRAPHQL')) {
    return {
      summary: 'GraphQL lets callers ask for a shaped response through a typed API contract.',
      whenToUse: `Good for ${categories} flows where clients need flexible response shapes without many endpoint variants.`,
      watchOut: 'Watch authorization at field level, query cost, caching complexity, and accidental over-flexibility.',
    };
  }

  if (protocol.includes('WEBSOCKET')) {
    return {
      summary: 'WebSocket keeps a persistent connection open for low-latency bidirectional updates.',
      whenToUse: `Good for ${categories} flows with presence, collaboration, live dashboards, chat, or realtime state.`,
      watchOut: 'Plan connection fan-out, reconnect behavior, backpressure, and how state is recovered after disconnects.',
    };
  }

  if (protocol.includes('GRPC') || protocol.includes('RPC')) {
    return {
      summary: 'RPC-style protocols favor explicit service contracts and efficient internal calls.',
      whenToUse: `Good for service-to-service ${categories} communication where both sides are controlled by the same team.`,
      watchOut: 'Version contracts carefully and avoid coupling unrelated services too tightly.',
    };
  }

  if (protocol.includes('SQL')) {
    return {
      summary: 'SQL means an application service is querying or mutating relational data.',
      whenToUse: 'Good when the target datastore needs transactions, joins, constraints, and strong query semantics.',
      watchOut: 'Watch slow queries, missing indexes, connection pools, transaction scope, and direct client access.',
    };
  }

  if (protocol.includes('MONGO')) {
    return {
      summary: 'Mongo-style access usually points to document-oriented data reads and writes.',
      whenToUse: 'Good for flexible document models and high-volume reads where relational joins are not central.',
      watchOut: 'Model indexes, document growth, consistency expectations, and schema drift explicitly.',
    };
  }

  if (protocol.includes('KAFKA')) {
    return {
      summary: 'Kafka carries durable event streams between producers and consumers.',
      whenToUse: 'Good for analytics pipelines, event sourcing, fan-out, replay, and high-throughput async workflows.',
      watchOut: 'Every topic needs producers, consumers, retention policy, schema evolution, and lag monitoring.',
    };
  }

  if (protocol.includes('AMQP') || protocol.includes('SQS') || protocol.includes('PUB') || protocol.includes('ASYNC')) {
    return {
      summary: 'Message queues move work off the synchronous request path.',
      whenToUse: 'Good for background jobs, retries, email, notifications, media processing, and burst absorption.',
      watchOut: 'Define retry limits, idempotency, dead-letter handling, and worker scaling.',
    };
  }

  if (protocol.includes('OIDC') || protocol.includes('OAUTH') || protocol.includes('SAML') || protocol.includes('JWT')) {
    return {
      summary: 'Identity protocols exchange user or service trust through tokens and claims.',
      whenToUse: `Good for ${categories} flows where sign-in, session validation, delegated access, or SSO matters.`,
      watchOut: 'Check token lifetime, audience, refresh behavior, callback URLs, and permission boundaries.',
    };
  }

  if (protocol.includes('S3') || protocol.includes('BLOB') || protocol.includes('BUCKET')) {
    return {
      summary: 'Object-storage protocols move unstructured files outside the transactional data path.',
      whenToUse: 'Good for images, videos, documents, exports, backups, and large user-generated assets.',
      watchOut: 'Use scoped credentials or signed URLs; avoid exposing broad bucket permissions to clients.',
    };
  }

  if (protocol.includes('WEBHOOK')) {
    return {
      summary: 'Webhooks let an external system call back into your backend when an event happens.',
      whenToUse: 'Good for payments, email events, fraud checks, subscription lifecycle, and vendor callbacks.',
      watchOut: 'Verify signatures, handle duplicate delivery, retry safely, and reconcile final state.',
    };
  }

  if (protocol.includes('HTTPS') || protocol.includes('HTTP') || protocol.includes('REST')) {
    return {
      summary: 'HTTP-style calls are direct request-response interactions.',
      whenToUse: `Good for ${categories} flows that need immediate answers and simple operational visibility.`,
      watchOut: 'Add timeouts, authentication, rate limits, retries only where safe, and avoid long blocking chains.',
    };
  }

  if (protocol.includes('TCP')) {
    return {
      summary: 'TCP usually signals a lower-level service connection where the application protocol sits above the socket.',
      whenToUse: 'Good for caches, databases, internal services, and managed infrastructure protocols.',
      watchOut: 'Make connection pooling, timeouts, encryption, and network boundaries explicit.',
    };
  }

  return {
    summary: 'This protocol label names the interaction pattern between two architecture units.',
    whenToUse: `Use it when it accurately describes the ${categories} flow and helps readers trust the data path.`,
    watchOut: 'Avoid vague labels. A useful diagram says what moves, who owns it, and what can fail.',
  };
}

export function getFindingLearningProfile(title) {
  const key = normalize(title);
  const profiles = {
    NO_DATA_FLOW: {
      why: 'A system diagram without flow cannot explain how users, data, or background work move through the system.',
      fix: 'Connect the primary client to an application layer, then connect that layer to data, auth, storage, and async dependencies.',
    },
    FRONTEND_DIRECT_TO_DATABASE: {
      why: 'Direct browser-to-database access bypasses server-side validation, authorization, rate limits, and secret management.',
      fix: 'Insert a backend or BFF and move database access behind that trusted service boundary.',
    },
    MOBILE_DIRECT_TO_DATABASE: {
      why: 'Mobile apps are untrusted clients. They can be reverse engineered, run old versions, and lose network consistency.',
      fix: 'Route mobile traffic through an application API that owns validation, authorization, retries, and data access.',
    },
    RULE_VIOLATION: {
      why: 'This connection crosses categories in a way that usually breaks trust boundaries or operational ownership.',
      fix: 'Route the flow through the layer that should own that responsibility, usually a backend or controlled service.',
    },
    GENERIC_PROTOCOL_LABEL: {
      why: 'A vague protocol label hides how the system actually behaves, which makes review and debugging harder.',
      fix: 'Use a real interaction label such as HTTPS, SQL, OIDC, S3, Kafka, AMQP, GraphQL, or WebSocket.',
    },
    ISOLATED_NODE: {
      why: 'Disconnected components look important but do not explain their role in the system flow.',
      fix: 'Connect the unit to the service that produces, consumes, observes, or depends on it.',
    },
    MISSING_APPLICATION_LAYER: {
      why: 'Clients and databases need a trusted application boundary between presentation and persistence.',
      fix: 'Add a backend/API/BFF layer and route all data access through it.',
    },
    MISSING_BACKEND_LAYER: {
      why: 'Client surfaces need somewhere to enforce product logic, validation, authentication, and downstream orchestration.',
      fix: 'Add an API/backend layer before modeling databases, queues, storage, and external dependencies.',
    },
    FRONTEND_ONLY_ARCHITECTURE: {
      why: 'Frontend-only diagrams are useful for UI scope, but they do not represent a complete production system.',
      fix: 'Add backend, data, auth, and operational layers that support the user-facing experience.',
    },
    NO_AUTH_LAYER: {
      why: 'Client-facing systems usually need an explicit identity boundary so access decisions are visible.',
      fix: 'Add an auth provider and show how clients sign in and how backends validate identity.',
    },
    NO_OBSERVABILITY_LAYER: {
      why: 'Once a system has several moving parts, teams need metrics, logs, traces, and alerts to operate it.',
      fix: 'Add observability or delivery tooling such as Prometheus, Grafana, Datadog, Sentry, or logging infrastructure.',
    },
    SINGLE_DATASTORE_PRESSURE: {
      why: 'A single datastore can become a throughput, latency, or failure bottleneck as responsibilities grow.',
      fix: 'Add cache, read replicas, specialized stores, or queue-backed async processing depending on the workload.',
    },
    QUEUE_WITHOUT_PRODUCER: {
      why: 'A queue is only meaningful if something clearly publishes work into it.',
      fix: 'Connect the backend, external webhook, or upstream service that creates events or jobs.',
    },
    QUEUE_WITHOUT_CONSUMER: {
      why: 'Queued work must be drained by workers or services, otherwise the diagram stops at buffering.',
      fix: 'Add or connect a worker/backend consumer that processes messages and handles retries.',
    },
    LIMITED_ASYNC_SCALING_PATH: {
      why: 'Synchronous request paths become fragile when they also own slow background work or fan-out.',
      fix: 'Add a queue/event stream and move deferred work to workers.',
    },
    CENTRAL_BACKEND_CHOKE_POINT: {
      why: 'One backend owning many downstream dependencies can become a scaling and failure concentration point.',
      fix: 'Split responsibilities or offload heavy/background tasks through a queue and workers.',
    },
    MISSING_TRAFFIC_MANAGEMENT: {
      why: 'Larger systems need a visible entry point for routing, load balancing, caching, and edge control.',
      fix: 'Add NGINX, Cloudflare, CDN, API gateway, or load balancing infrastructure.',
    },
    NO_STORAGE_LAYER: {
      why: 'User files and large assets should not live in the same path as transactional application data.',
      fix: 'Add object storage and connect it through the backend or a signed upload flow.',
    },
    MISSING_STORAGE_CONTROL_PLANE: {
      why: 'Signed storage access still needs a trusted service to issue scoped, short-lived credentials.',
      fix: 'Add or connect a backend that grants signed URLs and enforces upload/download policy.',
    },
    SIGNED_STORAGE_PATH: {
      why: 'Signed URLs can be safe when the backend limits who can access which object and for how long.',
      fix: 'Verify expiry, scope, content validation, and whether direct upload is intentionally allowed.',
    },
    MISSING_CACHE_LAYER: {
      why: 'Multiple databases without cache can overload hot paths and increase latency.',
      fix: 'Add Redis or Memcached for hot reads, sessions, rate limits, or derived data where appropriate.',
    },
    MISSING_ASYNC_PROCESSING: {
      why: 'Multiple backend services often need an event bus or queue to avoid tight coupling.',
      fix: 'Add Kafka, RabbitMQ, SQS, or a job queue and model producers plus consumers.',
    },
  };

  if (key.includes('OBJECT STORAGE') || (key.includes('STORAGE') && key.includes('MISSING'))) {
    return profiles.NO_STORAGE_LAYER;
  }
  if (key.includes('CACHE') && key.includes('MISSING')) {
    return profiles.MISSING_CACHE_LAYER;
  }
  if (key.includes('AUTH') && key.includes('MISSING')) {
    return profiles.NO_AUTH_LAYER;
  }
  if ((key.includes('OBSERVABILITY') || key.includes('MONITORING')) && key.includes('MISSING')) {
    return profiles.NO_OBSERVABILITY_LAYER;
  }
  if (key.includes('BACKEND') && key.includes('MISSING')) {
    return profiles.MISSING_BACKEND_LAYER;
  }

  return profiles[key] || {
    why: 'This finding points to a place where the diagram needs a clearer responsibility, trust boundary, or operational story.',
    fix: 'Inspect the connected units, name the flow precisely, and add the missing control layer if the responsibility is implicit.',
  };
}

export function buildReviewLearningSummary(findings = [], nodeCount = 0, edgeCount = 0) {
  const activeFindings = findings.filter(finding => finding.severity === 'critical' || finding.severity === 'warning');

  if (nodeCount === 0) {
    return {
      title: 'Start With Responsibilities',
      detail: 'A good system design begins by naming the major responsibilities before choosing exact technologies.',
    };
  }

  if (activeFindings.length === 0) {
    return {
      title: 'Readable Production Baseline',
      detail: `This diagram has ${nodeCount} components and ${edgeCount} connections with no active rule violations. Use the sidebars to inspect why each unit exists and what each protocol means.`,
    };
  }

  const firstFinding = activeFindings[0];
  const learning = getFindingLearningProfile(firstFinding.title);

  return {
    title: `${activeFindings.length} Learning Moment${activeFindings.length === 1 ? '' : 's'}`,
    detail: learning.why,
  };
}
