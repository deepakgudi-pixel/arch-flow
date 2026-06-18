import { categoryOrder } from '../tech.js';

export const VALID_CATEGORIES = new Set(categoryOrder);
export const CLIENT_CATEGORIES = new Set(['frontend', 'mobile']);
export const DATABASE_CATEGORIES = new Set(['database']);
export const BACKEND_TECH_NAMES = new Set([
  'API_GATEWAY',
  'EXPRESS',
  'FASTAPI',
  'NESTJS',
  'DJANGO',
  'SPRING_BOOT',
  'GO',
  'GRAPHQL',
  'NODE_JS',
  'PYTHON',
  'JAVA',
  'SCALA',
  'ERLANG',
  'PHP',
  'FLASK',
  'GIN',
  'RUST',
]);
export const OBSERVABILITY_NAMES = new Set(['GRAFANA', 'PROMETHEUS', 'DATADOG', 'ELK', 'SENTRY', 'JAEGER', 'NEW_RELIC']);
export const TRAFFIC_MANAGER_NAMES = new Set(['NGINX', 'CLOUDFLARE', 'ENVOY', 'KUBERNETES', 'AWS_CLOUDFRONT', 'AKAMAI']);
export const CACHE_NAMES = new Set(['REDIS', 'MEMCACHED']);
export const GENERIC_EDGE_LABELS = new Set(['CONNECTION', 'INFERRING...', 'API', '']);
export const REVIEW_SAFE_MAX_PASSES = 5;

