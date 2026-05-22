export interface ArchitectureExample {
  id: string;
  name: string;
  prompt: string;
  audience: string;
}

export const architectureExamples: ArchitectureExample[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    audience: 'video streaming',
    prompt: 'Design Netflix: video catalog, playback APIs, recommendations, user profiles, billing, encoding pipeline, CDN delivery, observability, and petabyte-scale viewing analytics.'
  },
  {
    id: 'uber',
    name: 'Uber',
    audience: 'marketplace realtime',
    prompt: 'Design Uber: rider and driver apps, trip matching, realtime location tracking, pricing, payments, notifications, fraud checks, maps, and operational monitoring.'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    audience: 'messaging',
    prompt: 'Design WhatsApp: mobile clients, encrypted messaging, presence, media uploads, push notifications, contact sync, message queues, storage, and global reliability.'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    audience: 'fintech',
    prompt: 'Design Stripe: payment APIs, checkout, ledger, fraud detection, webhooks, merchant dashboard, compliance audit logs, reconciliation, vaulting, and observability.'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    audience: 'video platform',
    prompt: 'Design YouTube: uploads, transcoding, recommendations, subscriptions, comments, search, content delivery, analytics, creator dashboards, and abuse moderation.'
  },
  {
    id: 'slack',
    name: 'Slack',
    audience: 'collaboration',
    prompt: 'Design Slack: workspaces, channels, realtime chat, file uploads, search, notifications, presence, integrations, enterprise auth, and message retention.'
  }
];

export function getArchitectureExamplePrompt(exampleId: string): string | null {
  return architectureExamples.find(example => example.id === exampleId)?.prompt || null;
}
