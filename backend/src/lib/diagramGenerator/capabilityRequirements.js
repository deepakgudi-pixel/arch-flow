import { normalizeIdentifier } from './hardenerIdentifiers.js';

const REQUIREMENT_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'architecture',
  'for',
  'global',
  'globally',
  'include',
  'including',
  'platform',
  'production',
  'scale',
  'system',
  'the',
  'to',
  'with'
]);

export const CAPABILITY_REQUIREMENTS = [
  {
    id: 'WEB_CLIENT_SURFACE',
    label: 'a web client surface',
    prompt: /\b(mobile and web clients|web clients?|web apps?|[a-z]+ portal|[a-z]+ dashboard|[a-z]+ console)\b/i,
    coverage: /\b(web app|web client|frontend|portal|dashboard|console)\b/i,
    nodes: [['REACT', 'frontend', 'Web application', 'Requested web client surface', 'react']]
  },
  {
    id: 'MOBILE_CLIENT_SURFACE',
    label: 'a mobile client surface',
    prompt: /\b(mobile and web clients|mobile clients?|mobile apps?|[a-z]+ apps?)\b/i,
    coverage: /\b(mobile app|mobile client|android|ios)\b/i,
    nodes: [['KOTLIN', 'mobile', 'Mobile application', 'Requested mobile client surface', 'smartphone']]
  },
  {
    id: 'WAREHOUSE_ROBOTS',
    label: 'warehouse robot devices',
    prompt: /\b(warehouse robots?|autonomous robots?|robot fleet)\b/i,
    coverage: /\b(warehouse robots?|autonomous warehouse robots?|autonomous robots?|robot fleet)\b/i,
    nodes: [['WAREHOUSE_ROBOT_FLEET', 'mobile', 'Autonomous warehouse robots', 'Executes physical movement commands', 'bot']]
  },
  {
    id: 'HANDHELD_WORKER_DEVICES',
    label: 'handheld worker devices',
    prompt: /\b(handheld worker devices?|handheld scanners?|warehouse handhelds?)\b/i,
    coverage: /\b(handheld worker devices?|handheld scanners?|warehouse handhelds?)\b/i,
    nodes: [['HANDHELD_SCANNERS', 'mobile', 'Handheld worker devices', 'Barcode scans and floor workflows', 'scan-line']]
  },
  {
    id: 'AUTH_AND_MFA',
    label: 'authentication and MFA',
    prompt: /\b(authentication|authorization|oauth|oidc|mfa|multi-factor|single sign-on|sso)\b/i,
    coverage: /\b(authentication|authorization|oauth|oidc|mfa|multi-factor|single sign-on|sso|identity)\b/i,
    nodes: [['KEYCLOAK', 'auth', 'Identity MFA and SSO', 'Authentication authorization and MFA', 'shield']]
  },
  {
    id: 'COMMAND_AUTHORIZATION',
    label: 'command authorization',
    prompt: /\b(command authorization|privileged command approval|control authorization)\b/i,
    coverage: /\b(command authorization|privileged command|control authorization)\b/i,
    nodes: [['COMMAND_AUTHORIZATION_SERVICE', 'backend', 'Command authorization service', 'Policy checks for privileged control', 'shield-check']]
  },
  {
    id: 'IDENTITY_VERIFICATION',
    label: 'identity verification',
    prompt: /\b(identity verification|kyc|document verification|biometric verification)\b/i,
    coverage: /\b(identity verification|kyc|document verification|biometric)\b/i,
    nodes: [['IDENTITY_VERIFICATION', 'external', 'Identity verification provider', 'Document and biometric checks', 'scan-face']]
  },
  {
    id: 'API_GATEWAY',
    label: 'an API gateway',
    prompt: /\b(api gateway|edge gateway|request gateway)\b/i,
    coverage: /\b(api gateway|edge gateway|request routing)\b/i,
    nodes: [['API_GATEWAY', 'backend', 'API gateway', 'Request routing and policy enforcement', 'server']]
  },
  {
    id: 'SEARCH',
    label: 'search and discovery',
    prompt: /\b(search|discovery|full-text search|catalog search|property search)\b/i,
    coverage: /\b(search|discovery|index)\b/i,
    nodes: [
      ['SEARCH_SERVICE', 'backend', 'Search and discovery service', 'Query orchestration and ranking', 'search'],
      ['ELASTICSEARCH', 'database', 'Search index', 'Low-latency text and filter queries', 'database']
    ]
  },
  {
    id: 'RECOMMENDATIONS',
    label: 'recommendations and ranking',
    prompt: /\b(recommendations?|personalization|ranking service|content ranking)\b/i,
    coverage: /\b(recommendation|personalization|ranking)\b/i,
    nodes: [['RECOMMENDATION_SERVICE', 'backend', 'Recommendation and ranking service', 'Personalized relevance decisions', 'sparkles']]
  },
  {
    id: 'REALTIME_DELIVERY',
    label: 'realtime delivery',
    prompt: /\b(realtime delivery|real-time delivery|websocket|live updates?|state sync|streaming updates?)\b/i,
    coverage: /\b(real[- ]?time|websocket|live update|state sync|streaming)\b/i,
    nodes: [['REALTIME_GATEWAY', 'backend', 'Realtime delivery gateway', 'WebSocket and live state fanout', 'radio-tower']]
  },
  {
    id: 'PRESENCE',
    label: 'presence tracking',
    prompt: /\b(presence|online status|typing indicators?)\b/i,
    coverage: /\b(presence|online status|typing indicator)\b/i,
    nodes: [
      ['PRESENCE_SERVICE', 'backend', 'Presence tracking service', 'Ephemeral online state and heartbeats', 'users'],
      ['REDIS', 'database', 'Presence cache', 'Low-latency ephemeral state', 'database']
    ]
  },
  {
    id: 'MESSAGING',
    label: 'messaging and chat',
    prompt: /\b(messaging|chat|direct messages?|conversations?|in-app messaging)\b/i,
    coverage: /\b(messaging|chat|conversation|direct message)\b/i,
    nodes: [['MESSAGING_SERVICE', 'backend', 'Messaging and chat service', 'Durable conversation delivery', 'message-square']]
  },
  {
    id: 'MEDIA_UPLOADS',
    label: 'media uploads',
    prompt: /\b(media uploads?|file uploads?|image uploads?|video uploads?|attachments?)\b/i,
    coverage: /\b(media upload|file upload|image upload|video upload|attachment)\b/i,
    nodes: [
      ['MEDIA_SERVICE', 'backend', 'Media upload service', 'Signed uploads and metadata', 'image'],
      ['S3', 'storage', 'Media object storage', 'Durable uploaded content', 'hard-drive']
    ]
  },
  {
    id: 'TRANSCODING',
    label: 'media transcoding',
    prompt: /\b(transcoding|encoding pipeline|video encoding|media processing)\b/i,
    coverage: /\b(transcoding|encoding pipeline|video encoding|media processing)\b/i,
    nodes: [['TRANSCODING_SERVICE', 'backend', 'Media transcoding pipeline', 'Asynchronous format and bitrate generation', 'film']]
  },
  {
    id: 'CDN_DELIVERY',
    label: 'CDN delivery',
    prompt: /\b(cdn|content delivery|edge delivery|global delivery)\b/i,
    coverage: /\b(cdn|content delivery|edge delivery)\b/i,
    nodes: [['CLOUDFRONT', 'external', 'CDN content delivery', 'Global cached asset distribution', 'cloud']]
  },
  {
    id: 'PAYMENTS',
    label: 'payment processing',
    prompt: /\b(payment processing|payments?|checkout|card payments?|purchases?|in-game purchases?)\b/i,
    coverage: /\b(payment processing|payment service|checkout|payment processor|purchase)\b/i,
    nodes: [
      ['PAYMENT_SERVICE', 'backend', 'Payment processing service', 'Charges refunds and provider routing', 'credit-card'],
      ['STRIPE', 'external', 'Payment processor', 'External payment execution', 'credit-card']
    ]
  },
  {
    id: 'BILLING',
    label: 'billing and subscriptions',
    prompt: /\b(billing|subscriptions?|invoicing|usage billing)\b/i,
    coverage: /\b(billing|subscription|invoice)\b/i,
    nodes: [
      ['BILLING_SERVICE', 'backend', 'Billing and subscription service', 'Invoices plans and entitlements', 'receipt-text'],
      ['STRIPE', 'external', 'Billing provider', 'External invoice and payment execution', 'credit-card']
    ]
  },
  {
    id: 'PAYOUTS',
    label: 'payout processing',
    prompt: /\b(payouts?|merchant payouts?|host payouts?|seller payouts?)\b/i,
    coverage: /\b(payout)\b/i,
    nodes: [
      ['PAYOUT_SERVICE', 'backend', 'Payout processing service', 'Recipient settlement and tracking', 'hand-coins'],
      ['STRIPE', 'external', 'Payout provider', 'External payout execution', 'credit-card']
    ]
  },
  {
    id: 'FRAUD',
    label: 'fraud and risk detection',
    prompt: /\b(fraud|risk checks?|risk detection|abuse detection)\b/i,
    coverage: /\b(fraud|risk check|risk detection|abuse detection|risk scoring)\b/i,
    nodes: [['FRAUD_ENGINE', 'backend', 'Fraud and risk engine', 'Realtime risk scoring and controls', 'shield-alert']]
  },
  {
    id: 'NOTIFICATIONS',
    label: 'notifications',
    prompt: /\b(notifications?|push notifications?|alerts?|email delivery|sms)\b/i,
    coverage: /\b(notification|push notification|alert|email delivery|sms)\b/i,
    nodes: [
      ['NOTIFICATION_SERVICE', 'backend', 'Notification delivery service', 'Preferences templates and fanout', 'bell-ring'],
      ['TWILIO', 'external', 'Notification provider', 'SMS and recovery delivery', 'phone']
    ]
  },
  {
    id: 'ANALYTICS',
    label: 'analytics processing',
    prompt: /\b(analytics|business intelligence|usage metrics|viewing analytics|telemetry)\b/i,
    coverage: /\b(analytics|business intelligence|usage metrics|telemetry)\b/i,
    nodes: [
      ['ANALYTICS_PIPELINE', 'backend', 'Analytics processing pipeline', 'Event aggregation and enrichment', 'chart-no-axes-combined'],
      ['CLICKHOUSE', 'database', 'Analytics warehouse', 'Large-scale analytical queries', 'database']
    ]
  },
  {
    id: 'TELEMETRY_INGESTION',
    label: 'telemetry ingestion',
    prompt: /\b(telemetry ingestion|device telemetry|sensor telemetry|event ingestion)\b/i,
    coverage: /\b(telemetry ingestion|device telemetry|sensor telemetry|event ingestion)\b/i,
    nodes: [['TELEMETRY_INGESTION_SERVICE', 'backend', 'Telemetry ingestion service', 'High-volume validated event intake', 'radio-tower']]
  },
  {
    id: 'OFFLINE_COMMAND_BUFFERING',
    label: 'offline command buffering for intermittent connectivity',
    prompt: /\b(intermittent connectivity|offline command buffering|store-and-forward commands?)\b/i,
    coverage: /\b(intermittent connectivity|offline edge command buffer|store-and-forward)\b/i,
    nodes: [['EDGE_COMMAND_BUFFER', 'backend', 'Offline edge command buffer', 'Store-and-forward during connectivity loss', 'database-backup']]
  },
  {
    id: 'REPORTING',
    label: 'reporting and exports',
    prompt: /\b(reporting|reports?|scheduled reports?|regulatory reports?|exports?)\b/i,
    coverage: /\b(reporting|report service|scheduled report|export)\b/i,
    nodes: [['REPORTING_SERVICE', 'backend', 'Reporting and export service', 'Scheduled reports and data delivery', 'file-chart-column']]
  },
  {
    id: 'AUDIT_LOGS',
    label: 'immutable audit logging',
    prompt: /\b(audit logs?|audit trail|immutable audit|tamper[- ]?evident)\b/i,
    coverage: /\b(audit log|audit trail|immutable audit|tamper[- ]?evident)\b/i,
    nodes: [
      ['AUDIT_LOG_SERVICE', 'backend', 'Immutable audit log service', 'Tamper-evident operational events', 'scroll-text'],
      ['AUDIT_ARCHIVE', 'storage', 'Immutable audit archive', 'Long-term retained audit evidence', 'archive']
    ]
  },
  {
    id: 'DOCUMENT_STORAGE',
    label: 'document and file storage',
    prompt: /\b(document storage|file storage|image storage|object storage|document archive)\b/i,
    coverage: /\b(document storage|file storage|image storage|object storage|document archive)\b/i,
    nodes: [['S3', 'storage', 'Document object storage', 'Encrypted files images and documents', 'hard-drive']]
  },
  {
    id: 'MODERATION',
    label: 'moderation and trust workflows',
    prompt: /\b(moderation|trust and safety|content safety|abuse moderation)\b/i,
    coverage: /\b(moderation|trust and safety|content safety)\b/i,
    nodes: [['MODERATION_SERVICE', 'backend', 'Moderation and trust service', 'Policy enforcement and review queues', 'shield-check']]
  },
  {
    id: 'DISPATCH',
    label: 'dispatch and matching',
    prompt: /\b(dispatch|trip matching|courier matching|driver matching|job matching)\b/i,
    coverage: /\b(dispatch|trip matching|courier matching|driver matching|job matching)\b/i,
    nodes: [['DISPATCH_SERVICE', 'backend', 'Dispatch and matching service', 'Low-latency supply assignment', 'route']]
  },
  {
    id: 'LOCATION_TRACKING',
    label: 'realtime location tracking',
    prompt: /\b(location tracking|gps tracking|driver locations?|courier locations?|fleet tracking)\b/i,
    coverage: /\b(location tracking|gps tracking|driver location|courier location|fleet tracking)\b/i,
    nodes: [
      ['LOCATION_SERVICE', 'backend', 'Realtime location service', 'Position ingestion and geo queries', 'map-pin'],
      ['REDIS', 'database', 'Location cache', 'Hot geo and presence state', 'database']
    ]
  },
  {
    id: 'PRICING',
    label: 'pricing and promotions',
    prompt: /\b(dynamic pricing|pricing|promotions?|promos?|discounts?|surge pricing)\b/i,
    coverage: /\b(dynamic pricing|pricing|promotion|promo|discount|surge pricing)\b/i,
    nodes: [['PRICING_SERVICE', 'backend', 'Pricing and promotions service', 'Rules offers and dynamic rates', 'badge-percent']]
  },
  {
    id: 'INVENTORY',
    label: 'inventory and availability',
    prompt: /\b(inventory|availability|stock control|capacity management|availability calendars?)\b/i,
    coverage: /\b(inventory|availability|stock control|capacity)\b/i,
    nodes: [
      ['INVENTORY_SERVICE', 'backend', 'Inventory and availability service', 'Reservations holds and stock state', 'package-check'],
      ['REDIS', 'database', 'Availability cache', 'Low-latency holds and inventory', 'database']
    ]
  },
  {
    id: 'SUPPLIER_INTEGRATIONS',
    label: 'supplier integrations',
    prompt: /\b(supplier integrations?|supplier network|vendor integrations?)\b/i,
    coverage: /\b(supplier integration|supplier network|vendor integration)\b/i,
    nodes: [['SUPPLIER_NETWORK', 'external', 'Supplier integration network', 'Inbound inventory and shipment updates', 'plug-zap']]
  },
  {
    id: 'ORDERS',
    label: 'order lifecycle management',
    prompt: /\b(orders?|order lifecycle|order management|order placement)\b/i,
    coverage: /\b(order service|order lifecycle|order management|order placement)\b/i,
    nodes: [['ORDER_SERVICE', 'backend', 'Order lifecycle service', 'Creation state transitions and fulfillment', 'package']]
  },
  {
    id: 'ORDER_ALLOCATION',
    label: 'order allocation',
    prompt: /\b(order allocation|fulfillment allocation|warehouse allocation)\b/i,
    coverage: /\b(order allocation|fulfillment allocation|warehouse allocation)\b/i,
    nodes: [['ORDER_ALLOCATION_SERVICE', 'backend', 'Order allocation service', 'Assigns orders to fulfillment capacity', 'git-fork']]
  },
  {
    id: 'BOOKINGS',
    label: 'booking and reservation workflows',
    prompt: /\b(bookings?|reservations?|booking checkout)\b/i,
    coverage: /\b(booking|reservation)\b/i,
    nodes: [['BOOKING_SERVICE', 'backend', 'Booking and reservation service', 'Holds confirmation and lifecycle', 'calendar-check']]
  },
  {
    id: 'REVIEWS',
    label: 'ratings and reviews',
    prompt: /\b(ratings?|reviews?|reputation)\b/i,
    coverage: /\b(rating|review|reputation)\b/i,
    nodes: [['REVIEW_SERVICE', 'backend', 'Ratings and reviews service', 'Reputation feedback and moderation', 'star']]
  },
  {
    id: 'CUSTOMER_SUPPORT',
    label: 'customer support workflows',
    prompt: /\b(customer support|support workflows?|support cases?|help desk)\b/i,
    coverage: /\b(customer support|support workflow|support case|help desk)\b/i,
    nodes: [['SUPPORT_CASE_SERVICE', 'backend', 'Customer support case service', 'Investigations escalation and recovery', 'life-buoy']]
  },
  {
    id: 'COMPLIANCE',
    label: 'compliance controls',
    prompt: /\b(compliance|aml|sanctions|hipaa|pci(?:-dss)?|gdpr|regulatory controls?)\b/i,
    coverage: /\b(compliance|aml|sanctions|hipaa|pci|gdpr|regulatory control)\b/i,
    nodes: [['COMPLIANCE_SERVICE', 'backend', 'Compliance control service', 'Policy screening and evidence', 'badge-check']]
  },
  {
    id: 'WEBHOOKS',
    label: 'webhook delivery',
    prompt: /\b(webhooks?|callback delivery)\b/i,
    coverage: /\b(webhook|callback delivery)\b/i,
    nodes: [['WEBHOOK_SERVICE', 'backend', 'Webhook delivery service', 'Signed retries and delivery tracking', 'webhook']]
  },
  {
    id: 'SCHEDULED_JOBS',
    label: 'scheduled and recurring jobs',
    prompt: /\b(scheduled jobs?|scheduled payments?|recurring jobs?|cron jobs?|background schedules?)\b/i,
    coverage: /\b(scheduled|recurring|cron|scheduler)\b/i,
    nodes: [['SCHEDULER_SERVICE', 'backend', 'Durable scheduler service', 'Recurring and delayed workflow execution', 'calendar-clock']]
  },
  {
    id: 'CACHE',
    label: 'a low-latency cache',
    prompt: /\b(cache|caching|hot data)\b/i,
    coverage: /\b(cache|caching|hot data)\b/i,
    nodes: [['REDIS', 'database', 'Low-latency cache', 'Hot data and ephemeral state', 'database']]
  },
  {
    id: 'ASYNC_PROCESSING',
    label: 'asynchronous event processing',
    prompt: /\b(async processing|asynchronous processing|event[- ]driven|event streaming|message queues?|event bus)\b/i,
    coverage: /\b(async|asynchronous|event stream|event-driven|message queue|event bus)\b/i,
    nodes: [['KAFKA', 'queue', 'Event processing stream', 'Durable asynchronous workflows', 'message-square']]
  },
  {
    id: 'DEAD_LETTER_RECOVERY',
    label: 'dead-letter recovery',
    prompt: /\b(dead[- ]letter|dlq|failed event replay)\b/i,
    coverage: /\b(dead[- ]letter|dlq|failed event replay)\b/i,
    nodes: [['DEAD_LETTER_QUEUE', 'queue', 'Dead-letter recovery queue', 'Failed event replay and diagnosis', 'message-square-warning']]
  },
  {
    id: 'RATE_LIMITING',
    label: 'rate limiting',
    prompt: /\b(rate limiting|rate limits?|request throttling)\b/i,
    coverage: /\b(rate limiting|rate-limit|rate limits|request throttling)\b/i,
    nodes: [['REDIS', 'database', 'Rate-limit state cache', 'Distributed request throttling', 'database']]
  },
  {
    id: 'IDEMPOTENCY',
    label: 'idempotent request handling',
    prompt: /\b(idempotent|idempotency|duplicate protection)\b/i,
    coverage: /\b(idempotent|idempotency|duplicate protection)\b/i,
    nodes: [['REDIS', 'database', 'Idempotency key cache', 'Duplicate request protection', 'database']]
  },
  {
    id: 'MULTI_REGION',
    label: 'active-active multi-region deployment',
    prompt: /\b(active-active|multi[- ]region|globally distributed|regional deployment)\b/i,
    coverage: /\b(active-active|multi-region|regional runtime|regional deployment)\b/i,
    nodes: [
      ['KUBERNETES', 'devops', 'Active-active regional runtime', 'Multi-region service orchestration', 'cloud-cog'],
      ['CLOUDFLARE', 'devops', 'Global traffic edge', 'Regional routing and failover', 'cloud']
    ]
  },
  {
    id: 'DDOS_PROTECTION',
    label: 'DDoS and edge protection',
    prompt: /\b(ddos|waf|web application firewall|edge protection)\b/i,
    coverage: /\b(ddos|waf|web application firewall|edge protection)\b/i,
    nodes: [['CLOUDFLARE', 'devops', 'DDoS and edge protection', 'WAF filtering and attack mitigation', 'cloud']]
  },
  {
    id: 'DATA_RESIDENCY',
    label: 'data residency controls',
    prompt: /\b(data residency|regional data boundaries|sovereign data)\b/i,
    coverage: /\b(data residency|regional data boundar|sovereign data)\b/i,
    nodes: [['KUBERNETES', 'devops', 'Regional data runtime', 'Data residency and regional boundaries', 'cloud-cog']]
  },
  {
    id: 'DISASTER_RECOVERY',
    label: 'disaster recovery and failover',
    prompt: /\b(disaster recovery|regional failover|failover|backup region)\b/i,
    coverage: /\b(disaster recovery|regional failover|failover|backup region)\b/i,
    nodes: [['KUBERNETES', 'devops', 'Regional recovery runtime', 'Disaster recovery and failover', 'cloud-cog']]
  },
  {
    id: 'GRACEFUL_DEGRADATION',
    label: 'graceful degradation',
    prompt: /\b(graceful degradation|circuit breakers?|fallback behavior|provider failures?)\b/i,
    coverage: /\b(graceful degradation|circuit breaker|fallback behavior|provider failure)\b/i,
    nodes: [['RESILIENCE_CONTROL', 'backend', 'Graceful degradation control', 'Circuit breakers fallbacks and isolation', 'shield-half']]
  },
  {
    id: 'ENCRYPTION',
    label: 'encryption and secrets controls',
    prompt: /\b(encryption|secrets management|key management|encrypted)\b/i,
    coverage: /\b(encryption|secrets|key management|encrypted)\b/i,
    nodes: [['VAULT', 'devops', 'Encryption and secrets control', 'Keys tokens and protected configuration', 'shield']]
  },
  {
    id: 'ZERO_DOWNTIME',
    label: 'zero-downtime deployment',
    prompt: /\b(zero[- ]downtime|progressive delivery|canary deployment|blue[- ]green)\b/i,
    coverage: /\b(zero[- ]downtime|progressive|canary|blue-green)\b/i,
    nodes: [['ARGOCD', 'devops', 'Zero-downtime delivery', 'Progressive and reversible deployments', 'git-branch']]
  },
  {
    id: 'OBSERVABILITY',
    label: 'observability and operational monitoring',
    prompt: /\b(observability|operations monitoring|operational monitoring|metrics|tracing|logging|alerting)\b/i,
    coverage: /\b(observability|operations monitoring|operational monitoring|operations dashboards?|metrics collection|metrics and alerting|distributed tracing|centralized logging|service alerting)\b/i,
    nodes: [
      ['PROMETHEUS', 'devops', 'Metrics and alerting', 'Service health and SLO signals', 'activity'],
      ['GRAFANA', 'devops', 'Operations dashboards', 'System-wide operational visibility', 'bar-chart']
    ]
  }
];

