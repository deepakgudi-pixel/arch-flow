import { useCallback, useEffect, useRef } from 'react';
import { addEdge } from 'reactflow';
import api from '@/lib/api';
import { GENERIC_PROTOCOL_LABELS } from '../editorPageUtils';

export function useProtocolSynthesis({
  nodes,
  edges,
  setEdges,
  simulateFlow,
  setToast
}) {
  const autoSynthEdgeIdsRef = useRef(new Set());
  const protocolRepairTimeoutRef = useRef(null);

  const onConnect = useCallback(async (params) => {
    const edgeId = `e_${Date.now()}`;
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);

    setEdges(ed => addEdge({
      ...params,
      id: edgeId,
      label: 'INFERRING...',
      animated: simulateFlow
    }, ed));

    try {
      const result = await api.inferConnection({
        source: { name: sourceNode.data.label, category: sourceNode.data.category },
        target: { name: targetNode.data.label, category: targetNode.data.category }
      });

      setEdges(eds => eds.map(e => e.id === edgeId ? { ...e, label: result.label } : e));
    } catch (err) {
      console.error('Failed to infer connection:', err);
      setEdges(eds => eds.map(e => e.id === edgeId ? { ...e, label: 'REST' } : e));
    }
  }, [nodes, setEdges, simulateFlow]);

  const synthesizeProtocols = useCallback(async ({ showToast = true } = {}) => {
    const edgesToFix = edges.filter(edge => {
      const normalizedLabel = (edge.label || '').trim().toUpperCase();

      if (!GENERIC_PROTOCOL_LABELS.has(normalizedLabel)) {
        return false;
      }

      if (normalizedLabel === 'INFERRING...') {
        return false;
      }

      return !autoSynthEdgeIdsRef.current.has(edge.id);
    }).slice(0, 6);

    if (edgesToFix.length === 0) {
      if (showToast) {
        setToast({ message: 'PROTOCOLS_VALIDATED: 100%', error: false });
        setTimeout(() => setToast(null), 2000);
      }
      return;
    }

    edgesToFix.forEach(edge => {
      autoSynthEdgeIdsRef.current.add(edge.id);
    });

    if (showToast) {
      setToast({ message: `SYNTHESIZING_${edgesToFix.length}_PROTOCOLS...`, warning: true });
    }

    for (const edge of edgesToFix) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        try {
          const result = await api.inferConnection({
            source: { name: sourceNode.data.label, category: sourceNode.data.category },
            target: { name: targetNode.data.label, category: targetNode.data.category }
          });

          setEdges(current => current.map(e => e.id === edge.id ? { ...e, label: result.label } : e));
        } catch (err) {
          console.error('Failed to synthesize protocol for edge:', edge.id, err);
          setEdges(current => current.map(e => e.id === edge.id ? { ...e, label: 'REST' } : e));
        } finally {
          autoSynthEdgeIdsRef.current.delete(edge.id);
        }
      } else {
        autoSynthEdgeIdsRef.current.delete(edge.id);
      }
    }
    if (showToast) {
      setToast({ message: 'PROTOCOL_SYNTHESIS: COMPLETE', error: false });
      setTimeout(() => setToast(null), 2000);
    }
  }, [edges, nodes, setEdges, setToast]);

  useEffect(() => {
    const hasRepairableEdge = edges.some(edge => {
      const normalizedLabel = (edge.label || '').trim().toUpperCase();
      return (normalizedLabel === 'CONNECTION' || normalizedLabel === '') &&
        !autoSynthEdgeIdsRef.current.has(edge.id);
    });

    if (!hasRepairableEdge) {
      return undefined;
    }

    if (protocolRepairTimeoutRef.current) {
      clearTimeout(protocolRepairTimeoutRef.current);
    }

    protocolRepairTimeoutRef.current = setTimeout(() => {
      synthesizeProtocols({ showToast: false });
    }, nodes.length >= 24 ? 1400 : 700);

    return () => {
      if (protocolRepairTimeoutRef.current) {
        clearTimeout(protocolRepairTimeoutRef.current);
      }
    };
  }, [edges, nodes.length, synthesizeProtocols]);

  return {
    onConnect,
    synthesizeProtocols
  };
}
