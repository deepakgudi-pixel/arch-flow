import { normalizeTechLabel } from '@/lib/diagramIntelligence/utils';
import { formatTechDisplayLabel } from '@/lib/displayNames';

const KNOWN_TECH_LABELS = new Set([
  'AKAMAI',
  'ALGOLIA',
  'ANGULAR',
  'ARGOCD',
  'ASP.NET CORE',
  'ASTRO',
  'AUTH0',
  'AZURE AD',
  'AZURE BLOB',
  'BACKBLAZE',
  'BULLMQ',
  'CASSANDRA',
  'CELERY',
  'CLICKHOUSE',
  'CLERK',
  'CLOUDFLARE',
  'CLOUDFLARE R2',
  'COCKROACHDB',
  'COGNITO',
  'COUCHBASE',
  'DATADOG',
  'DJANGO',
  'DOCKER',
  'DYNAMODB',
  'ELASTICSEARCH',
  'ELK STACK',
  'ERLANG',
  'EXPO',
  'EXPRESS',
  'FASTAPI',
  'FIREBASE AUTH',
  'FLASK',
  'FLUTTER',
  'FLY.IO',
  'GCS',
  'GIN',
  'GITHUB ACTIONS',
  'GO',
  'GO (GIN)',
  'GOOGLE MAPS',
  'GRAFANA',
  'GRAPHQL',
  'HELM',
  'HONO',
  'INFLUXDB',
  'IONIC',
  'ISTIO',
  'JAEGER',
  'JENKINS',
  'KAFKA',
  'KEYCLOAK',
  'KOTLIN',
  'KOTLIN (ANDROID)',
  'KUBERNETES',
  'LARAVEL',
  'MARIADB',
  'MAPBOX',
  'MEMCACHED',
  'MINIO',
  'MONGODB',
  'MYSQL',
  'NATS',
  'NESTJS',
  'NEO4J',
  'NEXT.JS',
  'NEXTAUTH',
  'NGINX',
  'NUXT',
  'OKTA',
  'PAYPAL',
  'PLAID',
  'POSTGRESQL',
  'PROMETHEUS',
  'PUB/SUB',
  'PUB_SUB',
  'PYTHON',
  'RABBITMQ',
  'RAILWAY',
  'REACT',
  'REACT NATIVE',
  'REDIS',
  'REMIX',
  'RESEND',
  'S3',
  'SENDGRID',
  'SENTRY',
  'SPRING BOOT',
  'SPRING_BOOT',
  'SQLITE',
  'SQS',
  'STRIPE',
  'SUPABASE AUTH',
  'SUPABASE STORAGE',
  'SVELTE',
  'SWIFT',
  'SWIFT (IOS)',
  'TERRAFORM',
  'TIMESCALEDB',
  'TRPC',
  'TWILIO',
  'UPLOADTHING',
  'VAULT',
  'VERCEL',
  'VUE',
  'ZEROMQ',
  'ZERO MQ'
]);

const SEMANTIC_SUFFIXES = [
  'SERVICE',
  'PIPELINE',
  'GATEWAY',
  'ARCHIVE',
  'NETWORK',
  'EXCHANGE',
  'CONTROL',
  'ENGINE',
  'ORCHESTRATOR',
  'PORTAL',
  'DASHBOARD',
  'CONSOLE',
  'QUEUE',
  'STORE',
  'LAYER',
  'BUFFER',
  'FLEET'
];

const SEMANTIC_SINGLE_WORDS = new Set([
  'ANALYTICS',
  'AUDIT',
  'BILLING',
  'CHECKOUT',
  'COMPLIANCE',
  'DISPATCH',
  'FRAUD',
  'INVENTORY',
  'LAB',
  'MESSAGING',
  'NOTIFICATION',
  'ORDERS',
  'PAYMENTS',
  'PRESENCE',
  'PRICING',
  'REPORTING',
  'SEARCH'
]);

function normalizeLabelKey(value) {
  return String(value || '')
    .trim()
    .replace(/[_.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

export function isSemanticNodeLabel(label) {
  const normalized = normalizeLabelKey(label);

  if (!normalized) {
    return false;
  }

  if (KNOWN_TECH_LABELS.has(normalized)) {
    return false;
  }

  return SEMANTIC_SINGLE_WORDS.has(normalized)
    || SEMANTIC_SUFFIXES.some(suffix => (
      normalized === suffix || normalized.endsWith(` ${suffix}`)
    ));
}

export function isSemanticNodeData(nodeData) {
  if (isSemanticNodeLabel(nodeData?.label)) {
    return true;
  }

  const implementation = String(nodeData?.implementation || '').trim();
  const label = String(nodeData?.label || '').trim();

  return Boolean(implementation)
    && normalizeTechLabel(implementation) !== normalizeTechLabel(label);
}

export function getNodeDisplayName(nodeData) {
  return formatTechDisplayLabel(nodeData?.label, nodeData?.category);
}

export function getNodeUnitTypeLabel(category) {
  const normalizedCategory = String(category || 'unit')
    .trim()
    .replace(/[_-]+/g, ' ')
    .toUpperCase();

  return normalizedCategory.endsWith(' UNIT')
    ? normalizedCategory
    : `${normalizedCategory} UNIT`;
}

export function getNodeImplementationName(nodeData) {
  if (nodeData?.implementation) {
    return String(nodeData.implementation).trim();
  }

  if (isSemanticNodeLabel(nodeData?.label)) {
    return '';
  }

  return String(nodeData?.label || '').trim();
}

export function getNodeImplementationDisplayName(nodeData) {
  const implementationName = getNodeImplementationName(nodeData);

  if (!implementationName) {
    return '';
  }

  return formatTechDisplayLabel(implementationName, nodeData?.category);
}

export function hasDistinctImplementation(nodeData) {
  const implementationName = getNodeImplementationName(nodeData);

  if (!implementationName) {
    return false;
  }

  return normalizeTechLabel(implementationName) !== normalizeTechLabel(nodeData?.label || '');
}

export function getNodeTechnologySummary(nodeData) {
  const implementation = getNodeImplementationDisplayName(nodeData);

  if (!implementation) {
    return 'Technology to choose';
  }

  return implementation;
}