function normalizeWords(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/-/g, ' ')
    .split(/\s+/)
    .map(word => {
      if (word.length > 4 && word.endsWith('ies')) {
        return `${word.slice(0, -3)}y`;
      }
      if (word.length > 4 && word.endsWith('s') && !word.endsWith('ss')) {
        return word.slice(0, -1);
      }
      return word;
    })
    .filter(word => word && !REQUIREMENT_STOP_WORDS.has(word));
}

function requirementId(label) {
  return normalizeIdentifier(label)
    .replace(/[+./-]+/g, '_')
    .split('_')
    .filter(token => token && !REQUIREMENT_STOP_WORDS.has(token.toLowerCase()))
    .slice(0, 6)
    .join('_');
}

function extractListClauses(description) {
  const clauses = [];
  const sentences = String(description || '')
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

  sentences.forEach(sentence => {
    const marker = /\b(must support|must include|including|include|with|supporting)\b/i.exec(sentence);
    let listText = marker
      ? sentence.slice(marker.index + marker[0].length)
      : '';

    if (!listText && sentence.includes(':')) {
      listText = sentence.slice(sentence.indexOf(':') + 1);
    }

    if (!listText || !listText.includes(',')) {
      return;
    }

    listText.split(/[,;]+/).forEach(rawClause => {
      const clause = rawClause
        .replace(/^\s*(?:and|or)\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (clause) {
        clauses.push(clause);
      }
    });
  });

  return clauses;
}

function isGenericCapabilityClause(clause) {
  const words = normalizeWords(clause);

  if (words.length === 0 || words.length > 8 || /\d/.test(clause)) {
    return false;
  }

  if (/\b(users? across|serving|million users?|billion users?|clear protocols?|every component|production-grade)\b/i.test(clause)) {
    return false;
  }

  const matchesKnownRequirement = CAPABILITY_REQUIREMENTS
    .some(requirement => requirement.prompt.test(clause));
  const namesDomainInterface = /\b(portal|dashboard|console|mobile app|client app)\b/i.test(clause)
    && !/^(mobile and web clients?|mobile clients?|web clients?|mobile apps?|web apps?|admin portal)$/i.test(clause);

  if (matchesKnownRequirement && !namesDomainInterface) {
    return false;
  }

  return words.some(word => word.length >= 4);
}

function createGenericRequirement(clause) {
  const id = requirementId(clause);
  const role = clause.replace(/^\w/, character => character.toUpperCase());
  const isFrontend = /\b(portal|dashboard|console|web app)\b/i.test(clause);
  const isMobile = /\b(mobile app|client app)\b/i.test(clause);
  const category = isFrontend ? 'frontend' : isMobile ? 'mobile' : 'backend';
  const baseName = category === 'backend' && !id.endsWith('_SERVICE')
    ? `${id}_SERVICE`
    : id;
  const icon = category === 'frontend'
    ? 'layout-dashboard'
    : category === 'mobile'
      ? 'smartphone'
      : 'server';

  return {
    id: `EXPLICIT_${id}`,
    label: clause,
    keywords: normalizeWords(clause),
    nodes: [[baseName, category, role, `Explicitly requested capability: ${clause}`, icon]],
    generic: true
  };
}

export function extractPromptRequirements({ description, template } = {}) {
  const context = `${description || ''} ${template || ''}`;
  const requirements = CAPABILITY_REQUIREMENTS
    .filter(requirement => requirement.prompt.test(context));
  const knownIds = new Set(requirements.map(requirement => requirement.id));

  extractListClauses(description)
    .filter(isGenericCapabilityClause)
    .map(createGenericRequirement)
    .forEach(requirement => {
      if (!knownIds.has(requirement.id)) {
        requirements.push(requirement);
        knownIds.add(requirement.id);
      }
    });

  return requirements;
}

export function buildDiagramRequirementText(diagram) {
  return (diagram.nodes || [])
    .map(node => [node.name, node.role, node.reason].filter(Boolean).join(' '))
    .join(' ');
}

export function isRequirementCovered(diagramText, requirement) {
  if (requirement.coverage) {
    return requirement.coverage.test(diagramText);
  }

  const diagramWords = new Set(normalizeWords(diagramText));
  const keywords = requirement.keywords || normalizeWords(requirement.label);

  if (keywords.length === 0) {
    return true;
  }

  const matchingWords = keywords.filter(keyword => diagramWords.has(keyword)).length;
  const requiredMatches = keywords.length <= 2
    ? keywords.length
    : Math.ceil(keywords.length * 0.67);

  return matchingWords >= requiredMatches;
}
