export const categoryOrder = ['mobile', 'frontend', 'backend', 'database', 'queue', 'auth', 'storage', 'external', 'devops'];

export const builtInTech = {
  frontend: [
    { name: 'Next.js', category: 'frontend', description: 'React framework with SSR and API routes', icon: 'react', products: [] },
    { name: 'React', category: 'frontend', description: 'JavaScript library for building UIs', icon: 'react', products: [] },
    { name: 'Vue', category: 'frontend', description: 'Progressive JavaScript framework', icon: 'vue', products: [] },
    { name: 'Svelte', category: 'frontend', description: 'Cybernetically enhanced web apps', icon: 'svelte', products: [] },
    { name: 'Nuxt', category: 'frontend', description: 'Vue.js framework with SSR', icon: 'nuxt', products: [] },
    { name: 'Astro', category: 'frontend', description: 'Static site builder with islands', icon: 'astro', products: [] },
    { name: 'Angular', category: 'frontend', description: 'Platform for building mobile/desktop web apps', icon: 'angular', products: [] },
    { name: 'Remix', category: 'frontend', description: 'Full stack web framework', icon: 'react', products: [] }
  ],
  mobile: [
    { name: 'React Native', category: 'mobile', description: 'Cross-platform mobile framework using React', icon: 'smartphone', products: [] },
    { name: 'Flutter', category: 'mobile', description: 'Google UI toolkit for building natively compiled mobile apps', icon: 'smartphone', products: [] },
    { name: 'Swift (iOS)', category: 'mobile', description: 'Native Apple platform development', icon: 'smartphone', products: [] },
    { name: 'Kotlin (Android)', category: 'mobile', description: 'Modern native Android development', icon: 'smartphone', products: [] },
    { name: 'Expo', category: 'mobile', description: 'Framework and platform for universal React apps', icon: 'smartphone', products: [] },
    { name: 'Ionic', category: 'mobile', description: 'Hybrid mobile app development using web tech', icon: 'smartphone', products: [] }
  ],
  backend: [
    { name: 'Express', category: 'backend', description: 'Fast Node.js web framework', icon: 'server', products: [] },
    { name: 'FastAPI', category: 'backend', description: 'Modern Python web framework', icon: 'server', products: [] },
    { name: 'NestJS', category: 'backend', description: 'Scalable Node.js framework', icon: 'server', products: [] },
    { name: 'GraphQL', category: 'backend', description: 'Query language for APIs', icon: 'graphql', products: [] },
    { name: 'tRPC', category: 'backend', description: 'Type-safe APIs without schemas', icon: 'server', products: [] },
    { name: 'Hono', category: 'backend', description: 'Fast web framework for Edge', icon: 'server', products: [] },
    { name: 'Django', category: 'backend', description: 'High-level Python web framework', icon: 'django', products: [] },
    { name: 'Spring Boot', category: 'backend', description: 'Java enterprise application framework', icon: 'server', products: [] },
    { name: 'Go (Gin)', category: 'backend', description: 'Fast Go web framework', icon: 'server', products: [] },
    { name: 'Flask', category: 'backend', description: 'Lightweight Python web framework', icon: 'server', products: [] },
    { name: 'ASP.NET Core', category: 'backend', description: 'Microsoft web framework', icon: 'server', products: [] },
    { name: 'Laravel', category: 'backend', description: 'PHP web framework', icon: 'server', products: [] }
  ],
  database: [
    { name: 'PostgreSQL', category: 'database', description: 'Advanced open source relational database', icon: 'database', products: [] },
    { name: 'MySQL', category: 'database', description: 'Popular open source database', icon: 'database', products: [] },
    { name: 'MongoDB', category: 'database', description: 'NoSQL document database', icon: 'database', products: [] },
    { name: 'Redis', category: 'database', description: 'In-memory data store and cache', icon: 'database', products: [] },
    { name: 'SQLite', category: 'database', description: 'Lightweight embedded database', icon: 'database', products: [] },
    { name: 'DynamoDB', category: 'database', description: 'AWS NoSQL database', icon: 'database', products: [] },
    { name: 'Cassandra', category: 'database', description: 'Distributed NoSQL database', icon: 'database', products: [] },
    { name: 'Elasticsearch', category: 'database', description: 'Distributed search and analytics', icon: 'database', products: [] },
    { name: 'CockroachDB', category: 'database', description: 'Cloud-native distributed SQL', icon: 'database', products: [] },
    { name: 'MariaDB', category: 'database', description: 'MySQL fork and drop-in replacement', icon: 'database', products: [] },
    { name: 'Neo4j', category: 'database', description: 'Graph database', icon: 'database', products: [] },
    { name: 'Couchbase', category: 'database', description: 'NoSQL document and key-value database', icon: 'database', products: [] },
    { name: 'InfluxDB', category: 'database', description: 'Time series database', icon: 'database', products: [] },
    { name: 'TimescaleDB', category: 'database', description: 'Time-series SQL database', icon: 'database', products: [] },
    { name: 'ClickHouse', category: 'database', description: 'Column-oriented analytics database', icon: 'database', products: [] },
    { name: 'Memcached', category: 'database', description: 'Distributed memory caching system', icon: 'database', products: [] }
  ],
  queue: [
    { name: 'Kafka', category: 'queue', description: 'Distributed event streaming platform', icon: 'message', products: [] },
    { name: 'RabbitMQ', category: 'queue', description: 'Message broker implementing AMQP', icon: 'message', products: [] },
    { name: 'SQS', category: 'queue', description: 'AWS message queue service', icon: 'message', products: [] },
    { name: 'BullMQ', category: 'queue', description: 'Redis-based queue for Node.js', icon: 'message', products: [] },
    { name: 'Pub/Sub', category: 'queue', description: 'Google Cloud pub/sub service', icon: 'message', products: [] },
    { name: 'NATS', category: 'queue', description: 'Cloud-native messaging system', icon: 'message', products: [] },
    { name: 'Celery', category: 'queue', description: 'Distributed task queue for Python', icon: 'message', products: [] },
    { name: 'ZeroMQ', category: 'queue', description: 'High-performance messaging library', icon: 'message', products: [] }
  ],
  auth: [
    { name: 'Clerk', category: 'auth', description: 'User authentication and management', icon: 'shield', products: [] },
    { name: 'Auth0', category: 'auth', description: 'Identity and access management', icon: 'shield', products: [] },
    { name: 'NextAuth', category: 'auth', description: 'Authentication for Next.js', icon: 'shield', products: [] },
    { name: 'Supabase Auth', category: 'auth', description: 'Auth built into Supabase', icon: 'shield', products: [] },
    { name: 'Firebase Auth', category: 'auth', description: 'Google Firebase authentication', icon: 'shield', products: [] },
    { name: 'Keycloak', category: 'auth', description: 'Open source identity and access management', icon: 'shield', products: [] },
    { name: 'Okta', category: 'auth', description: 'Enterprise identity management', icon: 'shield', products: [] },
    { name: 'Azure AD', category: 'auth', description: 'Microsoft identity platform', icon: 'shield', products: [] },
    { name: 'Cognito', category: 'auth', description: 'AWS user authentication service', icon: 'shield', products: [] }
  ],
  storage: [
    { name: 'S3', category: 'storage', description: 'AWS object storage service', icon: 'storage', products: [] },
    { name: 'Cloudflare R2', category: 'storage', description: 'S3-compatible object storage', icon: 'storage', products: [] },
    { name: 'Supabase Storage', category: 'storage', description: 'File storage built on S3', icon: 'storage', products: [] },
    { name: 'Uploadthing', category: 'storage', description: 'File upload solution for Next.js', icon: 'storage', products: [] },
    { name: 'GCS', category: 'storage', description: 'Google Cloud Storage', icon: 'storage', products: [] },
    { name: 'Azure Blob', category: 'storage', description: 'Microsoft Azure blob storage', icon: 'storage', products: [] },
    { name: 'MinIO', category: 'storage', description: 'Self-hosted S3-compatible storage', icon: 'storage', products: [] },
    { name: 'Backblaze', category: 'storage', description: 'Low-cost cloud object storage', icon: 'storage', products: [] }
  ],
  external: [
    { name: 'Stripe', category: 'external', description: 'Payment processing platform', icon: 'credit-card', products: [] },
    { name: 'Twilio', category: 'external', description: 'Communication APIs for SMS/voice', icon: 'phone', products: [] },
    { name: 'SendGrid', category: 'external', description: 'Email delivery service', icon: 'mail', products: [] },
    { name: 'Resend', category: 'external', description: 'Modern email API', icon: 'mail', products: [] },
    { name: 'Algolia', category: 'external', description: 'Search and discovery platform', icon: 'search', products: [] },
    { name: 'Mapbox', category: 'external', description: 'Maps and location services', icon: 'map', products: [] },
    { name: 'Datadog', category: 'external', description: 'Cloud monitoring and observability', icon: 'bar-chart', products: [] },
    { name: 'Sentry', category: 'external', description: 'Error tracking and performance monitoring', icon: 'bug', products: [] },
    { name: 'PayPal', category: 'external', description: 'Online payment processing', icon: 'credit-card', products: [] },
    { name: 'Plaid', category: 'external', description: 'Banking and financial data API', icon: 'credit-card', products: [] }
  ],
  devops: [
    { name: 'Docker', category: 'devops', description: 'Container platform', icon: 'container', products: [] },
    { name: 'Vercel', category: 'devops', description: 'Frontend cloud platform', icon: 'cloud', products: [] },
    { name: 'Railway', category: 'devops', description: 'Deploy anything, anywhere', icon: 'cloud', products: [] },
    { name: 'Fly.io', category: 'devops', description: 'Distributed app platform', icon: 'cloud', products: [] },
    { name: 'Nginx', category: 'devops', description: 'Web server and reverse proxy', icon: 'server', products: [] },
    { name: 'Cloudflare', category: 'devops', description: 'CDN and security platform', icon: 'cloud', products: [] },
    { name: 'GitHub Actions', category: 'devops', description: 'CI/CD automation platform', icon: 'git', products: [] },
    { name: 'Kubernetes', category: 'devops', description: 'Container orchestration platform', icon: 'cloud', products: [] },
    { name: 'Prometheus', category: 'devops', description: 'Metrics collection and alerting', icon: 'activity', products: [] },
    { name: 'Grafana', category: 'devops', description: 'Observability and visualization', icon: 'bar-chart', products: [] },
    { name: 'Terraform', category: 'devops', description: 'Infrastructure as code', icon: 'git', products: [] },
    { name: 'ELK Stack', category: 'devops', description: 'Elasticsearch, Logstash, Kibana for logging', icon: 'bar-chart', products: [] },
    { name: 'Jaeger', category: 'devops', description: 'Distributed tracing', icon: 'activity', products: [] },
    { name: 'ArgoCD', category: 'devops', description: 'GitOps continuous delivery', icon: 'git', products: [] },
    { name: 'Helm', category: 'devops', description: 'Kubernetes package manager', icon: 'container', products: [] },
    { name: 'Istio', category: 'devops', description: 'Service mesh for Kubernetes', icon: 'cloud', products: [] },
    { name: 'Vault', category: 'devops', description: 'Secrets management', icon: 'shield', products: [] },
    { name: 'Jenkins', category: 'devops', description: 'CI/CD automation server', icon: 'git', products: [] }
  ]
};

