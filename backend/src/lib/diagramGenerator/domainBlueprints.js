import {
  addNormalizedEdge,
  hasNodeNamed
} from './hardenerConnections.js';
import {
  fixNodeIcon
} from './hardenerCatalog.js';
import { normalizeIdentifier } from './hardenerIdentifiers.js';

const FOOD_DELIVERY_MATCHER = /\b(food delivery|doordash|uber eats|courier|restaurant|restaurants|delivery platform|dispatch|couriers)\b/i;
const STOCK_TRADING_MATCHER = /\b(stock trading|trading platform|robinhood|brokerage|market data|order placement|order routing|portfolio|reconciliation|compliance reporting|market open|strict consistency)\b/i;
const TRAVEL_MARKETPLACE_MATCHER = /\b(airbnb|travel marketplace|property search|availability calendar|availability calendars|booking checkout|host payouts|guest and host|in-app messaging|reviews|trust and safety|identity verification|dynamic pricing)\b/i;

const FOOD_DELIVERY_NODES = [
  ['KOTLIN', 'mobile', 'Customer ordering app', 'Browse menus and checkout', 'smartphone'],
  ['SWIFT', 'mobile', 'Courier driver app', 'Pickup and delivery tracking', 'smartphone'],
  ['REACT', 'frontend', 'Restaurant ops dashboard', 'Merchant and support workflows', 'react'],
  ['EXPRESS', 'backend', 'Order API', 'Checkout and order lifecycle', 'server'],
  ['GO', 'backend', 'Dispatch matching', 'Low-latency courier assignment', 'server'],
  ['FASTAPI', 'backend', 'Pricing fraud promos', 'Pricing risk and offers', 'server'],
  ['POSTGRESQL', 'database', 'Orders merchant DB', 'Transactional order records', 'database'],
  ['REDIS', 'database', 'Location cache', 'Realtime courier positions', 'database'],
  ['KAFKA', 'queue', 'Order event stream', 'Dispatch notification fanout', 'message-square'],
  ['S3', 'storage', 'Menu receipt storage', 'Images and delivery proof', 'hard-drive'],
  ['STRIPE', 'external', 'Payment processing', 'Cards refunds and payouts', 'credit-card'],
  ['GOOGLE_MAPS', 'external', 'Maps routing', 'ETAs geocoding and routes', 'map'],
  ['TWILIO', 'external', 'Notifications', 'SMS and delivery updates', 'phone']
];

const FOOD_DELIVERY_EDGES = [
  ['KOTLIN', 'EXPRESS', 'HTTPS', 'Customer app talks to order API'],
  ['SWIFT', 'GO', 'WEBSOCKET', 'Courier app streams location'],
  ['REACT', 'EXPRESS', 'HTTPS', 'Restaurant ops uses order API'],
  ['EXPRESS', 'CLERK', 'OIDC', 'Order API verifies identity'],
  ['EXPRESS', 'POSTGRESQL', 'SQL', 'Order API persists orders'],
  ['EXPRESS', 'REDIS', 'TCP', 'Order API reads hot state'],
  ['EXPRESS', 'KAFKA', 'KAFKA', 'Order API publishes order events'],
  ['EXPRESS', 'S3', 'S3', 'Order API stores menus and receipts'],
  ['EXPRESS', 'STRIPE', 'HTTPS', 'Order API charges payments'],
  ['EXPRESS', 'GOOGLE_MAPS', 'HTTPS', 'Order API resolves addresses'],
  ['EXPRESS', 'TWILIO', 'HTTPS', 'Order API sends notifications'],
  ['GO', 'REDIS', 'TCP', 'Dispatch reads courier locations'],
  ['GO', 'GOOGLE_MAPS', 'HTTPS', 'Dispatch computes ETAs'],
  ['GO', 'KAFKA', 'KAFKA', 'Dispatch publishes trip events'],
  ['KAFKA', 'FASTAPI', 'KAFKA', 'Risk service consumes order events'],
  ['FASTAPI', 'POSTGRESQL', 'SQL', 'Pricing fraud reads order history'],
  ['FASTAPI', 'KAFKA', 'KAFKA', 'Pricing fraud publishes decisions']
];

