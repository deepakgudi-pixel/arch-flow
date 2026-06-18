export function connectIsolatedNodes(normalizedNodes, normalizedEdges) {
  const changes = [];
  const connectedNames = new Set();
  normalizedEdges.forEach(e => { connectedNames.add(e.source); connectedNames.add(e.target); });

  const backendNames = normalizedNodes.filter(n => n.category === 'backend').map(n => n.name);
  const frontendNames = normalizedNodes.filter(n => n.category === 'frontend' || n.category === 'mobile').map(n => n.name);
  const databaseNames = normalizedNodes.filter(n => n.category === 'database').map(n => n.name);
  const primaryBackend = backendNames.includes('API_GATEWAY')
    ? 'API_GATEWAY'
    : backendNames[0] || null;
  const primaryFrontend = frontendNames[0] || null;
  const primaryDatabase = databaseNames[0] || null;

  for (const node of normalizedNodes) {
    if (connectedNames.has(node.name)) continue;

    const cat = node.category;

    if (cat === 'frontend' || cat === 'mobile') {
      if (primaryBackend) {
        normalizedEdges.push({ source: node.name, target: primaryBackend, label: 'HTTPS' });
        changes.push(`Connected ${node.name} -> ${primaryBackend}`);
        connectedNames.add(node.name);
        connectedNames.add(primaryBackend);
      }
    } else if (cat === 'backend') {
      if (primaryBackend && node.name !== primaryBackend) {
        normalizedEdges.push({ source: primaryBackend, target: node.name, label: 'HTTP' });
        changes.push(`Connected ${primaryBackend} -> ${node.name}`);
      } else if (primaryFrontend) {
        normalizedEdges.push({ source: primaryFrontend, target: node.name, label: 'HTTPS' });
        changes.push(`Connected ${primaryFrontend} -> ${node.name}`);
      } else if (primaryDatabase) {
        normalizedEdges.push({ source: node.name, target: primaryDatabase, label: 'SQL' });
        changes.push(`Connected ${node.name} -> ${primaryDatabase}`);
      }
      connectedNames.add(node.name);
    } else if (cat === 'database') {
      if (primaryBackend) {
        normalizedEdges.push({ source: primaryBackend, target: node.name, label: 'SQL' });
        changes.push(`Connected ${primaryBackend} -> ${node.name}`);
        connectedNames.add(node.name);
      }
    } else if (cat === 'queue') {
      if (primaryBackend) {
        normalizedEdges.push({ source: primaryBackend, target: node.name, label: 'AMQP' });
        changes.push(`Connected ${primaryBackend} -> ${node.name}`);
        connectedNames.add(node.name);
      }
    } else if (cat === 'auth') {
      if (primaryBackend) {
        normalizedEdges.push({ source: primaryBackend, target: node.name, label: 'OIDC' });
        changes.push(`Connected ${primaryBackend} -> ${node.name}`);
        connectedNames.add(node.name);
      }
    } else if (cat === 'storage') {
      if (primaryBackend) {
        normalizedEdges.push({ source: primaryBackend, target: node.name, label: 'S3' });
        changes.push(`Connected ${primaryBackend} -> ${node.name}`);
        connectedNames.add(node.name);
      }
    } else if (cat === 'external') {
      if (primaryBackend) {
        normalizedEdges.push({ source: primaryBackend, target: node.name, label: 'HTTPS' });
        changes.push(`Connected ${primaryBackend} -> ${node.name}`);
        connectedNames.add(node.name);
      }
    } else if (cat === 'devops') {
      if (primaryBackend) {
        normalizedEdges.push({ source: primaryBackend, target: node.name, label: 'HTTP' });
        changes.push(`Connected ${primaryBackend} -> ${node.name}`);
        connectedNames.add(node.name);
      }
    }
  }

  return changes;
}
