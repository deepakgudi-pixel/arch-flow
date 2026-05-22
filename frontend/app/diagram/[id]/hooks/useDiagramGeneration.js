import { useCallback, useState } from 'react';
import api from '@/lib/api';
import {
  buildArchitectureReview,
  buildArchitectureScore,
  normalizeTechLabel
} from '@/lib/diagramIntelligence';

export function useDiagramGeneration({
  diagramId,
  connectionMode,
  connectionRules,
  saveDiagram,
  loadVersions,
  setNodes,
  setEdges,
  simulateFlow,
  setToast
}) {
  const [prompt, setPrompt] = useState('');
  const [template, setTemplate] = useState('blank');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [generationAutoFixes, setGenerationAutoFixes] = useState([]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setToast({ message: 'INPUT_REQUIRED: PROMPT_EMPTY', error: true });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setLoading(true);
    setIsStreaming(true);
    setStreamingContent('');
    setStreamError(null);

    try {
      await api.streamDiagram(
        {
          description: prompt,
          template: template === 'blank' ? null : template,
          diagramId
        },
        (chunk) => {
          setStreamingContent(prev => prev + chunk);
        },
        (result) => {
          let newNodes = result.nodes.map(node => ({
            id: node.id,
            type: 'customNode',
            position: node.position,
            data: {
              label: node.name,
              role: node.role,
              category: node.category,
              reason: node.reason,
              icon: node.icon,
              products: node.products || []
            }
          }));

          let newEdges = result.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            animated: simulateFlow
          }));

          const techNodes = newNodes.filter(n => n.type === 'customNode');
          const existingLabels = new Set(techNodes.map(n => normalizeTechLabel(n.data.label)));
          const existingCategories = new Set(techNodes.map(n => n.data.category));
          const hasBackend = existingCategories.has('backend');
          const primaryBackend = techNodes.find(n => n.data?.category === 'backend');
          const additions = [];

          const optiMap = [
            { title: 'NO_AUTH_LAYER', label: 'CLERK', category: 'auth', icon: 'shield', role: 'Authentication and user management', check: () => !existingCategories.has('auth') && hasBackend },
            { title: 'NO_OBSERVABILITY_LAYER', label: 'GRAFANA', category: 'devops', icon: 'bar-chart', role: 'Monitoring and observability', check: () => !existingCategories.has('devops') && techNodes.length >= 5 && hasBackend },
            { title: 'MISSING_CACHE_LAYER', label: 'REDIS', category: 'database', icon: 'database', role: 'Caching and session store', check: () => !existingLabels.has('REDIS') && newNodes.filter(n => n.data?.category === 'database').length >= 2 && hasBackend },
            { title: 'MISSING_ASYNC_PROCESSING', label: 'KAFKA', category: 'queue', icon: 'message-square', role: 'Async message broker', check: () => !existingCategories.has('queue') && newNodes.filter(n => n.data?.category === 'backend').length >= 2 && hasBackend },
            { title: 'NO_STORAGE_LAYER', label: 'S3', category: 'storage', icon: 'hard-drive', role: 'Object storage for assets', check: () => !existingCategories.has('storage') && techNodes.length >= 4 && hasBackend },
            { title: 'MISSING_TRAFFIC_MANAGEMENT', label: 'NGINX', category: 'devops', icon: 'server', role: 'Reverse proxy and load balancer', check: () => !existingLabels.has('NGINX') && techNodes.length >= 6 && hasBackend },
            { title: 'SINGLE_DATASTORE_PRESSURE', label: `${primaryBackend?.name || 'DB'}_REPLICA`, category: 'database', icon: 'database', role: 'Read replica for scaling', check: () => hasBackend && existingCategories.has('database') && newNodes.filter(n => n.data?.category === 'database').length === 1 },
          ];

          const findings = buildArchitectureReview({ nodes: newNodes, edges: newEdges, connectionRules, connectionMode });
          const score = buildArchitectureScore(findings, newNodes, newEdges);
          let extraFixes = 0;

          if (score.score < 100) {
            findings.forEach(finding => {
              const match = optiMap.find(o => o.title === finding.title && o.check());
              if (!match) return;
              if (additions.some(a => a.label === match.label)) return;
              const id = `node_genfix_${Date.now()}_${additions.length}`;
              const rightmostX = Math.max(...techNodes.map(n => n.position?.x || 0), 120);
              const anchorY = Math.round((techNodes.reduce((sum, n) => sum + (n.position?.y || 0), 0) / Math.max(techNodes.length, 1)));
              additions.push({ id, match, x: rightmostX + 220 + additions.length * 60, y: anchorY + additions.length * 80 });
            });

            additions.forEach(({ id, match, x, y }) => {
              existingLabels.add(match.label);
              existingCategories.add(match.category);
              newNodes.push({
                id,
                type: 'customNode',
                position: { x, y },
                data: {
                  label: match.label,
                  category: match.category,
                  role: match.role,
                  reason: `Auto-optimized: missing ${match.category} layer`,
                  icon: match.icon,
                  products: []
                }
              });
              if (primaryBackend) {
                const label = match.category === 'auth' ? 'OIDC' : match.category === 'queue' ? 'KAFKA' : match.category === 'storage' ? 'S3' : 'HTTPS';
                newEdges.push({ id: `e_genfix_${id}`, source: primaryBackend.id, target: id, label, animated: simulateFlow });
              }
              extraFixes++;
            });
          }

          setNodes(newNodes);
          setEdges(newEdges);
          setPrompt('');
          setIsStreaming(false);
          loadVersions();
          saveDiagram({ showToast: false, recordVersion: false, overrides: { nodes: newNodes, edges: newEdges } });
          const autoFixesList = [...(result.autoFixes || [])];
          if (extraFixes > 0) {
            autoFixesList.push(...additions.map(a => `Auto-optimized: Added ${a.match.label} (${a.match.category}) for 100/100`));
          }
          setGenerationAutoFixes(autoFixesList);
          const fixCount = autoFixesList.length;
          const message = fixCount > 0
            ? 'Architecture ready - ' + fixCount + ' auto-fix' + (fixCount > 1 ? 'es' : '') + ' applied'
            : 'Architecture ready';
          setToast({ message, error: false });
          setTimeout(() => setToast(null), 3000);
        },
        (error) => {
          setStreamError(error);
          setToast({ message: 'Generation failed - ' + error, error: true });
          setTimeout(() => setToast(null), 3000);
        }
      );
    } catch (err) {
      console.error('Generation failed:', err);
      setToast({ message: 'Generation failed - ' + err.message, error: true });
      setIsStreaming(false);
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  }, [
    connectionMode,
    connectionRules,
    diagramId,
    loadVersions,
    prompt,
    saveDiagram,
    setEdges,
    setNodes,
    setToast,
    simulateFlow,
    template
  ]);

  return {
    prompt,
    setPrompt,
    template,
    setTemplate,
    loading,
    streamingContent,
    isStreaming,
    setIsStreaming,
    streamError,
    generationAutoFixes,
    handleGenerate
  };
}
