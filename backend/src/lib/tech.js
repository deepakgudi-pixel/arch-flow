export const categoryOrder = ['mobile', 'frontend', 'backend', 'database', 'queue', 'auth', 'storage', 'external', 'devops'];

export const builtInTech = {
  frontend: [
    { name: 'Next.js', category: 'frontend', description: 'React framework with SSR and API routes', icon: 'react', products: [] },
    { name: 'React', category: 'frontend', description: 'JavaScript library for building UIs', icon: 'react', products: [] },
    { name: 'Vue', category: 'frontend', description: 'Progressive JavaScript framework', icon: 'vue', products: [] },
    { name: 'Svelte', category: 'frontend', description: 'Cybernetically enhanced web apps', icon: 'svelte', products: [] },
    { name: 'Nuxt', category: 'frontend', description: 'Vue.js framework with SSR', icon: 'nuxt', products: [] },
    { name: 'Astro', category: 'frontend', description: 'Static site builder with islands', icon: 'astro', products: [] },
    { name: 'Angular', category: 'frontend', description: 'Platform for building mobile/desktop web apps', icon: 'angular', products: [] }
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
    { name: 'Django', category: 'backend', description: 'High-level Python web framework', icon: 'django', products: [] }
  ],
  database: [
    { name: 'PostgreSQL', category: 'database', description: 'Advanced open source relational database', icon: 'database', products: [] },
    { name: 'MySQL', category: 'database', description: 'Popular open source database', icon: 'database', products: [] },
    { name: 'MongoDB', category: 'database', description: 'NoSQL document database', icon: 'database', products: [] },
    { name: 'Redis', category: 'database', description: 'In-memory data store and cache', icon: 'database', products: [] },
    { name: 'SQLite', category: 'database', description: 'Lightweight embedded database', icon: 'database', products: [] },
    { name: 'DynamoDB', category: 'database', description: 'AWS NoSQL database', icon: 'database', products: [] },
    { name: 'Cassandra', category: 'database', description: 'Distributed NoSQL database', icon: 'database', products: [] }
  ],
  queue: [
    { name: 'Kafka', category: 'queue', description: 'Distributed event streaming platform', icon: 'message', products: [] },
    { name: 'RabbitMQ', category: 'queue', description: 'Message broker', icon: 'message', products: [] },
    { name: 'SQS', category: 'queue', description: 'AWS message queue service', icon: 'message', products: [] },
    { name: 'BullMQ', category: 'queue', description: 'Redis-based queue for Node.js', icon: 'message', products: [] },
    { name: 'Pub/Sub', category: 'queue', description: 'Google Cloud pub/sub service', icon: 'message', products: [] }
  ],
  auth: [
    { name: 'Clerk', category: 'auth', description: 'User authentication and management', icon: 'shield', products: [] },
    { name: 'Auth0', category: 'auth', description: 'Identity and access management', icon: 'shield', products: [] },
    { name: 'NextAuth', category: 'auth', description: 'Authentication for Next.js', icon: 'shield', products: [] },
    { name: 'Supabase Auth', category: 'auth', description: 'Auth built into Supabase', icon: 'shield', products: [] },
    { name: 'Firebase Auth', category: 'auth', description: 'Google Firebase authentication', icon: 'shield', products: [] }
  ],
  storage: [
    { name: 'S3', category: 'storage', description: 'AWS object storage service', icon: 'storage', products: [] },
    { name: 'Cloudflare R2', category: 'storage', description: 'S3-compatible object storage', icon: 'storage', products: [] },
    { name: 'Supabase Storage', category: 'storage', description: 'File storage built on S3', icon: 'storage', products: [] },
    { name: 'Uploadthing', category: 'storage', description: 'File upload solution for Next.js', icon: 'storage', products: [] }
  ],
  external: [
    { name: 'Stripe', category: 'external', description: 'Payment processing platform', icon: 'credit-card', products: [] },
    { name: 'Twilio', category: 'external', description: 'Communication APIs for SMS/voice', icon: 'phone', products: [] },
    { name: 'SendGrid', category: 'external', description: 'Email delivery service', icon: 'mail', products: [] },
    { name: 'Resend', category: 'external', description: 'Modern email API', icon: 'mail', products: [] },
    { name: 'Algolia', category: 'external', description: 'Search and discovery platform', icon: 'search', products: [] },
    { name: 'Mapbox', category: 'external', description: 'Maps and location services', icon: 'map', products: [] }
  ],
  devops: [
    { name: 'Docker', category: 'devops', description: 'Container platform', icon: 'container', products: [] },
    { name: 'Vercel', category: 'devops', description: 'Frontend cloud platform', icon: 'cloud', products: [] },
    { name: 'Railway', category: 'devops', description: 'Deploy anything, anywhere', icon: 'cloud', products: [] },
    { name: 'Fly.io', category: 'devops', description: 'Distributed app platform', icon: 'cloud', products: [] },
    { name: 'Nginx', category: 'devops', description: 'Web server and reverse proxy', icon: 'server', products: [] },
    { name: 'Cloudflare', category: 'devops', description: 'CDN and security platform', icon: 'cloud', products: [] },
    { name: 'GitHub Actions', category: 'devops', description: 'CI/CD automation platform', icon: 'git', products: [] }
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
  'Firebase Auth': 'Authentication service provided by Google for mobile and web apps.'
};

export function getTechDescription(techName) {
  return techDescriptions[techName] || `A technology commonly used in modern web applications.`;
}

export function getCategoryProducts(category) {
  const products = {
    database: [
      { name: 'Neon', description: 'Serverless Postgres with branching', url: 'https://neon.tech' },
      { name: 'Supabase', description: 'Open source Firebase alternative', url: 'https://supabase.com' },
      { name: 'PlanetScale', description: 'Serverless MySQL platform', url: 'https://planetscale.com' },
      { name: 'Railway', description: 'Full-stack hosting with DBs', url: 'https://railway.app' }
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
  if (name.includes('express') || name.includes('api') || name.includes('server') || name.includes('fastapi') || name.includes('nest') || name.includes('django') || name.includes('graphql') || name.includes('trpc')) {
    return 'backend';
  }
  if (name.includes('postgres') || name.includes('mysql') || name.includes('mongo') || name.includes('redis') || name.includes('dynamo') || name.includes('database') || name.includes('sql')) {
    return 'database';
  }
  if (name.includes('kafka') || name.includes('rabbit') || name.includes('queue') || name.includes('sqs') || name.includes('pubsub') || name.includes('message')) {
    return 'queue';
  }
  if (name.includes('auth') || name.includes('clerk') || name.includes('auth0') || name.includes('login') || name.includes('user')) {
    return 'auth';
  }
  if (name.includes('s3') || name.includes('storage') || name.includes('upload') || name.includes('file') || name.includes('r2')) {
    return 'storage';
  }
  if (name.includes('stripe') || name.includes('payment') || name.includes('twilio') || name.includes('email') || name.includes('send') || name.includes('algolia') || name.includes('map')) {
    return 'external';
  }
  if (name.includes('docker') || name.includes('vercel') || name.includes('railway') || name.includes('deploy') || name.includes('ci/cd') || name.includes('cloud') || name.includes('nginx')) {
    return 'devops';
  }

  return 'backend';
}
