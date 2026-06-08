export const starterTemplates = {
  saas: {
    nodes: [
      { id: 'n1', name: 'NEXT.JS', category: 'frontend', role: 'Web frontend', icon: 'react' },
      { id: 'n2', name: 'CLERK', category: 'auth', role: 'Authentication', icon: 'shield' },
      { id: 'n3', name: 'NESTJS', category: 'backend', role: 'API backend', icon: 'server' },
      { id: 'n4', name: 'POSTGRESQL', category: 'database', role: 'Primary database', icon: 'database' },
      { id: 'n5', name: 'REDIS', category: 'database', role: 'Cache layer', icon: 'database' },
      { id: 'n6', name: 'KAFKA', category: 'queue', role: 'Event stream', icon: 'message-square' },
      { id: 'n7', name: 'NESTJS_WORKER', category: 'backend', role: 'Async worker', icon: 'server' },
      { id: 'n8', name: 'S3', category: 'storage', role: 'File storage', icon: 'hard-drive' },
      { id: 'n9', name: 'STRIPE', category: 'external', role: 'Billing', icon: 'credit-card' },
      { id: 'n10', name: 'NGINX', category: 'devops', role: 'Traffic gateway', icon: 'server' },
      { id: 'n11', name: 'PROMETHEUS', category: 'devops', role: 'Metrics', icon: 'activity' },
      { id: 'n12', name: 'GRAFANA', category: 'devops', role: 'Dashboards', icon: 'bar-chart' }
    ],
    edges: [
      { id: 'e1', source: 'n10', target: 'n3', label: 'HTTPS' },
      { id: 'e2', source: 'n1', target: 'n3', label: 'HTTPS' },
      { id: 'e3', source: 'n1', target: 'n2', label: 'OIDC' },
      { id: 'e4', source: 'n3', target: 'n2', label: 'OIDC' },
      { id: 'e5', source: 'n3', target: 'n4', label: 'SQL' },
      { id: 'e6', source: 'n3', target: 'n5', label: 'TCP' },
      { id: 'e7', source: 'n3', target: 'n6', label: 'KAFKA' },
      { id: 'e8', source: 'n6', target: 'n7', label: 'KAFKA' },
      { id: 'e9', source: 'n3', target: 'n8', label: 'S3' },
      { id: 'e10', source: 'n3', target: 'n9', label: 'HTTPS' },
      { id: 'e11', source: 'n3', target: 'n11', label: 'HTTP' },
      { id: 'e12', source: 'n11', target: 'n12', label: 'HTTP' }
    ]
  },
  ecommerce: {
    nodes: [
      { id: 'n1', name: 'NEXT.JS', category: 'frontend', role: 'Storefront', icon: 'react' },
      { id: 'n2', name: 'CLERK', category: 'auth', role: 'Customer auth', icon: 'shield' },
      { id: 'n3', name: 'EXPRESS', category: 'backend', role: 'Commerce API', icon: 'server' },
      { id: 'n4', name: 'POSTGRESQL', category: 'database', role: 'Orders database', icon: 'database' },
      { id: 'n5', name: 'REDIS', category: 'database', role: 'Cart cache', icon: 'database' },
      { id: 'n6', name: 'KAFKA', category: 'queue', role: 'Order events', icon: 'message-square' },
      { id: 'n7', name: 'FULFILLMENT_WORKER', category: 'backend', role: 'Order worker', icon: 'server' },
      { id: 'n8', name: 'S3', category: 'storage', role: 'Product assets', icon: 'hard-drive' },
      { id: 'n9', name: 'STRIPE', category: 'external', role: 'Payments', icon: 'credit-card' },
      { id: 'n10', name: 'SENDGRID', category: 'external', role: 'Email', icon: 'mail' },
      { id: 'n11', name: 'NGINX', category: 'devops', role: 'Traffic gateway', icon: 'server' },
      { id: 'n12', name: 'PROMETHEUS', category: 'devops', role: 'Metrics', icon: 'activity' },
      { id: 'n13', name: 'GRAFANA', category: 'devops', role: 'Dashboards', icon: 'bar-chart' }
    ],
    edges: [
      { id: 'e1', source: 'n11', target: 'n3', label: 'HTTPS' },
      { id: 'e2', source: 'n1', target: 'n3', label: 'HTTPS' },
      { id: 'e3', source: 'n1', target: 'n2', label: 'OIDC' },
      { id: 'e4', source: 'n3', target: 'n2', label: 'OIDC' },
      { id: 'e5', source: 'n3', target: 'n4', label: 'SQL' },
      { id: 'e6', source: 'n3', target: 'n5', label: 'TCP' },
      { id: 'e7', source: 'n3', target: 'n6', label: 'KAFKA' },
      { id: 'e8', source: 'n6', target: 'n7', label: 'KAFKA' },
      { id: 'e9', source: 'n3', target: 'n8', label: 'S3' },
      { id: 'e10', source: 'n3', target: 'n9', label: 'HTTPS' },
      { id: 'e11', source: 'n7', target: 'n10', label: 'HTTPS' },
      { id: 'e12', source: 'n3', target: 'n12', label: 'HTTP' },
      { id: 'e13', source: 'n12', target: 'n13', label: 'HTTP' }
    ]
  },
  mobile: {
    nodes: [
      { id: 'n1', name: 'KOTLIN', category: 'mobile', role: 'Mobile client', icon: 'smartphone' },
      { id: 'n2', name: 'FIREBASE_AUTH', category: 'auth', role: 'Mobile auth', icon: 'shield' },
      { id: 'n3', name: 'FASTAPI', category: 'backend', role: 'Mobile API', icon: 'server' },
      { id: 'n4', name: 'POSTGRESQL', category: 'database', role: 'Primary database', icon: 'database' },
      { id: 'n5', name: 'REDIS', category: 'database', role: 'Session cache', icon: 'database' },
      { id: 'n6', name: 'KAFKA', category: 'queue', role: 'Mobile events', icon: 'message-square' },
      { id: 'n7', name: 'FASTAPI_WORKER', category: 'backend', role: 'Push worker', icon: 'server' },
      { id: 'n8', name: 'S3', category: 'storage', role: 'Media storage', icon: 'hard-drive' },
      { id: 'n9', name: 'TWILIO', category: 'external', role: 'Notifications', icon: 'phone' },
      { id: 'n10', name: 'NGINX', category: 'devops', role: 'Traffic gateway', icon: 'server' },
      { id: 'n11', name: 'PROMETHEUS', category: 'devops', role: 'Metrics', icon: 'activity' },
      { id: 'n12', name: 'GRAFANA', category: 'devops', role: 'Dashboards', icon: 'bar-chart' }
    ],
    edges: [
      { id: 'e1', source: 'n10', target: 'n3', label: 'HTTPS' },
      { id: 'e2', source: 'n1', target: 'n3', label: 'HTTPS' },
      { id: 'e3', source: 'n1', target: 'n2', label: 'OIDC' },
      { id: 'e4', source: 'n3', target: 'n2', label: 'OIDC' },
      { id: 'e5', source: 'n3', target: 'n4', label: 'SQL' },
      { id: 'e6', source: 'n3', target: 'n5', label: 'TCP' },
      { id: 'e7', source: 'n3', target: 'n6', label: 'KAFKA' },
      { id: 'e8', source: 'n6', target: 'n7', label: 'KAFKA' },
      { id: 'e9', source: 'n3', target: 'n8', label: 'S3' },
      { id: 'e10', source: 'n7', target: 'n9', label: 'HTTPS' },
      { id: 'e11', source: 'n3', target: 'n11', label: 'HTTP' },
      { id: 'e12', source: 'n11', target: 'n12', label: 'HTTP' }
    ]
  },
  realtime: {
    nodes: [
      { id: 'n1', name: 'NEXT.JS', category: 'frontend', role: 'Realtime UI', icon: 'react' },
      { id: 'n2', name: 'CLERK', category: 'auth', role: 'User auth', icon: 'shield' },
      { id: 'n3', name: 'GO', category: 'backend', role: 'API backend', icon: 'server' },
      { id: 'n4', name: 'GO_WEBSOCKET', category: 'backend', role: 'Socket gateway', icon: 'server' },
      { id: 'n5', name: 'POSTGRESQL', category: 'database', role: 'State store', icon: 'database' },
      { id: 'n6', name: 'REDIS', category: 'database', role: 'Presence cache', icon: 'database' },
      { id: 'n7', name: 'KAFKA', category: 'queue', role: 'Event stream', icon: 'message-square' },
      { id: 'n8', name: 'GO_WORKER', category: 'backend', role: 'Event worker', icon: 'server' },
      { id: 'n9', name: 'S3', category: 'storage', role: 'Shared files', icon: 'hard-drive' },
      { id: 'n10', name: 'NGINX', category: 'devops', role: 'Traffic gateway', icon: 'server' },
      { id: 'n11', name: 'PROMETHEUS', category: 'devops', role: 'Metrics', icon: 'activity' },
      { id: 'n12', name: 'GRAFANA', category: 'devops', role: 'Dashboards', icon: 'bar-chart' }
    ],
    edges: [
      { id: 'e1', source: 'n10', target: 'n3', label: 'HTTPS' },
      { id: 'e2', source: 'n1', target: 'n3', label: 'HTTPS' },
      { id: 'e3', source: 'n1', target: 'n4', label: 'WEBSOCKET' },
      { id: 'e4', source: 'n1', target: 'n2', label: 'OIDC' },
      { id: 'e5', source: 'n3', target: 'n2', label: 'OIDC' },
      { id: 'e6', source: 'n3', target: 'n5', label: 'SQL' },
      { id: 'e7', source: 'n4', target: 'n6', label: 'TCP' },
      { id: 'e8', source: 'n3', target: 'n7', label: 'KAFKA' },
      { id: 'e9', source: 'n7', target: 'n8', label: 'KAFKA' },
      { id: 'e10', source: 'n3', target: 'n9', label: 'S3' },
      { id: 'e11', source: 'n3', target: 'n11', label: 'HTTP' },
      { id: 'e12', source: 'n11', target: 'n12', label: 'HTTP' }
    ]
  },
  microservices: {
    nodes: [
      { id: 'n1', name: 'NEXT.JS', category: 'frontend', role: 'Web frontend', icon: 'react' },
      { id: 'n2', name: 'CLERK', category: 'auth', role: 'Auth provider', icon: 'shield' },
      { id: 'n3', name: 'NGINX', category: 'devops', role: 'Traffic gateway', icon: 'server' },
      { id: 'n4', name: 'API_GATEWAY', category: 'backend', role: 'Gateway', icon: 'server' },
      { id: 'n5', name: 'USER_SERVICE', category: 'backend', role: 'Users', icon: 'server' },
      { id: 'n6', name: 'ORDER_SERVICE', category: 'backend', role: 'Orders', icon: 'server' },
      { id: 'n7', name: 'PAYMENT_SERVICE', category: 'backend', role: 'Payments', icon: 'server' },
      { id: 'n8', name: 'POSTGRESQL', category: 'database', role: 'Operational DB', icon: 'database' },
      { id: 'n9', name: 'REDIS', category: 'database', role: 'Shared cache', icon: 'database' },
      { id: 'n10', name: 'KAFKA', category: 'queue', role: 'Event bus', icon: 'message-square' },
      { id: 'n11', name: 'KAFKA_WORKER', category: 'backend', role: 'Event worker', icon: 'server' },
      { id: 'n12', name: 'S3', category: 'storage', role: 'Artifacts', icon: 'hard-drive' },
      { id: 'n13', name: 'STRIPE', category: 'external', role: 'Payments', icon: 'credit-card' },
      { id: 'n14', name: 'PROMETHEUS', category: 'devops', role: 'Metrics', icon: 'activity' },
      { id: 'n15', name: 'GRAFANA', category: 'devops', role: 'Dashboards', icon: 'bar-chart' }
    ],
    edges: [
      { id: 'e1', source: 'n3', target: 'n4', label: 'HTTPS' },
      { id: 'e2', source: 'n1', target: 'n4', label: 'HTTPS' },
      { id: 'e3', source: 'n1', target: 'n2', label: 'OIDC' },
      { id: 'e4', source: 'n4', target: 'n2', label: 'OIDC' },
      { id: 'e5', source: 'n4', target: 'n5', label: 'gRPC' },
      { id: 'e6', source: 'n4', target: 'n6', label: 'gRPC' },
      { id: 'e7', source: 'n4', target: 'n7', label: 'gRPC' },
      { id: 'e8', source: 'n5', target: 'n8', label: 'SQL' },
      { id: 'e9', source: 'n6', target: 'n8', label: 'SQL' },
      { id: 'e10', source: 'n4', target: 'n9', label: 'TCP' },
      { id: 'e11', source: 'n6', target: 'n10', label: 'KAFKA' },
      { id: 'e12', source: 'n7', target: 'n10', label: 'KAFKA' },
      { id: 'e13', source: 'n10', target: 'n11', label: 'KAFKA' },
      { id: 'e14', source: 'n4', target: 'n12', label: 'S3' },
      { id: 'e15', source: 'n7', target: 'n13', label: 'HTTPS' },
      { id: 'e16', source: 'n4', target: 'n14', label: 'HTTP' },
      { id: 'e17', source: 'n14', target: 'n15', label: 'HTTP' }
    ]
  }
};

export function getStarterTemplate(templateId) {
  const template = starterTemplates[templateId];

  if (!template) {
    return { nodes: [], edges: [] };
  }

  return {
    nodes: template.nodes.map(node => ({ ...node })),
    edges: template.edges.map(edge => ({ ...edge }))
  };
}