const STOCK_TRADING_NODES = [
  ['KOTLIN', 'mobile', 'Android trading app', 'Mobile order placement', 'smartphone'],
  ['SWIFT', 'mobile', 'iOS trading app', 'Mobile portfolio updates', 'smartphone'],
  ['REACT', 'frontend', 'Web trading dashboard', 'Orders positions and charts', 'react'],
  ['JAVA', 'backend', 'Order API', 'Validates trading requests', 'server'],
  ['SPRING_BOOT', 'backend', 'Order routing', 'Routes orders to venues', 'server'],
  ['GO', 'backend', 'Market data gateway', 'Low-latency price streams', 'server'],
  ['PYTHON', 'backend', 'Risk fraud engine', 'Pre-trade risk checks', 'server'],
  ['POSTGRESQL', 'database', 'Portfolio ledger', 'Positions balances audit', 'database'],
  ['TIMESCALEDB', 'database', 'Market data store', 'Tick history and candles', 'database'],
  ['REDIS', 'database', 'Price cache', 'Hot quotes and balances', 'database'],
  ['KAFKA', 'queue', 'Trade event stream', 'Orders fills risk events', 'message-square'],
  ['S3', 'storage', 'Audit report archive', 'Statements and compliance exports', 'hard-drive'],
  ['PLAID', 'external', 'Bank funding', 'Account linking and ACH', 'credit-card'],
  ['TWILIO', 'external', 'Trade alerts', 'Order fill notifications', 'phone'],
  ['VAULT', 'devops', 'Secrets controls', 'Keys and regulatory secrets', 'shield']
];

const STOCK_TRADING_EDGES = [
  ['KOTLIN', 'JAVA', 'HTTPS', 'Android app places orders'],
  ['SWIFT', 'JAVA', 'HTTPS', 'iOS app places orders'],
  ['REACT', 'JAVA', 'HTTPS', 'Web dashboard places orders'],
  ['REACT', 'GO', 'WEBSOCKET', 'Web dashboard streams quotes'],
  ['JAVA', 'CLERK', 'OIDC', 'Order API verifies identity'],
  ['JAVA', 'PYTHON', 'gRPC', 'Order API requests risk check'],
  ['PYTHON', 'POSTGRESQL', 'SQL', 'Risk engine reads portfolio ledger'],
  ['PYTHON', 'KAFKA', 'KAFKA', 'Risk engine publishes decisions'],
  ['JAVA', 'SPRING_BOOT', 'gRPC', 'Order API routes accepted orders'],
  ['SPRING_BOOT', 'KAFKA', 'KAFKA', 'Order routing publishes executions'],
  ['SPRING_BOOT', 'POSTGRESQL', 'SQL', 'Order routing writes fills'],
  ['GO', 'TIMESCALEDB', 'SQL', 'Market data stores ticks'],
  ['GO', 'REDIS', 'TCP', 'Market data updates hot quotes'],
  ['GO', 'KAFKA', 'KAFKA', 'Market data publishes price events'],
  ['KAFKA', 'PYTHON', 'KAFKA', 'Risk engine consumes market events'],
  ['JAVA', 'REDIS', 'TCP', 'Order API checks hot balances'],
  ['JAVA', 'PLAID', 'HTTPS', 'Order API links bank funding'],
  ['JAVA', 'TWILIO', 'HTTPS', 'Order API sends trade alerts'],
  ['JAVA', 'S3', 'S3', 'Order API archives statements'],
  ['JAVA', 'VAULT', 'HTTPS', 'Order API reads secrets'],
  ['PYTHON', 'S3', 'S3', 'Compliance exports audit reports']
];

const TRAVEL_MARKETPLACE_NODES = [
  ['KOTLIN', 'mobile', 'Guest mobile app', 'Search stays and book', 'smartphone'],
  ['SWIFT', 'mobile', 'Host mobile app', 'Manage listings and guests', 'smartphone'],
  ['REACT', 'frontend', 'Marketplace web app', 'Listings bookings and support', 'react'],
  ['FASTAPI', 'backend', 'Booking API', 'Checkout and reservation lifecycle', 'server'],
  ['GO', 'backend', 'Availability calendar', 'Low-latency inventory holds', 'server'],
  ['PYTHON', 'backend', 'Trust safety engine', 'Fraud reviews identity risk', 'server'],
  ['NESTJS', 'backend', 'Guest messaging', 'Host guest conversations', 'server'],
  ['POSTGRESQL', 'database', 'Booking ledger', 'Reservations payouts and reviews', 'database'],
  ['REDIS', 'database', 'Availability cache', 'Hot inventory and sessions', 'database'],
  ['ELASTICSEARCH', 'database', 'Listing search index', 'Geo text search filters', 'search'],
  ['KAFKA', 'queue', 'Booking event stream', 'Async booking workflows', 'message-square'],
  ['S3', 'storage', 'Listing image storage', 'Photos receipts and documents', 'hard-drive'],
  ['STRIPE', 'external', 'Payments payouts', 'Guest charges host payouts', 'credit-card'],
  ['GOOGLE_MAPS', 'external', 'Listing maps', 'Geo search and directions', 'map'],
  ['TWILIO', 'external', 'Guest host alerts', 'Booking message notifications', 'phone'],
  ['ALGOLIA', 'external', 'Property search', 'Instant listing discovery', 'search']
];