export const techDescriptions = {
  'PostgreSQL': 'A powerful, open source object-relational database system known for reliability and performance.',
  'MySQL': 'The world\'s most popular open source database, great for web applications.',
  'MongoDB': 'A flexible, scalable NoSQL database that stores data in JSON-like documents.',
  'Redis': 'An in-memory data structure store used as a database, cache, and message broker.',
  'Next.js': 'A React framework that enables features like server-side rendering and static site generation.',
  'Express': 'A minimal and flexible Node.js web application framework for building APIs.',
  'FastAPI': 'A modern Python framework for building APIs with automatic documentation.',
  'NestJS': 'A progressive Node.js framework for building efficient and scalable server-side applications.',
  'GraphQL': 'A query language for APIs that provides a complete description of data.',
  'Kafka': 'A distributed event streaming platform capable of handling trillions of events.',
  'RabbitMQ': 'An open-source message broker that implements the AMQP protocol.',
  'SQS': 'Amazon Simple Queue Service - a fully managed message queuing service.',
  'Clerk': 'Complete user management, authentication, and authorization for modern web apps.',
  'Auth0': 'A flexible, drop-in solution to add authentication and authorization to your apps.',
  'NextAuth': 'Authentication for Next.js applications with support for many providers.',
  'S3': 'Amazon Simple Storage Service - scalable object storage for any amount of data.',
  'Cloudflare R2': 'S3-compatible storage with zero egress fees.',
  'Stripe': 'The easiest way to accept payments online and in mobile apps.',
  'Twilio': 'Cloud communications platform for building SMS, voice, and messaging apps.',
  'SendGrid': 'A reliable email delivery service for transactional and marketing emails.',
  'Vercel': 'The platform for frontend developers to deploy instantly and scale.',
  'Docker': 'A platform for developing, shipping, and running applications in containers.',
  'Railway': 'A platform where you can provision infrastructure, deploy, and manage apps.',
  'Fly.io': 'A platform for running full-stack apps and databases close to users.',
  'Firebase Auth': 'Authentication service provided by Google for mobile and web apps.',
  'Spring Boot': 'Java-based framework for building production-grade Spring applications.',
  'Go (Gin)': 'High-performance HTTP web framework written in Go.',
  'Flask': 'Lightweight WSGI web application framework for Python.',
  'ASP.NET Core': 'Cross-platform framework for building modern web apps and services.',
  'Laravel': 'PHP web framework with expressive syntax and robust tooling.',
  'Remix': 'Full stack web framework focused on web standards.',
  'Elasticsearch': 'Distributed search and analytics engine built on Apache Lucene.',
  'CockroachDB': 'Cloud-native distributed SQL database with strong consistency.',
  'MariaDB': 'Community-developed fork of MySQL, fully compatible.',
  'Neo4j': 'Leading graph database for connected data applications.',
  'Couchbase': 'Distributed NoSQL cloud database for modern applications.',
  'InfluxDB': 'Purpose-built time series database for metrics and events.',
  'TimescaleDB': 'Time-series SQL database built on PostgreSQL.',
  'ClickHouse': 'Column-oriented DBMS for online analytical processing.',
  'Memcached': 'High-performance distributed memory object caching system.',
  'NATS': 'Cloud-native messaging system for microservices and edge.',
  'Celery': 'Distributed task queue for handling asynchronous jobs in Python.',
  'ZeroMQ': 'High-performance asynchronous messaging library for distributed systems.',
  'Keycloak': 'Open source identity and access management solution.',
  'Okta': 'Enterprise-grade identity management and single sign-on.',
  'Azure AD': 'Microsoft cloud-based identity and access management.',
  'Cognito': 'AWS user directory and authentication service.',
  'GCS': 'Google Cloud Storage - scalable object storage by Google.',
  'Azure Blob': 'Microsoft Azure object storage for large scale data.',
  'MinIO': 'High-performance, self-hosted, S3-compatible object storage.',
  'Backblaze': 'Low-cost cloud object storage with free egress.',
  'Datadog': 'Cloud-scale monitoring and observability platform.',
  'Sentry': 'Application performance monitoring and error tracking.',
  'PayPal': 'Online payments and digital wallet platform.',
  'Plaid': 'API for connecting bank accounts to applications.',
  'Kubernetes': 'Production-grade container orchestration system.',
  'Prometheus': 'Open source monitoring system with dimensional data model.',
  'Grafana': 'Observability and data visualization platform.',
  'Terraform': 'Infrastructure as code tool by HashiCorp.',
  'ELK Stack': 'Elasticsearch, Logstash, Kibana - log management platform.',
  'Jaeger': 'Open source distributed tracing for microservices.',
  'ArgoCD': 'Declarative GitOps continuous delivery for Kubernetes.',
  'Helm': 'Package manager for Kubernetes applications.',
  'Istio': 'Service mesh that provides traffic management and security.',
  'Vault': 'Secrets management and encryption service.',
  'Jenkins': 'Open source automation server for CI/CD pipelines.'
};

