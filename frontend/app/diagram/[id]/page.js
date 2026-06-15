'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Maximize2, Minus, Plus } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ReactFlow, {
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
import { architectureExamples } from '@/lib/architectureExamples';
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
  getReplacementCandidates
} from '@/lib/diagramIntelligence';
import { buildOptimizeTo100Result } from '@/lib/diagramOptimizer';
import { buildDiagramViewProjection } from '@/lib/diagramViewModes';
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
import DiagramViewControls from '@/components/diagram/DiagramViewControls';
import ArchitectureTrustBar from '@/components/diagram/ArchitectureTrustBar';
import ArchitecturePresentation from '@/components/diagram/ArchitecturePresentation';
import EmptyCanvasState from '@/components/diagram/EmptyCanvasState';
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
  buildAutoLayoutResult
} from './editorPageUtils';
import { useDiagramExport } from './hooks/useDiagramExport';
import { useDiagramGeneration } from './hooks/useDiagramGeneration';
import { useDiagramPersistence } from './hooks/useDiagramPersistence';
import { useReviewAssistant } from './hooks/useReviewAssistant';
import { useDiagramSelection } from './hooks/useDiagramSelection';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useProtocolSynthesis } from './hooks/useProtocolSynthesis';
import { useDiagramCollaboration } from './hooks/useDiagramCollaboration';
import { useTechInventoryActions } from './hooks/useTechInventoryActions';