const TRAVEL_MARKETPLACE_EDGES = [
  ['KOTLIN', 'FASTAPI', 'HTTPS', 'Guest app creates bookings'],
  ['SWIFT', 'FASTAPI', 'HTTPS', 'Host app manages listings'],
  ['REACT', 'FASTAPI', 'HTTPS', 'Web app uses booking API'],
  ['REACT', 'NESTJS', 'WEBSOCKET', 'Web app opens messaging'],
  ['FASTAPI', 'CLERK', 'OIDC', 'Booking API verifies identity'],
  ['FASTAPI', 'POSTGRESQL', 'SQL', 'Booking API writes reservations'],
  ['FASTAPI', 'REDIS', 'TCP', 'Booking API checks availability'],
  ['FASTAPI', 'KAFKA', 'KAFKA', 'Booking API publishes events'],
  ['FASTAPI', 'S3', 'S3', 'Booking API stores documents'],
  ['FASTAPI', 'STRIPE', 'HTTPS', 'Booking API charges payouts'],
  ['FASTAPI', 'GOOGLE_MAPS', 'HTTPS', 'Booking API resolves locations'],
  ['FASTAPI', 'ALGOLIA', 'HTTPS', 'Booking API searches listings'],
  ['GO', 'REDIS', 'TCP', 'Calendar checks hot inventory'],
  ['GO', 'POSTGRESQL', 'SQL', 'Calendar persists holds'],
  ['GO', 'KAFKA', 'KAFKA', 'Calendar publishes availability events'],
  ['PYTHON', 'POSTGRESQL', 'SQL', 'Trust reads bookings reviews'],
  ['PYTHON', 'KAFKA', 'KAFKA', 'Trust consumes booking events'],
  ['PYTHON', 'TWILIO', 'HTTPS', 'Trust sends safety alerts'],
  ['NESTJS', 'POSTGRESQL', 'SQL', 'Messaging stores conversations'],
  ['NESTJS', 'KAFKA', 'KAFKA', 'Messaging publishes notifications'],
  ['NESTJS', 'TWILIO', 'HTTPS', 'Messaging sends guest alerts'],
  ['KAFKA', 'PYTHON', 'KAFKA', 'Trust reviews async events'],
  ['KAFKA', 'NESTJS', 'KAFKA', 'Messaging consumes booking events'],
  ['FASTAPI', 'ELASTICSEARCH', 'HTTP', 'Booking API updates search']
];

function detectDomain(description, template) {
  const context = `${description || ''} ${template || ''}`;

  if (FOOD_DELIVERY_MATCHER.test(context)) {
    return 'food_delivery';
  }

  if (STOCK_TRADING_MATCHER.test(context)) {
    return 'stock_trading';
  }

  if (TRAVEL_MARKETPLACE_MATCHER.test(context)) {
    return 'travel_marketplace';
  }

  return null;
}

function ensureNode(nodes, name, category, role, reason, icon, changes) {
  const normalizedName = normalizeIdentifier(name);
  const existingNode = nodes.find(node => node.name === normalizedName);
  const fixedIcon = fixNodeIcon(normalizedName);

  if (existingNode) {
    existingNode.category = existingNode.category || category;
    existingNode.role = role;
    existingNode.reason = reason;
    existingNode.icon = fixedIcon || icon || existingNode.icon || 'server';
    return existingNode;
  }

  const node = {
    name: normalizedName,
    category,
    role,
    reason,
    icon: fixedIcon || icon || 'server'
  };

  nodes.push(node);
  changes.push(`Domain tuned: added ${normalizedName} (${role})`);
  return node;
}