export function getTechDescription(techName) {
  return techDescriptions[techName] || `A technology commonly used in modern web applications.`;
}

export function getCategoryProducts(category) {
  const products = {
    database: [
      { name: 'Supabase', description: 'Managed Postgres with realtime features', url: 'https://supabase.com' },
      { name: 'MongoDB Atlas', description: 'Managed MongoDB across cloud providers', url: 'https://mongodb.com/atlas' },
      { name: 'Redis Cloud', description: 'Fully managed Redis with sub-millisecond latency', url: 'https://redis.com' },
      { name: 'PlanetScale', description: 'Serverless MySQL platform with branching', url: 'https://planetscale.com' },
      { name: 'DataStax', description: 'Managed Cassandra for real-time applications', url: 'https://datastax.com' },
      { name: 'Neon', description: 'Serverless Postgres with branching and instant restore', url: 'https://neon.tech' }
    ],
    frontend: [
      { name: 'Vercel', description: 'Best hosting for Next.js', url: 'https://vercel.com' },
      { name: 'Netlify', description: 'Static site hosting with features', url: 'https://netlify.com' },
      { name: 'Cloudflare Pages', description: 'Fast static hosting', url: 'https://pages.cloudflare.com' }
    ],
    auth: [
      { name: 'Clerk', description: 'Modern auth solution', url: 'https://clerk.com' },
      { name: 'Auth0', description: 'Enterprise auth platform', url: 'https://auth0.com' },
      { name: 'Supabase', description: 'Open source auth', url: 'https://supabase.com' }
    ],
    storage: [
      { name: 'Uploadthing', description: 'File uploads for Next.js', url: 'https://uploadthing.com' },
      { name: 'R2', description: 'S3 compatible, no egress fees', url: 'https://developers.cloudflare.com/r2' },
      { name: 'Backblaze', description: 'Cheap cloud storage', url: 'https://backblaze.com' }
    ],
    queue: [
      { name: 'Upstash', description: 'Redis-based serverless queues', url: 'https://upstash.com' },
      { name: 'Convoy', description: 'Event streaming infrastructure', url: 'https://getconvoy.io' }
    ]
  };

  return products[category] || [];
}