export default function DiagramPage() {
  const params = useParams();
  const diagramId = params.id;
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [guidedModeOpen, setGuidedModeOpen] = useState(false);
  const [activeExample, setActiveExample] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.archflowDesktopStorage || window.navigator.userAgent.includes('ArchflowDesktop'))) {
      setIsDesktop(true);
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [rfInstance, setRfInstance] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [simulateFlow, setSimulateFlow] = useState(false);
  const [diagramViewMode, setDiagramViewMode] = useState('full');
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [assistantPanelOpen, setAssistantPanelOpen] = useState(false);
  const [reviewPanelOpen, setReviewPanelOpen] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [pendingAutoSynthesis, setPendingAutoSynthesis] = useState(null);
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
    handleNodeDragStart,
    handleNodeDragStop,
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
    generationProgress,
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
    const metaKey = `archflow-example-meta:${diagramId}`;
    const examplePrompt = window.localStorage.getItem(promptKey);
    const exampleMeta = window.localStorage.getItem(metaKey);

    if (examplePrompt) {
      setPrompt(examplePrompt);
      window.localStorage.removeItem(promptKey);
      const autoSynthesizeKey = `archflow-example-autosynthesize:${diagramId}`;
      const shouldAutoSynthesize = window.localStorage.getItem(autoSynthesizeKey) === 'true';
      window.localStorage.removeItem(autoSynthesizeKey);
      let parsedMeta = null;
      try {
        parsedMeta = exampleMeta ? JSON.parse(exampleMeta) : null;
      } catch {
        parsedMeta = null;
      }
      const inferredExample = architectureExamples.find(example => example.prompt === examplePrompt);
      const nextExample = parsedMeta || inferredExample;

      if (nextExample?.id) {
        const nextTemplate = `example:${nextExample.id}`;
        setActiveExample(nextExample);
        setTemplate(nextTemplate);
        if (shouldAutoSynthesize) {
          setPendingAutoSynthesis({
            prompt: examplePrompt,
            template: nextTemplate
          });
        }
      }

      setToast({
        message: shouldAutoSynthesize ? 'SHOWCASE_SYNTHESIS_STARTING' : 'SHOWCASE_PROMPT_READY: Review then synthesize',
        error: false
      });
      setTimeout(() => setToast(null), 3200);
    }
  }, [diagramId, setPrompt, setTemplate, setToast]);

  useEffect(() => {
    if (!pendingAutoSynthesis || loading || isStreaming) {
      return undefined;
    }

    if (
      prompt !== pendingAutoSynthesis.prompt ||
      template !== pendingAutoSynthesis.template
    ) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPendingAutoSynthesis(null);
      handleGenerate();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [handleGenerate, isStreaming, loading, pendingAutoSynthesis, prompt, template]);
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
  const {
    showInviteModal,
    setShowInviteModal,
    inviteCode,
    isCopying,
    copyInvite,
    collaborators,
    handleRemoveCollaborator
  } = useDiagramCollaboration({
    diagramId,
    setToast
  });
  const {
    customTechPrompt,
    setCustomTechPrompt,
    generatingTech,
    handleGenerateTech,
    deleteFromInventory,
    handleDragStart,
    handleDrop,
    handleDragOver
  } = useTechInventoryActions({
    loadInventory,
    setNodes,
    setToast
  });

  const {
    onConnect,
    synthesizeProtocols
  } = useProtocolSynthesis({
    nodes,
    edges,
    setEdges,
    simulateFlow,
    setToast
  });

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
    const optimized = buildOptimizeTo100Result({
      nodes,
      edges,
      connectionRules,
      connectionMode,
      simulateFlow,
      idPrefix: 'node_opt',
      reasonPrefix: 'Auto-added'
    });

    if (optimized.additions.length === 0) {
      setToast({ message: 'ARCHITECTURE_ALREADY_OPTIMAL: All scores 100/100', error: false });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    skipHistoryRef.current = true;
    setNodes(optimized.nodes);
    setEdges(optimized.edges);

    setToast({ message: `OPTIMIZED: Added ${optimized.additions.length} missing layer${optimized.additions.length > 1 ? 's' : ''} (${optimized.additions.map(addition => addition.label).join(', ')})`, error: false });
    setTimeout(() => setToast(null), 3500);
  }, [nodes, edges, connectionRules, connectionMode, simulateFlow]);

  const launchDemoInNewProject = useCallback(async (example) => {
    if (!example) {
      return;
    }

    setToast({ message: `OPENING_${example.name.toUpperCase()}_DEMO_PROJECT`, error: false });

    try {
      const diagram = await api.createDiagram({
        name: `${example.name} Architecture Demo`,
        template: 'blank'
      });

      window.localStorage.setItem(
        `archflow-example-prompt:${diagram.id}`,
        example.prompt
      );
      window.localStorage.setItem(
        `archflow-example-meta:${diagram.id}`,
        JSON.stringify({
          id: example.id,
          name: example.name,
          audience: example.audience
        })
      );
      window.localStorage.setItem(`archflow-example-autosynthesize:${diagram.id}`, 'true');
      router.push(`/diagram/${diagram.id}`);
    } catch (error) {
      console.error('Failed to launch demo project:', error);
      setToast({ message: 'DEMO_PROJECT_LAUNCH_FAILED', error: true });
      setTimeout(() => setToast(null), 3200);
    }
  }, [router, setToast]);

  const handlePromptBarGenerate = useCallback(() => {
    const selectedExampleId = template.startsWith('example:')
      ? template.replace('example:', '')
      : null;
    const selectedExample = selectedExampleId
      ? architectureExamples.find(example => example.id === selectedExampleId)
      : null;

    if (activeExample && selectedExample && selectedExample.id !== activeExample.id) {
      launchDemoInNewProject(selectedExample);
      return;
    }

    handleGenerate();
  }, [activeExample, handleGenerate, launchDemoInNewProject, template]);

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
  const architectureScore = buildArchitectureScore(reviewFindings, nodes, edges);
  const selectedNodeTrustProfile = buildNodeTrustProfile(selectedNode, reviewFindings);
  const selectedConnectionProfile = buildConnectionTrustProfile(selectedEdge, nodes, reviewFindings);
  const replacementCandidates = getReplacementCandidates(
    inventory,
    selectedNode?.data.category,
    selectedNode?.data.label
  );
  const nodeById = new Map(nodes.filter(node => node.type === 'customNode').map(node => [node.id, node]));
  const techNodes = nodes.filter(node => node.type === 'customNode');
  const viewProjection = buildDiagramViewProjection({
    nodes,
    edges,
    mode: diagramViewMode
  });
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
    const viewHighlighted = viewProjection.highlightedNodeIds.has(node.id);
    const viewDimmed = viewProjection.dimmedNodeIds.has(node.id);
    const hasFocusedSelection = focusedNodeIds.size > 0;

    return {
      ...node,
      hidden: viewProjection.hiddenNodeIds.has(node.id),
      data: {
        ...node.data,
        highlighted: hasFocusedSelection ? highlighted : viewHighlighted,
        dimmed: (hasFocusedSelection && !highlighted) || viewDimmed
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
            nodeCount={techNodes.length}
            edgeCount={edges.length}
            onFocusFinding={handleFocusFinding}
            onAcceptSuggestion={handleAcceptReviewSuggestion}
            onDeclineSuggestion={handleDeclineReviewSuggestion}
            onClose={() => setReviewPanelOpen(false)}
            architectureScore={architectureScore}
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
    const viewHighlighted = viewProjection.highlightedEdgeIds.has(seed.edge.id);
    const viewDimmed = viewProjection.dimmedEdgeIds.has(seed.edge.id);

    return {
      ...seed.edge,
      hidden: viewProjection.hiddenEdgeIds.has(seed.edge.id),
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
        highlighted: isContextRelated || viewHighlighted,
        dimmed: isContextUnrelated || viewDimmed
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
          onPresent={() => setPresentationOpen(true)}
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
            <ArchitectureTrustBar
              score={architectureScore}
              findings={reviewFindings}
              nodes={techNodes}
              edges={edges}
              activeExample={activeExample}
              autoFixes={generationAutoFixes}
              onOpenReview={() => {
                setReviewPanelOpen(true);
                setAssistantPanelOpen(false);
                setRightPanelOpen(false);
                setHistoryPanelOpen(false);
              }}
              onPresent={() => setPresentationOpen(true)}
            />
            <DiagramViewControls value={diagramViewMode} onChange={setDiagramViewMode} />
            <ReactFlow
              nodes={displayNodes}
              edges={displayEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDragStart={handleNodeDragStart}
              onNodeDragStop={handleNodeDragStop}
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

            {techNodes.length === 0 && !loading && (
              <EmptyCanvasState
                activeExample={activeExample}
                onUsePrompt={(quickPrompt) => {
                  setPrompt(quickPrompt);
                  setToast({ message: 'Prompt ready. Press Synthesize to generate.', error: false });
                  setTimeout(() => setToast(null), 2400);
                }}
                onOpenGuide={() => setGuidedModeOpen(true)}
              />
            )}

            <PromptBar
              prompt={prompt}
              onPromptChange={setPrompt}
              template={template}
              onTemplateChange={setTemplate}
              loading={loading}
              onGenerate={handlePromptBarGenerate}
              activeExample={activeExample}
            />

            {guidedModeOpen && (
              <GuidedModePanel
                activeExample={activeExample}
                onClose={() => {
                  setGuidedModeOpen(false);
                  window.localStorage.setItem('archflow-guided-mode-dismissed', 'true');
                }}
                onGenerate={() => {
                  setGuidedModeOpen(false);
                  handlePromptBarGenerate();
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
          progress={generationProgress}
          onRetry={handleGenerate}
          onClose={() => setIsStreaming(false)}
        />
      )}

      <ArchitecturePresentation
        open={presentationOpen}
        onClose={() => setPresentationOpen(false)}
        diagramName={diagramName}
        nodes={techNodes}
        edges={edges}
        findings={reviewFindings}
        score={architectureScore}
        activeExample={activeExample}
      />

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
