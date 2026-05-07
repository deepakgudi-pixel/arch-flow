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