export function categorizeTech(techName) {
  const name = techName.toLowerCase();

  if (name.includes('react') || name.includes('vue') || name.includes('next') || name.includes('angular') || name.includes('svelte') || name.includes('astro') || name.includes('nuxt') || name.includes('frontend') || name.includes('ui')) {
    return 'frontend';
  }
  if (name.includes('android') || name.includes('ios') || name.includes('flutter') || name.includes('react native') || name.includes('swift') || name.includes('kotlin') || name.includes('mobile') || name.includes('expo') || name.includes('ionic')) {
    return 'mobile';
  }
  if (name.includes('express') || name.includes('api') || name.includes('server') || name.includes('fastapi') || name.includes('nest') || name.includes('django') || name.includes('graphql') || name.includes('trpc') || name.includes('spring') || name.includes('gin') || name.includes('flask') || name.includes('aspnet') || name.includes('laravel') || name.includes('golang') || name.includes('echo')) {
    return 'backend';
  }
  if (name.includes('postgres') || name.includes('mysql') || name.includes('mongo') || name.includes('redis') || name.includes('dynamo') || name.includes('database') || name.includes('sql') || name.includes('cassandra') || name.includes('elastic') || name.includes('cockroach') || name.includes('mariadb') || name.includes('neo4j') || name.includes('couchbase') || name.includes('influx') || name.includes('timescale') || name.includes('clickhouse') || name.includes('memcached') || name.includes('bigtable') || name.includes('vitess') || name.includes('spanner')) {
    return 'database';
  }
  if (name.includes('kafka') || name.includes('rabbit') || name.includes('queue') || name.includes('sqs') || name.includes('pubsub') || name.includes('message') || name.includes('nats') || name.includes('celery') || name.includes('zeromq')) {
    return 'queue';
  }
  if (name.includes('auth') || name.includes('clerk') || name.includes('auth0') || name.includes('login') || name.includes('user') || name.includes('keycloak') || name.includes('okta') || name.includes('cognito') || name.includes('azure ad')) {
    return 'auth';
  }
  if (name.includes('s3') || name.includes('storage') || name.includes('upload') || name.includes('file') || name.includes('r2') || name.includes('gcs') || name.includes('azure blob') || name.includes('minio') || name.includes('backblaze')) {
    return 'storage';
  }
  if (name.includes('stripe') || name.includes('payment') || name.includes('twilio') || name.includes('email') || name.includes('send') || name.includes('algolia') || name.includes('map') || name.includes('datadog') || name.includes('sentry') || name.includes('paypal') || name.includes('plaid')) {
    return 'external';
  }
  if (name.includes('docker') || name.includes('vercel') || name.includes('railway') || name.includes('deploy') || name.includes('ci/cd') || name.includes('cloud') || name.includes('nginx') || name.includes('kubernetes') || name.includes('prometheus') || name.includes('grafana') || name.includes('terraform') || name.includes('elk') || name.includes('jaeger') || name.includes('argocd') || name.includes('helm') || name.includes('istio') || name.includes('vault') || name.includes('jenkins') || name.includes('gitlab') || name.includes('envoy') || name.includes('akamai') || name.includes('cloudfront')) {
    return 'devops';
  }

  return 'backend';
}
