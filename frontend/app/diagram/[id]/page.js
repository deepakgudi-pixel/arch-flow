'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Maximize2, Minus, Plus } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  MarkerType,
  Controls,
  ControlButton,
  MiniMap,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import api from '@/lib/api';
import { formatTechDisplayLabel } from '@/lib/displayNames';
import {
  estimateEdgeLabelDimensions,
  getEdgeLabelBasePosition,
  resolveEdgeLabelCollisions
} from '@/lib/edgeLabelLayout';
import {
  buildArchitectureReview, buildArchitectureScore,
  buildConnectionTrustProfile,
  buildNodeTrustProfile,
  getReplacementCandidates,
  normalizeTechLabel
} from '@/lib/diagramIntelligence';
import { categoryColors } from '@/lib/theme';
import EditorHeader from '@/components/diagram/EditorHeader';
import NodeDetailsSidebar from '@/components/diagram/NodeDetailsSidebar';
import ConnectionDetailsSidebar from '@/components/diagram/ConnectionDetailsSidebar';
import TechInventoryPanel from '@/components/diagram/TechInventoryPanel';
import HistoryPanel from '@/components/diagram/HistoryPanel';
import ReviewPanel from '@/components/diagram/ReviewPanel';
import DiagramAssistantPanel from '@/components/diagram/DiagramAssistantPanel';
import PromptBar from '@/components/diagram/PromptBar';
import InviteModal from '@/components/diagram/InviteModal';
import SynthesisTerminal from '@/components/diagram/SynthesisTerminal';
import GuidedModePanel from '@/components/diagram/GuidedModePanel';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast from '@/components/ui/Toast';
import {
  Container, MainArea, CanvasWrapper
} from '@/components/diagram/editorStyles';
import {
  GlobalStyle,
  defaultEdgeOptions,
  edgeTypes,
  nodeTypes
} from './editorPageConfig';
import {
  AUTO_LAYOUT,
  GENERIC_PROTOCOL_LABELS,
  buildAutoLayoutResult
} from './editorPageUtils';
import { useDiagramExport } from './hooks/useDiagramExport';
import { useDiagramGeneration } from './hooks/useDiagramGeneration';
import { useDiagramPersistence } from './hooks/useDiagramPersistence';
import { useReviewAssistant } from './hooks/useReviewAssistant';
import { useDiagramSelection } from './hooks/useDiagramSelection';
import { useUndoRedo } from './hooks/useUndoRedo';