export const FIXTURE_MAP = {
  'SWIFT': { category: 'mobile', icon: 'smartphone' },
  'KOTLIN': { category: 'mobile', icon: 'smartphone' },
  'REACT_NATIVE': { category: 'mobile', icon: 'smartphone' },
  'FLUTTER': { category: 'mobile', icon: 'smartphone' },
  'EXPO': { category: 'mobile', icon: 'smartphone' },
  'IONIC': { category: 'mobile', icon: 'smartphone' },
  'NEXT.JS': { category: 'frontend', icon: 'react' },
  'REACT': { category: 'frontend', icon: 'react' },
  'VUE': { category: 'frontend', icon: 'vue' },
  'SVELTE': { category: 'frontend', icon: 'svelte' },
  'ANGULAR': { category: 'frontend', icon: 'angular' },
  'ASTRO': { category: 'frontend', icon: 'react' },
  'NUXT': { category: 'frontend', icon: 'vue' },
  'REMIX': { category: 'frontend', icon: 'react' },
  'EXPRESS': { category: 'backend', icon: 'server' },
  'FASTAPI': { category: 'backend', icon: 'server' },
  'NESTJS': { category: 'backend', icon: 'server' },
  'DJANGO': { category: 'backend', icon: 'server' },
  'SPRING_BOOT': { category: 'backend', icon: 'server' },
  'GO': { category: 'backend', icon: 'server' },
  'RUST': { category: 'backend', icon: 'server' },
  'LARAVEL': { category: 'backend', icon: 'server' },
  'ASPNET_CORE': { category: 'backend', icon: 'server' },
  'GRAPHQL': { category: 'backend', icon: 'server' },
  'TRPC': { category: 'backend', icon: 'server' },
  'HONO': { category: 'backend', icon: 'server' },
  'FLASK': { category: 'backend', icon: 'server' },
  'GIN': { category: 'backend', icon: 'server' },
  'ECHO': { category: 'backend', icon: 'server' },
  'POSTGRESQL': { category: 'database', icon: 'database' },
  'MYSQL': { category: 'database', icon: 'database' },
  'MONGODB': { category: 'database', icon: 'database' },
  'REDIS': { category: 'database', icon: 'database' },
  'CASSANDRA': { category: 'database', icon: 'database' },
  'DYNAMODB': { category: 'database', icon: 'database' },
  'COUCHBASE': { category: 'database', icon: 'database' },
  'NEO4J': { category: 'database', icon: 'database' },
  'INFLUXDB': { category: 'database', icon: 'database' },
  'TIMESCALEDB': { category: 'database', icon: 'database' },
  'COCKROACHDB': { category: 'database', icon: 'database' },
  'MARIADB': { category: 'database', icon: 'database' },
  'MEMCACHED': { category: 'database', icon: 'database' },
  'ELASTICSEARCH': { category: 'database', icon: 'database' },
  'CLICKHOUSE': { category: 'database', icon: 'database' },
  'VITESS': { category: 'database', icon: 'database' },
  'BIGTABLE': { category: 'database', icon: 'database' },
  'KAFKA': { category: 'queue', icon: 'message-square' },
  'RABBITMQ': { category: 'queue', icon: 'message-square' },
  'SQS': { category: 'queue', icon: 'message-square' },
  'BULLMQ': { category: 'queue', icon: 'message-square' },
  'PUB_SUB': { category: 'queue', icon: 'message-square' },
  'NATS': { category: 'queue', icon: 'message-square' },
  'REDPANDA': { category: 'queue', icon: 'message-square' },
  'CELERY': { category: 'queue', icon: 'message-square' },
  'CLERK': { category: 'auth', icon: 'shield' },
  'AUTH0': { category: 'auth', icon: 'shield' },
  'SUPABASE_AUTH': { category: 'auth', icon: 'shield' },
  'FIREBASE_AUTH': { category: 'auth', icon: 'shield' },
  'KEYCLOAK': { category: 'auth', icon: 'shield' },
  'OKTA': { category: 'auth', icon: 'shield' },
  'AZURE_AD': { category: 'auth', icon: 'shield' },
  'COGNITO': { category: 'auth', icon: 'shield' },
  'S3': { category: 'storage', icon: 'hard-drive' },
  'CLOUDFLARE_R2': { category: 'storage', icon: 'hard-drive' },
  'SUPABASE_STORAGE': { category: 'storage', icon: 'hard-drive' },
  'UPLOADTHING': { category: 'storage', icon: 'hard-drive' },
  'MINIO': { category: 'storage', icon: 'hard-drive' },
  'GCS': { category: 'storage', icon: 'hard-drive' },
  'AZURE_BLOB': { category: 'storage', icon: 'hard-drive' },
  'STRIPE': { category: 'external', icon: 'credit-card' },
  'TWILIO': { category: 'external', icon: 'phone' },
  'SENDGRID': { category: 'external', icon: 'mail' },
  'RESEND': { category: 'external', icon: 'mail' },
  'ALGOLIA': { category: 'external', icon: 'search' },
  'MAPBOX': { category: 'external', icon: 'map' },
  'DATADOG': { category: 'external', icon: 'bar-chart' },
  'SENTRY': { category: 'external', icon: 'bug' },
  'DOCKER': { category: 'devops', icon: 'container' },
  'NGINX': { category: 'devops', icon: 'server' },
  'CLOUDFLARE': { category: 'devops', icon: 'cloud' },
  'GRAFANA': { category: 'devops', icon: 'bar-chart' },
  'PROMETHEUS': { category: 'devops', icon: 'activity' },
  'KUBERNETES': { category: 'devops', icon: 'cloud' },
  'VERCEL': { category: 'devops', icon: 'cloud' },
  'RAILWAY': { category: 'devops', icon: 'cloud' },
  'FLY_IO': { category: 'devops', icon: 'cloud' },
  'GITHUB_ACTIONS': { category: 'devops', icon: 'git-branch' },
  'TERRAFORM': { category: 'devops', icon: 'git-branch' },
  'ARGOCD': { category: 'devops', icon: 'git-branch' },
  'HELM': { category: 'devops', icon: 'container' },
  'ISTIO': { category: 'devops', icon: 'cloud' },
  'ENVOY': { category: 'devops', icon: 'server' },
  'VAULT': { category: 'devops', icon: 'shield' },
  'JAEGER': { category: 'devops', icon: 'activity' },
  'ELK': { category: 'devops', icon: 'bar-chart' },
  'ZOOKEEPER': { category: 'devops', icon: 'server' },
  'AWS_CLOUDFRONT': { category: 'devops', icon: 'cloud' },
  'AKAMAI': { category: 'devops', icon: 'cloud' },
};

export function fixNodeCategory(name) {
  const upperName = name.toUpperCase();
  if (FIXTURE_MAP[upperName]) {
    return FIXTURE_MAP[upperName].category;
  }
  return null;
}

export function fixNodeIcon(name) {
  const upperName = name.toUpperCase();
  if (FIXTURE_MAP[upperName]) {
    return FIXTURE_MAP[upperName].icon;
  }
  return null;
}
