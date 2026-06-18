import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { buildOptimizeTo100Result } from '@/lib/diagramOptimizer';

const GENERATION_STAGES = [
  { id: 'understand', label: 'Understand' },
  { id: 'components', label: 'Components' },
  { id: 'rules', label: 'Rule Check' },
  { id: 'harden', label: 'Harden' },
  { id: 'final', label: 'Final Review' }
];

const GENERATION_STAGE_DETAILS = [
  'Reading the prompt and selected demo context.',
  'Receiving the AI draft and mapping components.',
  'Checking connection rules while the draft streams in.',
  'Preparing the review-safe hardening gate.',
  'Finalizing, saving, and opening the reviewed diagram.'
];

function normalizeGenerationError(error) {
  const message = String(error || 'Generation failed');
  const isCreditError = /AI_CREDITS_LOW|more credits|fewer max_tokens|"code":402/i.test(message);

  if (isCreditError) {
    return 'AI_CREDITS_LOW: OpenRouter credits are too low for this generation. Add credits or retry with a shorter prompt.';
  }

  return message.length > 260 ? message.slice(0, 257) + '...' : message;
}

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
  const [generationStepIndex, setGenerationStepIndex] = useState(0);
  const [generationElapsedSeconds, setGenerationElapsedSeconds] = useState(0);
  const [generationAutoFixes, setGenerationAutoFixes] = useState([]);
  const generationStartedAtRef = useRef(null);

  useEffect(() => {
    if (!isStreaming || streamError) {
      return undefined;
    }

    const tick = () => {
      const startedAt = generationStartedAtRef.current || Date.now();
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);

      setGenerationElapsedSeconds(elapsedSeconds);
      setGenerationStepIndex(current => {
        if (elapsedSeconds >= 12) return Math.max(current, 3);
        if (elapsedSeconds >= 6) return Math.max(current, 2);
        if (elapsedSeconds >= 2) return Math.max(current, 1);
        return current;
      });
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [isStreaming, streamError]);

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
    setGenerationStepIndex(0);
    setGenerationElapsedSeconds(0);
    generationStartedAtRef.current = Date.now();

    try {
      let streamedLength = 0;
      await api.streamDiagram(
        {
          description: prompt,
          template: template === 'blank' ? null : template,
          diagramId
        },
        (chunk) => {
          streamedLength += chunk.length;
          if (streamedLength > 120) setGenerationStepIndex(current => Math.max(current, 1));
          if (streamedLength > 900) setGenerationStepIndex(current => Math.max(current, 2));
          if (streamedLength > 2600) setGenerationStepIndex(current => Math.max(current, 3));
          setStreamingContent(prev => prev + chunk);
        },
        (result) => {
          setGenerationStepIndex(3);
          const newNodes = result.nodes.map(node => ({
            id: node.id,
            type: 'customNode',
            position: node.position,
            data: {
              label: node.name,
              role: node.role,
              category: node.category,
              reason: node.reason,
              icon: node.icon,
              workflow: node.workflow,
              products: node.products || []
            }
          }));

          const newEdges = result.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            animated: simulateFlow
          }));

          const optimized = buildOptimizeTo100Result({
            nodes: newNodes,
            edges: newEdges,
            connectionRules,
            connectionMode,
            simulateFlow,
            idPrefix: 'node_genfix',
            reasonPrefix: 'Auto-optimized'
          });

          setNodes(optimized.nodes);
          setEdges(optimized.edges);
          setPrompt('');
          setGenerationStepIndex(4);
          setIsStreaming(false);
          loadVersions();
          saveDiagram({ showToast: false, recordVersion: false, overrides: { nodes: optimized.nodes, edges: optimized.edges } });
          const autoFixesList = [...(result.autoFixes || [])];
          if (optimized.additions.length > 0) {
            autoFixesList.push(...optimized.additions.map(addition => `Auto-optimized: Added ${addition.label} (${addition.category}) for 100/100`));
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
          const safeError = normalizeGenerationError(error);
          setGenerationStepIndex(0);
          setStreamError(safeError);
          setLoading(false);
          setToast({ message: 'Generation failed - ' + safeError, error: true });
          setTimeout(() => setToast(null), 3000);
        }
      );
    } catch (err) {
      const safeError = normalizeGenerationError(err.message);
      console.error('Generation failed:', err);
      setStreamError(safeError);
      setToast({ message: 'Generation failed - ' + safeError, error: true });
      setIsStreaming(false);
      setGenerationStepIndex(0);
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
    generationProgress: {
      stages: GENERATION_STAGES,
      activeIndex: generationStepIndex,
      detail: GENERATION_STAGE_DETAILS[generationStepIndex],
      elapsedSeconds: generationElapsedSeconds
    },
    generationAutoFixes,
    handleGenerate
  };
}