export default function DiagramPage() {
  const params = useParams();
  const diagramId = params.id;
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [guidedModeOpen, setGuidedModeOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.archflowDesktopStorage || window.navigator.userAgent.includes('ArchflowDesktop'))) {
      setIsDesktop(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!window.localStorage.getItem('archflow-guided-mode-dismissed')) {
      setGuidedModeOpen(true);
    }
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [rfInstance, setRfInstance] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [customTechPrompt, setCustomTechPrompt] = useState('');
  const [generatingTech, setGeneratingTech] = useState(false);
  const [simulateFlow, setSimulateFlow] = useState(false);
  const [assistantPanelOpen, setAssistantPanelOpen] = useState(false);
  const [reviewPanelOpen, setReviewPanelOpen] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const autoSynthEdgeIdsRef = useRef(new Set());
  const protocolRepairTimeoutRef = useRef(null);
  const {
    selectedNode,
    setSelectedNode,
    selectedEdge,
    setSelectedEdge,
    handleReplaceNode,
    handleFocusFinding,
    handleNodeClick,
    handleEdgeClick,
    handleSelectNodeFlow,
    handlePaneClick,
    deleteSelected
  } = useDiagramSelection({
    nodes,
    edges,
    setNodes,
    setEdges,
    setLeftSidebarOpen,
    setRightPanelOpen,
    setHistoryPanelOpen,
    simulateFlow,
    setToast
  });
  const {
    diagramName,
    inventory,
    versions,
    versionsLoading,
    connectionMode,
    connectionRules,
    saveStatus,
    showConfirmHistory,
    setShowConfirmHistory,
    loadInventory,
    loadVersions,
    saveDiagram,
    handleSelectVersion,
    handleClearHistory,
    confirmClearHistory,
    updateDiagramName,
    handleNameBlur
  } = useDiagramPersistence({
    diagramId,
    isLoaded,
    isSignedIn,
    getToken,
    router,
    nodes,
    edges,
    setNodes,
    setEdges,
    simulateFlow,
    setToast
  });
  const {
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    skipHistoryRef
  } = useUndoRedo({ nodes, edges, setNodes, setEdges });
  const { exportJSON, exportPNG } = useDiagramExport({
    diagramName,
    nodes,
    edges,
    rfInstance,
    setShowExportMenu,
    setToast
  });

  const {
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
  } = useDiagramGeneration({
    diagramId,
    connectionMode,
    connectionRules,
    saveDiagram,
    loadVersions,
    setNodes,
    setEdges,
    simulateFlow,
    setToast
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !diagramId) {
      return;
    }

    const promptKey = `archflow-example-prompt:${diagramId}`;
    const examplePrompt = window.localStorage.getItem(promptKey);

    if (examplePrompt) {
      setPrompt(examplePrompt);
      window.localStorage.removeItem(promptKey);
      setToast({ message: 'SHOWCASE_PROMPT_READY: Review then synthesize', error: false });
      setTimeout(() => setToast(null), 3200);
    }
  }, [diagramId, setPrompt, setToast]);
  const {
    assistantPrompt,
    setAssistantPrompt,
    assistantMessages,
    reviewSuggestions,
    reviewAssistantLoading,
    handleSendAssistantPrompt,
    handleAcceptReviewSuggestion,
    handleDeclineReviewSuggestion
  } = useReviewAssistant({
    userId: user?.id,
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
  });

  const handleGenerateTech = async () => {
    if (!customTechPrompt.trim()) return;

    setGeneratingTech(true);
    try {
      const tech = await api.generateTech({ description: customTechPrompt });
      await api.addToInventory(tech);
      await loadInventory();
      setCustomTechPrompt('');
      setToast({ message: 'TECH_SYNTHESIS: SUCCESS', error: false });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error('Tech generation failed:', err);
      setToast({ message: 'TECH_SYNTHESIS: FAILED', error: true });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setGeneratingTech(false);
    }
  };

  const deleteFromInventory = async (techId) => {
    try {
      await api.deleteFromInventory(techId);
      await loadInventory();
      setToast({ message: 'TECH_REMOVED', error: false });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error('Failed to delete tech:', err);
      setToast({ message: 'TECH_REMOVAL_FAILED', error: true });
      setTimeout(() => setToast(null), 3000);
    }
  };

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
  }, [setEdges, nodes, simulateFlow]);

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
  }, [setEdges, nodes]);

  useEffect(() => {
    const hasRepairableEdge = edges.some(edge => {
      const normalizedLabel = (edge.label || '').trim().toUpperCase();
      return (normalizedLabel === 'CONNECTION' || normalizedLabel === '') &&
        !autoSynthEdgeIdsRef.current.has(edge.id);
    });

    if (!hasRepairableEdge) {
      return;
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

  const fetchInviteCode = async () => {
    try {
      const data = await api.getInviteCode(params.id);
      setInviteCode(data.inviteCode);

      const colabs = await api.getCollaborators(params.id);
      setCollaborators(colabs);
    } catch (err) {
      console.error('Failed to load collaboration data:', err);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    try {
      await api.removeCollaborator(params.id, userId);
      setCollaborators(prev => prev.filter(c => c.id !== userId));
      setToast({ message: 'COLLABORATOR_REMOVED', error: false });
    } catch (err) {
      setToast({ message: 'REMOVE_FAILED', error: true });
    }
  };

  useEffect(() => {
    if (showInviteModal && !inviteCode) {
      fetchInviteCode();
    }
  }, [showInviteModal]);

  const copyInvite = () => {
    try {
      navigator.clipboard.writeText(inviteCode);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    } catch {
      setToast({ message: 'Failed to copy — browser denied clipboard access', error: true });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDragStart = (e, tech) => {
    e.dataTransfer.setData('tech', JSON.stringify(tech));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const techData = e.dataTransfer.getData('tech');
    if (!techData) return;

    let tech;
    try {
      tech = JSON.parse(techData);
    } catch {
      setToast({ message: 'Invalid tech data', error: true });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const reactFlowBounds = e.target.getBoundingClientRect();
    const position = {
      x: e.clientX - reactFlowBounds.left - 70,
      y: e.clientY - reactFlowBounds.top - 30
    };

    const newNode = {
      id: `node_${Date.now()}`,
      type: 'customNode',
      position,
      data: {
        label: tech.name,
        role: tech.description || tech.role || tech.name,
        category: tech.category,
        icon: tech.icon,
        products: tech.products || []
      }
    };

    setNodes(nds => [...nds, newNode]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const layoutNodes = useCallback(() => {
    const layoutResult = buildAutoLayoutResult(nodes, edges);

    if (!layoutResult) {
      return;
    }

    setNodes(layoutResult.nodes);

    if (selectedNode?.id) {
      const refreshedSelection = layoutResult.arrangedNodes.find(node => node.id === selectedNode.id) || null;
      setSelectedNode(refreshedSelection);
    }
    
    setTimeout(() => {
      if (rfInstance) {
        rfInstance.fitView({ padding: 0.16, duration: 900 });
      }
    }, 50);

    setToast({ message: `AUTO_LAYOUT_OPTIMIZED: ${layoutResult.arrangedNodes.length}_NODES`, error: false });
    setTimeout(() => setToast(null), 2000);
  }, [edges, nodes, rfInstance, selectedNode, setNodes]);

  useEffect(() => {
    setEdges(eds => eds.map(edge => ({ ...edge, animated: simulateFlow })));
  }, [simulateFlow, setEdges]);

  const handleOptimizeTo100 = useCallback(() => {
    const findings = buildArchitectureReview({ nodes, edges, connectionRules, connectionMode });
    const techNodes = nodes.filter(n => n.type === 'customNode');
    const nodeById = new Map(techNodes.map(n => [n.id, n]));
    const existingLabels = new Set(techNodes.map(n => normalizeTechLabel(n.data.label)));
    const existingCategories = new Set(techNodes.map(n => n.data.category));
    const hasBackend = existingCategories.has('backend');
    const primaryBackend = techNodes.find(n => n.data?.category === 'backend');
    const additions = [];

    const optiMap = [
      { title: 'NO_AUTH_LAYER', label: 'CLERK', category: 'auth', icon: 'shield', role: 'Authentication and user management', check: () => !existingCategories.has('auth') && hasBackend },
      { title: 'NO_OBSERVABILITY_LAYER', label: 'GRAFANA', category: 'devops', icon: 'bar-chart', role: 'Monitoring and observability', check: () => !existingCategories.has('devops') && techNodes.length >= 5 && hasBackend },
      { title: 'MISSING_CACHE_LAYER', label: 'REDIS', category: 'database', icon: 'database', role: 'Caching and session store', check: () => !existingLabels.has('REDIS') && (nodes.filter(n => n.data?.category === 'database').length >= 2) && hasBackend },
      { title: 'MISSING_ASYNC_PROCESSING', label: 'KAFKA', category: 'queue', icon: 'message-square', role: 'Async message broker and event stream', check: () => !existingCategories.has('queue') && (nodes.filter(n => n.data?.category === 'backend').length >= 2) && hasBackend },
      { title: 'NO_STORAGE_LAYER', label: 'S3', category: 'storage', icon: 'hard-drive', role: 'Object storage for assets', check: () => !existingCategories.has('storage') && techNodes.length >= 4 && hasBackend },
      { title: 'MISSING_TRAFFIC_MANAGEMENT', label: 'NGINX', category: 'devops', icon: 'server', role: 'Reverse proxy and load balancer', check: () => !existingLabels.has('NGINX') && techNodes.length >= 6 && hasBackend },
      { title: 'SINGLE_DATASTORE_PRESSURE', label: `${primaryBackend?.name || 'DB'}_REPLICA`, category: 'database', icon: 'database', role: 'Read replica for scaling', check: () => hasBackend && existingCategories.has('database') && nodes.filter(n => n.data?.category === 'database').length === 1 },
    ];

    findings.forEach(finding => {
      const match = optiMap.find(o => o.title === finding.title && o.check());
      if (!match) return;
      if (additions.some(a => a.label === match.label)) return;
      const id = `node_opt_${Date.now()}_${additions.length}`;
      const rightmostX = Math.max(...techNodes.map(n => n.position?.x || 0), 120);
      const anchorY = Math.round((techNodes.reduce((s, n) => s + (n.position?.y || 0), 0) / Math.max(techNodes.length, 1)));
      additions.push({ id, match, x: rightmostX + 220 + additions.length * 60, y: anchorY + additions.length * 80 });
    });

    if (additions.length === 0) {
      setToast({ message: 'ARCHITECTURE_ALREADY_OPTIMAL: All scores 100/100', error: false });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const newNodes = [...nodes];
    const newEdges = [...edges];

    additions.forEach(({ id, match, x, y }) => {
      newNodes.push({
        id, type: 'customNode',
        position: { x, y },
        data: { label: match.label, category: match.category, role: match.role, reason: `Auto-added: missing ${match.category} layer`, icon: match.icon, products: [] }
      });
      if (primaryBackend) {
        const label = match.category === 'auth' ? 'OIDC' : match.category === 'queue' ? 'KAFKA' : match.category === 'storage' ? 'S3' : 'HTTPS';
        newEdges.push({ id: `e_opt_${id}`, source: primaryBackend.id, target: id, label, animated: simulateFlow });
      }
    });

    skipHistoryRef.current = true;
    setNodes(newNodes);
    setEdges(newEdges);

    setToast({ message: `OPTIMIZED: Added ${additions.length} missing layer${additions.length > 1 ? 's' : ''} (${additions.map(a => a.match.label).join(', ')})`, error: false });
    setTimeout(() => setToast(null), 3500);
  }, [nodes, edges, connectionRules, connectionMode, simulateFlow]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }
  const protocolDisplayMode = 'context';

  const reviewFindings = buildArchitectureReview({
    nodes,
    edges,
    connectionRules,
    connectionMode
  });
  const selectedNodeTrustProfile = buildNodeTrustProfile(selectedNode, reviewFindings);
  const selectedConnectionProfile = buildConnectionTrustProfile(selectedEdge, nodes, reviewFindings);
  const replacementCandidates = getReplacementCandidates(
    inventory,
    selectedNode?.data.category,
    selectedNode?.data.label
  );
  const nodeById = new Map(nodes.filter(node => node.type === 'customNode').map(node => [node.id, node]));
  const focusedNodeIds = new Set();

  if (selectedEdge) {
    focusedNodeIds.add(selectedEdge.source);
    focusedNodeIds.add(selectedEdge.target);
  }

  if (selectedNode) {
    focusedNodeIds.add(selectedNode.id);
    edges.forEach(edge => {
      if (edge.source === selectedNode.id) {
        focusedNodeIds.add(edge.target);
      }
      if (edge.target === selectedNode.id) {
        focusedNodeIds.add(edge.source);
      }
    });
  }

  const displayNodes = nodes.map(node => {
    if (node.type !== 'customNode') {
      return node;
    }

    const highlighted = focusedNodeIds.has(node.id);
    return {
      ...node,
      data: {
        ...node.data,
        highlighted,
        dimmed: focusedNodeIds.size > 0 && !highlighted
      }
    };
  });
  const selectedNodeConnectedFlows = selectedNode
    ? edges
        .filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id)
        .map(edge => {
          const profile = buildConnectionTrustProfile(edge, nodes, reviewFindings);
          const sourceNode = nodeById.get(edge.source);
          const targetNode = nodeById.get(edge.target);
          const routeText = `${sourceNode ? formatTechDisplayLabel(sourceNode.data?.label, sourceNode.data?.category) : edge.source} → ${targetNode ? formatTechDisplayLabel(targetNode.data?.label, targetNode.data?.category) : edge.target}`;

          return {
            id: edge.id,
            label: edge.label || 'Connection',
            routeText,
            direction: edge.source === selectedNode.id ? 'OUTGOING' : 'INCOMING',
            confidence: profile?.confidence || 'LOW',
            confidenceLabel: profile?.confidenceLabel || 'REVIEW'
          };
        })
    : [];
  const activeUtilityPanel = assistantPanelOpen
    ? {
        key: 'assistant',
        width: 390,
        content: (
          <DiagramAssistantPanel
            messages={assistantMessages}
            prompt={assistantPrompt}
            onPromptChange={setAssistantPrompt}
            onSend={handleSendAssistantPrompt}
            loading={reviewAssistantLoading}
            pendingSuggestionCount={reviewSuggestions.length}
            onClose={() => setAssistantPanelOpen(false)}
          />
        )
      }
    : reviewPanelOpen
    ? {
        key: 'review',
        width: 380,
        content: (
          <ReviewPanel
            findings={reviewFindings}
            suggestions={reviewSuggestions}
            nodes={nodes.filter(node => node.type === 'customNode')}
            edges={edges}
            connectionMode={connectionMode}
            nodeCount={nodes.filter(node => node.type === 'customNode').length}
            edgeCount={edges.length}
            onFocusFinding={handleFocusFinding}
            onAcceptSuggestion={handleAcceptReviewSuggestion}
            onDeclineSuggestion={handleDeclineReviewSuggestion}
            onClose={() => setReviewPanelOpen(false)}
            architectureScore={buildArchitectureScore(reviewFindings, nodes, edges)}
            autoFixes={generationAutoFixes}
          />
        )
      }
    : historyPanelOpen
      ? {
          key: 'history',
          width: 320,
          content: (
            <HistoryPanel
              versions={versions}
              currentNodes={nodes}
              currentEdges={edges}
              onSelectVersion={handleSelectVersion}
              onClearHistory={handleClearHistory}
              onClose={() => setHistoryPanelOpen(false)}
              loading={versionsLoading}
            />
          )
        }
      : null;
  const edgeDisplaySeeds = edges.map(edge => {
    const isSelected = selectedEdge?.id === edge.id || edge.selected;
    const showProtocol =
      protocolDisplayMode === 'all' ||
      isSelected;
    const sourceNode = nodeById.get(edge.source);
    const targetNode = nodeById.get(edge.target);

    const sourceWidth = sourceNode?.width || sourceNode?.measured?.width || sourceNode?.style?.width || AUTO_LAYOUT.nodeWidth;
    const sourceHeight = sourceNode?.height || sourceNode?.measured?.height || sourceNode?.style?.height || AUTO_LAYOUT.nodeHeight;
    const targetWidth = targetNode?.width || targetNode?.measured?.width || targetNode?.style?.width || AUTO_LAYOUT.nodeWidth;
    const targetHeight = targetNode?.height || targetNode?.measured?.height || targetNode?.style?.height || AUTO_LAYOUT.nodeHeight;
    const sourceX = (sourceNode?.position?.x || 0) + (Number(sourceWidth) / 2);
    const sourceY = (sourceNode?.position?.y || 0) + (Number(sourceHeight) / 2);
    const targetX = (targetNode?.position?.x || 0) + (Number(targetWidth) / 2);
    const targetY = (targetNode?.position?.y || 0) + (Number(targetHeight) / 2);
    const routeText = `${sourceNode ? formatTechDisplayLabel(sourceNode.data?.label, sourceNode.data?.category) : edge.source} → ${targetNode ? formatTechDisplayLabel(targetNode.data?.label, targetNode.data?.category) : edge.target}`;

    return {
      edge,
      isSelected,
      showProtocol,
      routeText,
      sourceX,
      sourceY,
      targetX,
      targetY
    };
  });
  const labelLayoutsByEdgeId = new Map(
    resolveEdgeLabelCollisions(
      edgeDisplaySeeds
        .filter(seed => seed.showProtocol)
        .sort((left, right) => Number(right.isSelected) - Number(left.isSelected))
        .map(seed => {
          const dimensions = estimateEdgeLabelDimensions({
            label: seed.edge.label || 'Connection',
            routeText: seed.routeText
          });
          const basePosition = getEdgeLabelBasePosition({
            edgeId: seed.edge.id,
            sourceX: seed.sourceX,
            sourceY: seed.sourceY,
            targetX: seed.targetX,
            targetY: seed.targetY,
            selected: seed.isSelected
          });

          return {
            id: seed.edge.id,
            baseX: basePosition.x,
            baseY: basePosition.y,
            width: dimensions.width,
            height: dimensions.height
          };
        })
    ).map(layout => [layout.id, layout])
  );
  const displayEdges = edgeDisplaySeeds.map(seed => {
    const labelLayout = labelLayoutsByEdgeId.get(seed.edge.id);
    const isContextRelated = protocolDisplayMode === 'context' && selectedNode && (
      seed.edge.source === selectedNode.id || seed.edge.target === selectedNode.id
    );
    const isContextUnrelated = protocolDisplayMode === 'context' && selectedNode && !isContextRelated;

    return {
      ...seed.edge,
      type: 'protocolEdge',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: seed.isSelected ? '#FF3D00' : isContextRelated ? '#FF7A45' : '#000000',
        width: 16,
        height: 16
      },
      data: {
        ...(seed.edge.data || {}),
        protocolDisplayMode,
        showProtocol: protocolDisplayMode === 'all' ? seed.showProtocol : Boolean(seed.isSelected),
        routeText: seed.routeText,
        labelShiftX: labelLayout?.shiftX || 0,
        labelShiftY: labelLayout?.shiftY || 0,
        highlighted: isContextRelated,
        dimmed: isContextUnrelated
      }
    };
  });

  return (
    <>
      <GlobalStyle $isDesktop={isDesktop} />
      <Container>
        <EditorHeader
          diagramName={diagramName}
          onDiagramNameChange={updateDiagramName}
          onDiagramNameBlur={handleNameBlur}
          hasSelection={Boolean(selectedNode || selectedEdge)}
          selectionKind={
            selectedConnectionProfile
              ? 'SELECTED_FLOW'
              : selectedNode
                ? `SELECTED_${(selectedNode.data.category || 'unit').toUpperCase()}`
                : null
          }
          selectionLabel={
            selectedConnectionProfile
              ? `${selectedConnectionProfile.sourceLabel} → ${selectedConnectionProfile.targetLabel}`
              : selectedNode
                ? formatTechDisplayLabel(selectedNode.data.label, selectedNode.data.category)
                : null
          }
          onDeleteSelection={deleteSelected}
          rightPanelOpen={rightPanelOpen}
          onToggleRightPanel={() => {
            const nextState = !rightPanelOpen;
            setRightPanelOpen(nextState);
            if (nextState) {
              setAssistantPanelOpen(false);
              setHistoryPanelOpen(false);
              setReviewPanelOpen(false);
            }
          }}
          assistantPanelOpen={assistantPanelOpen}
          onToggleAssistantPanel={() => {
            const nextState = !assistantPanelOpen;
            setAssistantPanelOpen(nextState);
            if (nextState) {
              setRightPanelOpen(false);
              setHistoryPanelOpen(false);
              setReviewPanelOpen(false);
              setLeftSidebarOpen(false);
            }
          }}
          reviewPanelOpen={reviewPanelOpen}
          reviewSuggestionCount={reviewSuggestions.length}
          onToggleReviewPanel={() => {
            const nextState = !reviewPanelOpen;
            setReviewPanelOpen(nextState);
            if (nextState) {
              setAssistantPanelOpen(false);
              setRightPanelOpen(false);
              setHistoryPanelOpen(false);
              setLeftSidebarOpen(false);
            }
          }}
          historyPanelOpen={historyPanelOpen}
          onToggleHistoryPanel={() => {
            const nextState = !historyPanelOpen;
            setHistoryPanelOpen(nextState);
            if (nextState) {
              setAssistantPanelOpen(false);
              setRightPanelOpen(false);
              setReviewPanelOpen(false);
              setLeftSidebarOpen(false);
            }
          }}
          showExportMenu={showExportMenu}
          onToggleExportMenu={() => setShowExportMenu(!showExportMenu)}
          onSave={() => saveDiagram({ showToast: true, recordVersion: true })}
          onExportPNG={exportPNG}
          onExportJSON={exportJSON}
          simulateFlow={simulateFlow}
          onToggleSimulateFlow={() => setSimulateFlow(!simulateFlow)}
          onOpenInvite={() => setShowInviteModal(true)}
          saveStatus={saveStatus}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onOptimize={handleOptimizeTo100}
          onOpenGuidedMode={() => setGuidedModeOpen(true)}
        />

        <MainArea>
          <ConnectionDetailsSidebar
            open={leftSidebarOpen && Boolean(selectedEdge)}
            onClose={() => {
              setLeftSidebarOpen(false);
              setSelectedEdge(null);
            }}
            selectedEdge={selectedEdge}
            connectionProfile={selectedConnectionProfile}
            onDeleteEdge={deleteSelected}
          />
          <NodeDetailsSidebar
            open={leftSidebarOpen && Boolean(selectedNode) && !selectedEdge}
            onClose={() => {
              setLeftSidebarOpen(false);
              setSelectedNode(null);
            }}
            selectedNode={selectedNode}
            trustProfile={selectedNodeTrustProfile}
            replacementOptions={replacementCandidates}
            connectedFlows={selectedNodeConnectedFlows}
            onSelectFlow={handleSelectNodeFlow}
            onReplaceNode={handleReplaceNode}
          />

          <CanvasWrapper onDrop={handleDrop} onDragOver={handleDragOver}>
            <ReactFlow
              nodes={displayNodes}
              edges={displayEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              onPaneClick={handlePaneClick}
              onInit={setRfInstance}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              minZoom={0.05}
              maxZoom={2}
              fitView
              snapToGrid
              snapGrid={[20, 20]}
            >
              <Background color="#000" gap={20} size={1} />
              <Background id="1" color="#000" gap={100} size={2} style={{ opacity: 0.1 }} />
              <Controls showZoom={false} showFitView={false} showInteractive={false}>
                <ControlButton
                  title="auto arrange nodes"
                  aria-label="auto arrange nodes"
                  onClick={layoutNodes}
                  style={{ display: 'grid', placeItems: 'center', lineHeight: 0 }}
                >
                  <LayoutGrid size={15} strokeWidth={2.4} />
                </ControlButton>
                <ControlButton
                  title="zoom in"
                  aria-label="zoom in"
                  onClick={() => rfInstance?.zoomIn?.({ duration: 180 })}
                  style={{ display: 'grid', placeItems: 'center', lineHeight: 0 }}
                >
                  <Plus size={15} strokeWidth={2.4} />
                </ControlButton>
                <ControlButton
                  title="zoom out"
                  aria-label="zoom out"
                  onClick={() => rfInstance?.zoomOut?.({ duration: 180 })}
                  style={{ display: 'grid', placeItems: 'center', lineHeight: 0 }}
                >
                  <Minus size={15} strokeWidth={2.4} />
                </ControlButton>
                <ControlButton
                  title="fit view"
                  aria-label="fit view"
                  onClick={() => rfInstance?.fitView?.({ padding: 0.16, duration: 280 })}
                  style={{ display: 'grid', placeItems: 'center', lineHeight: 0 }}
                >
                  <Maximize2 size={15} strokeWidth={2.2} />
                </ControlButton>
              </Controls>
              <MiniMap
                nodeColor={n => n.type === 'zoneNode' ? 'rgba(0, 0, 0, 0.08)' : categoryColors[n.data?.category] || '#000000'}
                maskColor="rgba(0, 0, 0, 0.05)"
              />
            </ReactFlow>

            <PromptBar
              prompt={prompt}
              onPromptChange={setPrompt}
              template={template}
              onTemplateChange={setTemplate}
              loading={loading}
              onGenerate={handleGenerate}
            />

            {guidedModeOpen && (
              <GuidedModePanel
                onClose={() => {
                  setGuidedModeOpen(false);
                  window.localStorage.setItem('archflow-guided-mode-dismissed', 'true');
                }}
                onOpenAssistant={() => {
                  setGuidedModeOpen(false);
                  setAssistantPanelOpen(true);
                  setReviewPanelOpen(false);
                  setRightPanelOpen(false);
                  setHistoryPanelOpen(false);
                }}
                onOpenReview={() => {
                  setGuidedModeOpen(false);
                  setReviewPanelOpen(true);
                  setAssistantPanelOpen(false);
                  setRightPanelOpen(false);
                  setHistoryPanelOpen(false);
                }}
              />
            )}
          </CanvasWrapper>

          <TechInventoryPanel
            open={rightPanelOpen}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            inventory={inventory}
            customTechPrompt={customTechPrompt}
            onCustomTechPromptChange={setCustomTechPrompt}
            generatingTech={generatingTech}
            onGenerateTech={handleGenerateTech}
            onDragStart={handleDragStart}
            onDeleteFromInventory={deleteFromInventory}
            onClose={() => setRightPanelOpen(false)}
          />

          <AnimatePresence mode="wait" initial={false}>
            {activeUtilityPanel && (
              <motion.div
                key={activeUtilityPanel.key}
                initial={{ x: activeUtilityPanel.width, opacity: 0.96 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: activeUtilityPanel.width, opacity: 0.96 }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: activeUtilityPanel.width,
                  background: '#fff',
                  zIndex: 1000,
                  borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '10px 0px 20px rgba(0,0,0,0.1)'
                }}
              >
                {activeUtilityPanel.content}
              </motion.div>
            )}
          </AnimatePresence>
        </MainArea>

      </Container>

      <InviteModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        inviteCode={inviteCode}
        isCopying={isCopying}
        onCopyInvite={copyInvite}
        collaborators={collaborators}
        onRemoveCollaborator={handleRemoveCollaborator}
      />

      {toast && (
        <Toast $tone={toast.error ? 'error' : toast.warning ? 'warning' : 'success'}>
          {toast.message}
        </Toast>
      )}

      {isStreaming && (
        <SynthesisTerminal 
          content={streamingContent} 
          error={streamError}
          onRetry={handleGenerate}
          onClose={() => setIsStreaming(false)}
        />
      )}

      <ConfirmModal
        open={showConfirmHistory}
        title="IRREVERSIBLE_ACTION: PURGE_HISTORY"
        message="YOU ARE ABOUT TO DELETE ALL ARCHITECTURAL SNAPSHOTS FOR THIS PROJECT. THIS DATA CANNOT BE RECOVERED. PROCEED?"
        onConfirm={confirmClearHistory}
        onCancel={() => setShowConfirmHistory(false)}
      />
    </>
  );
}
