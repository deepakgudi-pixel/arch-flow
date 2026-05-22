import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { buildArchitectureReview } from '@/lib/diagramIntelligence';
import {
  clearReviewDraftFromStorage,
  loadReviewDraftFromStorage,
  saveReviewDraftToStorage
} from '@/lib/reviewDraftStorage';
import {
  REVIEW_NEW_NODE_TOKEN,
  buildAssistantDraftStorageKey,
  buildPersistedEdgesPayload,
  buildPersistedNodesPayload,
  computeSuggestedNodePosition,
  createReviewSuggestionId,
  enrichSuggestionConnections,
  formatStagedSuggestionNames,
  mergeReviewSuggestions,
  normalizeSuggestionValue
} from '../editorPageUtils';

export function useReviewAssistant({
  userId,
  diagramId,
  diagramName,
  nodes,
  edges,
  connectionMode,
  connectionRules,
  saveDiagram,
  rfInstance,
  simulateFlow,
  setNodes,
  setEdges,
  setSelectedNode,
  setSelectedEdge,
  setLeftSidebarOpen,
  setRightPanelOpen,
  setAssistantPanelOpen,
  setReviewPanelOpen,
  setHistoryPanelOpen,
  setToast
}) {
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantMessages, setAssistantMessages] = useState([]);
  const [reviewSuggestions, setReviewSuggestions] = useState([]);
  const [reviewAssistantLoading, setReviewAssistantLoading] = useState(false);
  const hydratedAssistantDraftKeyRef = useRef(null);
  const assistantDraftStorageKey = buildAssistantDraftStorageKey(userId, diagramId);

  useEffect(() => {
    if (!assistantDraftStorageKey) {
      return;
    }

    if (hydratedAssistantDraftKeyRef.current === assistantDraftStorageKey) {
      return;
    }

    let cancelled = false;

    const restoreAssistantDraft = async () => {
      const draft = await loadReviewDraftFromStorage(assistantDraftStorageKey);

      if (cancelled) {
        return;
      }

      setAssistantMessages(draft?.assistantMessages || []);
      setReviewSuggestions(draft?.reviewSuggestions || []);
      hydratedAssistantDraftKeyRef.current = assistantDraftStorageKey;

      if (draft && (draft.assistantMessages.length > 0 || draft.reviewSuggestions.length > 0)) {
        setToast({ message: 'REVIEW_DRAFT_RESTORED', error: false });
        setTimeout(() => setToast(null), 2200);
      }
    };

    restoreAssistantDraft();

    return () => {
      cancelled = true;
    };
  }, [assistantDraftStorageKey, setToast]);

  useEffect(() => {
    if (!assistantDraftStorageKey) {
      return;
    }

    if (hydratedAssistantDraftKeyRef.current !== assistantDraftStorageKey) {
      return;
    }

    if (assistantMessages.length === 0 && reviewSuggestions.length === 0) {
      clearReviewDraftFromStorage(assistantDraftStorageKey);
      return;
    }

    saveReviewDraftToStorage(assistantDraftStorageKey, {
      assistantMessages,
      reviewSuggestions
    });
  }, [assistantDraftStorageKey, assistantMessages, reviewSuggestions]);

  const openReviewQueue = useCallback(() => {
    setAssistantPanelOpen(false);
    setRightPanelOpen(false);
    setHistoryPanelOpen(false);
    setReviewPanelOpen(true);
    setLeftSidebarOpen(false);
  }, [setAssistantPanelOpen, setHistoryPanelOpen, setLeftSidebarOpen, setReviewPanelOpen, setRightPanelOpen]);

  const handleSendAssistantPrompt = useCallback(async (presetPrompt) => {
    const question = String(presetPrompt ?? assistantPrompt).trim();

    if (!question || reviewAssistantLoading) {
      return;
    }

    const userMessage = {
      id: createReviewSuggestionId(),
      role: 'user',
      content: question
    };
    const conversationMessages = [...assistantMessages, userMessage]
      .map(message => ({ role: message.role, content: message.content }))
      .slice(-8);

    setAssistantMessages(current => [...current, userMessage]);
    setAssistantPrompt('');
    setReviewAssistantLoading(true);

    try {
      const currentReviewFindings = buildArchitectureReview({
        nodes,
        edges,
        connectionRules,
        connectionMode
      });
      const result = await api.reviewDiagram({
        question,
        diagramName,
        nodes: buildPersistedNodesPayload(nodes),
        edges: buildPersistedEdgesPayload(edges),
        reviewFindings: currentReviewFindings,
        messages: conversationMessages
      });
      const suggestions = (Array.isArray(result.suggestions) ? result.suggestions : [])
        .map(suggestion => enrichSuggestionConnections(suggestion, nodes, edges, connectionRules));
      const stagedNames = formatStagedSuggestionNames(suggestions);
      const assistantContent = suggestions.length > 0
        ? `${result.message}\n\nAdded to Architecture Review: ${stagedNames}.`
        : result.message;

      setAssistantMessages(current => [
        ...current,
        {
          id: createReviewSuggestionId(),
          role: 'assistant',
          content: assistantContent,
          suggestionsCount: suggestions.length
        }
      ]);

      if (suggestions.length > 0) {
        setReviewSuggestions(current => mergeReviewSuggestions(current, suggestions));
        setToast({ message: `ARCH_REVIEW_UPDATED: ${suggestions.length}_ITEMS`, warning: true });
        setTimeout(() => setToast(null), 2500);
      }
    } catch (err) {
      console.error('Assistant review failed:', err);
      const isContextTooLarge = err?.status === 400 || /too large/i.test(err?.message);
      const errorContent = isContextTooLarge
        ? 'The diagram is too large to review in a single pass. Try breaking it into smaller sections, or remove some nodes and connections first.'
        : `I couldn't review the diagram right now. ${err.message}`;
      setAssistantMessages(current => [
        ...current,
        {
          id: createReviewSuggestionId(),
          role: 'assistant',
          content: errorContent
        }
      ]);
      setToast({ message: isContextTooLarge ? 'DIAGRAM_TOO_LARGE_FOR_REVIEW' : 'AI_REVIEW_FAILED', error: true });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setReviewAssistantLoading(false);
    }
  }, [
    assistantMessages,
    assistantPrompt,
    connectionMode,
    connectionRules,
    diagramName,
    edges,
    nodes,
    reviewAssistantLoading,
    setToast
  ]);

  const handleDeclineReviewSuggestion = useCallback((suggestion) => {
    setReviewSuggestions(current => current.filter(item => item.id !== suggestion.id));
    setToast({ message: `REVIEW_DECLINED: ${suggestion.name.toUpperCase()}`, warning: true });
    setTimeout(() => setToast(null), 2000);
  }, [setToast]);

  const handleAcceptReviewSuggestion = useCallback((suggestion) => {
    const techNodes = nodes.filter(node => node.type === 'customNode');
    const validNodeIds = new Set(techNodes.map(node => node.id));
    const enrichedSuggestion = enrichSuggestionConnections(suggestion, nodes, edges, connectionRules);
    const existingNode = techNodes.find(node => (
      normalizeSuggestionValue(node.data?.label) === normalizeSuggestionValue(enrichedSuggestion.name) &&
      (node.data?.category || 'backend') === enrichedSuggestion.category
    ));
    const nextNodeId = existingNode?.id || `node_${Date.now()}`;
    const suggestionNode = existingNode || {
      id: nextNodeId,
      type: 'customNode',
      position: computeSuggestedNodePosition(enrichedSuggestion, nodes),
      data: {
        label: enrichedSuggestion.name,
        role: enrichedSuggestion.role,
        reason: enrichedSuggestion.reason,
        category: enrichedSuggestion.category,
        icon: enrichedSuggestion.icon || 'Layers',
        products: Array.isArray(enrichedSuggestion.products) ? enrichedSuggestion.products : []
      }
    };
    const nextNodes = existingNode ? nodes : [...nodes, suggestionNode];
    const existingEdgeKeys = new Set(edges.map(edge => `${edge.source}->${edge.target}`));
    const appendedEdges = [];

    (enrichedSuggestion.connections || []).forEach((connection, index) => {
      const source = connection.source === REVIEW_NEW_NODE_TOKEN ? nextNodeId : connection.source;
      const target = connection.target === REVIEW_NEW_NODE_TOKEN ? nextNodeId : connection.target;

      if (
        !source ||
        !target ||
        source === target ||
        (source !== nextNodeId && !validNodeIds.has(source)) ||
        (target !== nextNodeId && !validNodeIds.has(target))
      ) {
        return;
      }

      const edgeKey = `${source}->${target}`;

      if (existingEdgeKeys.has(edgeKey)) {
        return;
      }

      existingEdgeKeys.add(edgeKey);
      appendedEdges.push({
        id: `e_${Date.now()}_${index}`,
        source,
        target,
        label: connection.label || 'HTTPS',
        animated: simulateFlow
      });
    });

    const nextEdges = appendedEdges.length > 0 ? [...edges, ...appendedEdges] : edges;

    setNodes(nextNodes);
    setEdges(nextEdges);
    setReviewSuggestions(current => current.filter(item => item.id !== suggestion.id));
    setSelectedNode(null);
    setSelectedEdge(null);
    setLeftSidebarOpen(false);

    saveDiagram({
      showToast: false,
      recordVersion: true,
      overrides: {
        nodes: nextNodes,
        edges: nextEdges
      }
    });

    if (rfInstance) {
      setTimeout(() => {
        rfInstance.fitView({ padding: 0.16, duration: 320 });
      }, 80);
    }

    setToast({
      message: existingNode
        ? `REVIEW_ACCEPTED: ${enrichedSuggestion.name.toUpperCase()}_LINKED`
        : `REVIEW_ACCEPTED: ${enrichedSuggestion.name.toUpperCase()}_ADDED`,
      error: false
    });
    setTimeout(() => setToast(null), 2200);
  }, [
    connectionRules,
    edges,
    nodes,
    rfInstance,
    saveDiagram,
    setEdges,
    setLeftSidebarOpen,
    setNodes,
    setSelectedEdge,
    setSelectedNode,
    setToast,
    simulateFlow
  ]);

  return {
    assistantPrompt,
    setAssistantPrompt,
    assistantMessages,
    reviewSuggestions,
    reviewAssistantLoading,
    openReviewQueue,
    handleSendAssistantPrompt,
    handleAcceptReviewSuggestion,
    handleDeclineReviewSuggestion
  };
}