function applyFoodDeliveryBlueprint(diagram) {
  const nodes = [...(diagram.nodes || []).map(node => ({ ...node }))];
  const edges = [...(diagram.edges || []).map(edge => ({ ...edge }))];
  const changes = [];

  FOOD_DELIVERY_NODES.forEach(([name, category, role, reason, icon]) => {
    ensureNode(nodes, name, category, role, reason, icon, changes);
  });

  if (hasNodeNamed(nodes, 'PROMETHEUS')) {
    const prometheus = nodes.find(node => node.name === 'PROMETHEUS');
    prometheus.role = 'Operations monitoring';
    prometheus.reason = 'Service health and alerts';
  }

  if (hasNodeNamed(nodes, 'GRAFANA')) {
    const grafana = nodes.find(node => node.name === 'GRAFANA');
    grafana.role = 'Ops dashboards';
    grafana.reason = 'Delivery platform observability';
  }

  if (hasNodeNamed(nodes, 'NGINX')) {
    const nginx = nodes.find(node => node.name === 'NGINX');
    nginx.role = 'Traffic gateway';
    nginx.reason = 'Routes web and API traffic';
  }

  FOOD_DELIVERY_EDGES.forEach(([source, target, label, reason]) => {
    if (hasNodeNamed(nodes, source) && hasNodeNamed(nodes, target)) {
      addNormalizedEdge(edges, nodes, source, target, label, changes, `Domain tuned: ${reason}`);
    }
  });

  return {
    diagram: { nodes, edges },
    changes
  };
}

function retitleOpsNodes(nodes, productName) {
  if (hasNodeNamed(nodes, 'PROMETHEUS')) {
    const prometheus = nodes.find(node => node.name === 'PROMETHEUS');
    prometheus.role = 'Operations monitoring';
    prometheus.reason = `${productName} health and alerts`;
  }

  if (hasNodeNamed(nodes, 'GRAFANA')) {
    const grafana = nodes.find(node => node.name === 'GRAFANA');
    grafana.role = 'Ops dashboards';
    grafana.reason = `${productName} observability`;
  }

  if (hasNodeNamed(nodes, 'NGINX')) {
    const nginx = nodes.find(node => node.name === 'NGINX');
    nginx.role = 'Traffic gateway';
    nginx.reason = 'Routes web and API traffic';
  }
}

function applyStockTradingBlueprint(diagram) {
  const nodes = [...(diagram.nodes || []).map(node => ({ ...node }))];
  const edges = [...(diagram.edges || []).map(edge => ({ ...edge }))];
  const changes = [];

  STOCK_TRADING_NODES.forEach(([name, category, role, reason, icon]) => {
    ensureNode(nodes, name, category, role, reason, icon, changes);
  });

  retitleOpsNodes(nodes, 'Trading platform');

  STOCK_TRADING_EDGES.forEach(([source, target, label, reason]) => {
    if (hasNodeNamed(nodes, source) && hasNodeNamed(nodes, target)) {
      addNormalizedEdge(edges, nodes, source, target, label, changes, `Domain tuned: ${reason}`);
    }
  });

  return {
    diagram: { nodes, edges },
    changes
  };
}

function applyTravelMarketplaceBlueprint(diagram) {
  const nodes = [...(diagram.nodes || []).map(node => ({ ...node }))];
  const edges = [...(diagram.edges || []).map(edge => ({ ...edge }))];
  const changes = [];

  TRAVEL_MARKETPLACE_NODES.forEach(([name, category, role, reason, icon]) => {
    ensureNode(nodes, name, category, role, reason, icon, changes);
  });

  retitleOpsNodes(nodes, 'Travel marketplace');

  TRAVEL_MARKETPLACE_EDGES.forEach(([source, target, label, reason]) => {
    if (hasNodeNamed(nodes, source) && hasNodeNamed(nodes, target)) {
      addNormalizedEdge(edges, nodes, source, target, label, changes, `Domain tuned: ${reason}`);
    }
  });

  return {
    diagram: { nodes, edges },
    changes
  };
}

export function applyDomainBlueprint(diagram, { description, template } = {}) {
  const domain = detectDomain(description, template);

  if (domain === 'food_delivery') {
    return applyFoodDeliveryBlueprint(diagram);
  }

  if (domain === 'stock_trading') {
    return applyStockTradingBlueprint(diagram);
  }

  if (domain === 'travel_marketplace') {
    return applyTravelMarketplaceBlueprint(diagram);
  }

  return {
    diagram,
    changes: []
  };
}
