import { BACKEND_TECH_NAMES, FIXTURE_MAP } from './hardenerCatalog.js';

const IMPLEMENTATION_DESCRIPTIONS = {
  FASTAPI: 'Clear typed APIs and fast service delivery',
  GO: 'Low-latency concurrency and efficient network services',
  JAVA: 'Durable transactional workflows and mature service tooling',
  KOTLIN: 'Native Android workflows and offline-friendly clients',
  PYTHON: 'Data processing, analytics, and model-driven workloads',
  REACT: 'Interactive browser workflows and operational interfaces',
  REACT_NATIVE: 'Shared mobile delivery across iOS and Android',
  SWIFT: 'Native iOS workflows and secure device integration'
};

const IMPLEMENTATION_PREFIXES = [
  'FASTAPI',
  'SPRING_BOOT',
  'NODE_JS',
  'PYTHON',
  'JAVA',
  'KOTLIN',
  'SWIFT',
  'REACT_NATIVE',
  'REACT',
  'RUST',
  'GO'
];

const DATA_SERVICE_PATTERN = /(ANALYT|FRAUD|RISK|RECOMMEND|REPORT|SEARCH|MODEL|PREDICT|PRICING|OPTIMI|DATA|ETL)/;
const TRANSACTION_SERVICE_PATTERN = /(LEDGER|PAYMENT|BILLING|CLAIM|COMPLIANCE|AUDIT|RECONCILI|DISPUTE|ORDER|INVENTORY|IDENTITY|PROFILE|CONSENT|PRESCRIPTION|AUTHORIZATION)/;
const REALTIME_SERVICE_PATTERN = /(GATEWAY|REALTIME|NOTIFICATION|PRESENCE|STREAM|DISPATCH|MATCH|ROUT|SYNC|LOCATION|WEBSOCKET|CONTROL|SCHEDUL|ORCHESTR|DELIVERY)/;

function implementationFromName(name) {
  return IMPLEMENTATION_PREFIXES.find(prefix => (
    name === prefix || name.startsWith(`${prefix}_`)
  )) || '';
}

function inferBackendImplementation(node) {
  const searchable = `${node.name || ''} ${node.role || ''} ${node.reason || ''}`.toUpperCase();
  const namedImplementation = implementationFromName(String(node.name || '').toUpperCase());

  if (namedImplementation && BACKEND_TECH_NAMES.has(namedImplementation)) {
    return namedImplementation;
  }

  if (DATA_SERVICE_PATTERN.test(searchable)) return 'PYTHON';
  if (TRANSACTION_SERVICE_PATTERN.test(searchable)) return 'JAVA';
  if (REALTIME_SERVICE_PATTERN.test(searchable)) return 'GO';
  return 'FASTAPI';
}

function inferImplementation(node) {
  if (node.category === 'backend') return inferBackendImplementation(node);

  if (node.category === 'frontend') {
    return implementationFromName(String(node.name || '').toUpperCase()) || 'REACT';
  }

  if (node.category === 'mobile') {
    const searchable = `${node.name || ''} ${node.role || ''}`.toUpperCase();
    if (searchable.includes('IOS')) return 'SWIFT';
    if (searchable.includes('ANDROID')) return 'KOTLIN';
    return 'REACT_NATIVE';
  }

  return '';
}

export function applyNodeImplementations(diagram) {
  const nodes = (diagram.nodes || []).map(node => {
    const isConcreteTechnology = FIXTURE_MAP[node.name]
      || (node.name !== 'API_GATEWAY' && BACKEND_TECH_NAMES.has(node.name));

    if (node.implementation || isConcreteTechnology) {
      return node;
    }

    const implementation = inferImplementation(node);
    if (!implementation) {
      return node;
    }

    return {
      ...node,
      implementation,
      implementationDescription: IMPLEMENTATION_DESCRIPTIONS[implementation]
        || `Implementation selected for the ${node.role || node.name} responsibility`
    };
  });

  return {
    ...diagram,
    nodes
  };
}
