'use client';

import { createGlobalStyle } from 'styled-components';
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
  useEdgesState,
  getRectOfNodes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import api, { setToken } from '@/lib/api';
import { formatTechDisplayLabel } from '@/lib/displayNames';
import {
  estimateEdgeLabelDimensions,
  getEdgeLabelBasePosition,
  resolveEdgeLabelCollisions
} from '@/lib/edgeLabelLayout';
import {
  buildArchitectureReview,
  buildConnectionTrustProfile,
  buildNodeTrustProfile,
  getReplacementCandidates
} from '@/lib/diagramIntelligence';
import { categoryColors } from '@/lib/theme';
import { CustomNode } from '@/components/diagram/CustomNode';
import { ZoneNode } from '@/components/diagram/ZoneNode';
import { ProtocolEdge } from '@/components/diagram/ProtocolEdge';
import EditorHeader from '@/components/diagram/EditorHeader';
import NodeDetailsSidebar from '@/components/diagram/NodeDetailsSidebar';
import ConnectionDetailsSidebar from '@/components/diagram/ConnectionDetailsSidebar';
import TechInventoryPanel from '@/components/diagram/TechInventoryPanel';
import HistoryPanel from '@/components/diagram/HistoryPanel';
import ReviewPanel from '@/components/diagram/ReviewPanel';
import PromptBar from '@/components/diagram/PromptBar';
import InviteModal from '@/components/diagram/InviteModal';
import SynthesisTerminal from '@/components/diagram/SynthesisTerminal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast from '@/components/ui/Toast';
import {
  Container, MainArea, CanvasWrapper, EmptyCanvas, EmptyIcon, EmptyText
} from '@/components/diagram/editorStyles';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: var(--font-sans);
    overflow: hidden;
    background: var(--color-canvas);
  }

  .react-flow__node {
    cursor: crosshair;
  }

  .react-flow__handle {
    width: 12px;
    height: 12px;
    background: #000000 !important;
    border: 2px solid #ffffff !important;
    border-radius: 0 !important;
  }

  .react-flow__edge-path {
    stroke: #000000 !important;
    stroke-width: 3 !important;
  }

  .react-flow__edge.selected .react-flow__edge-path {
    stroke-width: 5 !important;
  }

  .react-flow__controls {
    box-shadow: none !important;
    border: 3px solid #000000 !important;
    border-radius: 0 !important;
    overflow: hidden;
  }

  .react-flow__controls-button {
    border-bottom: 2px solid #000000 !important;
    background: #ffffff !important;
    &:last-child { border-bottom: none !important; }
    &:hover { background: #f0f0f0 !important; }
  }
  .react-flow__minimap {
    border: 3px solid #000000 !important;
    border-radius: 0 !important;
    background: #ffffff !important;
  }

  .react-flow__attribution {
    display: none !important;
  }
`;

const nodeTypes = { 
  customNode: CustomNode,
  zoneNode: ZoneNode 
};

const edgeTypes = {
  protocolEdge: ProtocolEdge
};

const defaultEdgeOptions = {
  type: 'protocolEdge',
  style: { stroke: '#000000', strokeWidth: 3 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#000000', width: 16, height: 16 }
};

const DEFAULT_CATEGORY_ORDER = ['mobile', 'frontend', 'auth', 'backend', 'database', 'queue', 'storage', 'external', 'devops'];
const AUTO_LAYOUT = {
  nodeWidth: 220,
  nodeHeight: 96,
  zonePaddingX: 40,
  zonePaddingTop: 58,
  zonePaddingBottom: 40,
  nodeGapX: 48,
  nodeGapY: 36,
  zoneGapX: 72,
  startX: 140,
  startY: 140
};

const GENERIC_PROTOCOL_LABELS = new Set(['CONNECTION', 'INFERRING...', '']);

function getBalancedColumnCount(nodeCount) {
  if (nodeCount >= 24) return 5;
  if (nodeCount >= 16) return 4;
  if (nodeCount >= 9) return 3;
  if (nodeCount >= 4) return 2;
  return 1;
}

function average(values) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getCategoryLayoutOrder(nodesByCategory) {
  const extraCategories = Object.keys(nodesByCategory)
    .filter(category => !DEFAULT_CATEGORY_ORDER.includes(category))
    .sort((left, right) => left.localeCompare(right));

  return [...DEFAULT_CATEGORY_ORDER, ...extraCategories]
    .filter(category => (nodesByCategory[category] || []).length > 0);
}

function buildRankLookup(laneNodesByCategory) {
  const rankLookup = new Map();

  Object.values(laneNodesByCategory).forEach(nodesInLane => {
    nodesInLane.forEach((node, index) => {
      rankLookup.set(node.id, index);
    });
  });

  return rankLookup;
}

function sortNodesByConnectionGravity(nodesInLane, {
  relevantCategories,
  neighborIdsByNodeId,
  categoryByNodeId,
  rankLookup
}) {
  const previousIndexByNodeId = new Map(nodesInLane.map((node, index) => [node.id, index]));

  return [...nodesInLane]
    .map(node => {
      const neighborIds = [...(neighborIdsByNodeId.get(node.id) || [])];
      const scopedRanks = [];
      const fallbackRanks = [];
      let crossLaneConnections = 0;

      neighborIds.forEach(neighborId => {
        const rank = rankLookup.get(neighborId);

        if (rank !== undefined) {
          fallbackRanks.push(rank);
        }

        if (!relevantCategories.has(categoryByNodeId.get(neighborId))) {
          return;
        }

        crossLaneConnections += 1;

        if (rank !== undefined) {
          scopedRanks.push(rank);
        }
      });

      return {
        node,
        crossLaneConnections,
        totalConnections: neighborIds.length,
        gravity: average(scopedRanks) ?? average(fallbackRanks),
        previousIndex: previousIndexByNodeId.get(node.id) || 0
      };
    })
    .sort((left, right) => {
      const leftHasGravity = left.gravity !== null;
      const rightHasGravity = right.gravity !== null;

      if (leftHasGravity && rightHasGravity && left.gravity !== right.gravity) {
        return left.gravity - right.gravity;
      }

      if (leftHasGravity !== rightHasGravity) {
        return leftHasGravity ? -1 : 1;
      }

      if (right.crossLaneConnections !== left.crossLaneConnections) {
        return right.crossLaneConnections - left.crossLaneConnections;
      }

      if (right.totalConnections !== left.totalConnections) {
        return right.totalConnections - left.totalConnections;
      }

      if (left.previousIndex !== right.previousIndex) {
        return left.previousIndex - right.previousIndex;
      }

      return (left.node.data.label || '').localeCompare(right.node.data.label || '');
    })
    .map(item => item.node);
}

function optimizeLaneNodeOrder(nodesByCategory, orderedCategories, neighborIdsByNodeId, categoryByNodeId) {
  const laneNodesByCategory = Object.fromEntries(
    orderedCategories.map(category => [
      category,
      [...nodesByCategory[category]].sort((left, right) => {
        const leftDegree = (neighborIdsByNodeId.get(left.id) || new Set()).size;
        const rightDegree = (neighborIdsByNodeId.get(right.id) || new Set()).size;

        if (rightDegree !== leftDegree) {
          return rightDegree - leftDegree;
        }

        return (left.data.label || '').localeCompare(right.data.label || '');
      })
    ])
  );

  for (let sweep = 0; sweep < 4; sweep += 1) {
    let rankLookup = buildRankLookup(laneNodesByCategory);

    orderedCategories.forEach((category, index) => {
      const relevantCategories = new Set(orderedCategories.slice(0, index));

      if (relevantCategories.size === 0) {
        return;
      }

      laneNodesByCategory[category] = sortNodesByConnectionGravity(laneNodesByCategory[category], {
        relevantCategories,
        neighborIdsByNodeId,
        categoryByNodeId,
        rankLookup
      });
    });

    rankLookup = buildRankLookup(laneNodesByCategory);

    [...orderedCategories].reverse().forEach((category, reverseIndex) => {
      const categoryIndex = orderedCategories.length - reverseIndex - 1;
      const relevantCategories = new Set(orderedCategories.slice(categoryIndex + 1));

      if (relevantCategories.size === 0) {
        return;
      }

      laneNodesByCategory[category] = sortNodesByConnectionGravity(laneNodesByCategory[category], {
        relevantCategories,
        neighborIdsByNodeId,
        categoryByNodeId,
        rankLookup
      });
    });
  }

  return laneNodesByCategory;
}

function isZoneNode(node) {
  return node?.type === 'zoneNode' || node?.id?.startsWith('zone-');
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function buildPersistedNodesPayload(nodes) {
  return nodes
    .filter(node => node.type === 'customNode')
    .map(node => ({
      id: node.id,
      name: node.data.label,
      category: node.data.category,
      role: node.data.role,
      reason: node.data.reason,
      icon: node.data.icon,
      products: node.data.products,
      position: node.position
    }));
}

function buildPersistedEdgesPayload(edges) {
  return edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: 'step'
  }));
}

function serializeDiagramSnapshot(name, nodesData, edgesData) {
  return JSON.stringify({
    name: name || 'Untitled diagram',
    nodes: nodesData,
    edges: edgesData
  });
}

export default function DiagramPage() {
  const params = useParams();
  const diagramId = params.id;
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [diagramName, setDiagramName] = useState('Untitled diagram');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectSource, setConnectSource] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [template, setTemplate] = useState('blank');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [inventory, setInventory] = useState({ builtIn: {}, community: [] });
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
  const [reviewPanelOpen, setReviewPanelOpen] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [showConfirmHistory, setShowConfirmHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const [connectionMode, setConnectionMode] = useState('guided');
  const [connectionRules, setConnectionRules] = useState([]);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const autoSynthEdgeIdsRef = useRef(new Set());
  const replacementRefreshSeqByNodeRef = useRef(new Map());
  const autoSaveTimeoutRef = useRef(null);
  const protocolRepairTimeoutRef = useRef(null);
  const lastSavedSnapshotRef = useRef('');
  const saveInFlightRef = useRef(false);
  const queuedSaveOptionsRef = useRef(null);
  const loadCompleteRef = useRef(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn && diagramId) {
      getToken().then(token => {
        if (token) setToken(token);
      });
      loadDiagram();
      loadInventory();
      loadVersions();
      loadReviewContext();
    }
  }, [isSignedIn, diagramId]);

  const loadVersions = async () => {
    try {
      const data = await api.getDiagramVersions(diagramId);
      setVersions(data);
    } catch (err) {
      console.error('Failed to load versions:', err);
    }
  };

  const loadReviewContext = async () => {
    try {
      const [settingsData, rulesData] = await Promise.all([
        api.getSettings(),
        api.getConnectionRules()
      ]);
      setConnectionMode(settingsData.connection_mode || 'guided');
      setConnectionRules(rulesData || []);
    } catch (err) {
      console.error('Failed to load review context:', err);
    }
  };

  useEffect(() => {
    if (!selectedNode?.id) {
      return;
    }

    const refreshedNode = nodes.find(node => node.id === selectedNode.id) || null;

    if (!refreshedNode) {
      setSelectedNode(null);
      if (!selectedEdge) {
        setLeftSidebarOpen(false);
      }
      return;
    }

    if (refreshedNode !== selectedNode) {
      setSelectedNode(refreshedNode);
    }
  }, [nodes, selectedEdge, selectedNode]);

  useEffect(() => {
    if (!selectedEdge?.id) {
      return;
    }

    const refreshedEdge = edges.find(edge => edge.id === selectedEdge.id) || null;

    if (!refreshedEdge) {
      setSelectedEdge(null);
      if (!selectedNode) {
        setLeftSidebarOpen(false);
      }
      return;
    }

    if (refreshedEdge !== selectedEdge) {
      setSelectedEdge(refreshedEdge);
    }
  }, [edges, selectedEdge, selectedNode]);

  const loadDiagram = async () => {
    try {
      const data = await api.getDiagram(diagramId);
      setDiagramName(data.name);

      const loadedNodes = (data.nodes || [])
        .filter(node => !isZoneNode(node))
        .map(node => ({
          id: node.id,
          type: 'customNode',
          position: node.position || { x: 0, y: 0 },
          data: {
            label: node.name || node.data?.label,
            role: node.role || node.data?.role,
            category: node.category || node.data?.category,
            reason: node.reason || node.data?.reason,
            icon: node.icon || node.data?.icon,
            products: node.products || node.data?.products || []
          }
        }));

      const loadedEdges = (data.edges || []).map((edge, idx) => ({
        id: edge.id || `e_${idx}_${Date.now()}`,
        source: edge.source,
        target: edge.target,
        label: edge.label || 'CONNECTION',
        animated: simulateFlow
      }));

      lastSavedSnapshotRef.current = serializeDiagramSnapshot(
        data.name,
        buildPersistedNodesPayload(loadedNodes),
        buildPersistedEdgesPayload(loadedEdges)
      );
      loadCompleteRef.current = true;
      setNodes(loadedNodes);
      setEdges(loadedEdges);
    } catch (err) {
      console.error('Failed to load diagram:', err);
      setToast({ message: 'CRITICAL_FAILURE: LOAD_ABORTED', error: true });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const loadInventory = async () => {
    try {
      const data = await api.getInventory();
      setInventory({
        builtIn: data.builtIn,
        community: data.community
      });
    } catch (error) {
      console.error('Failed to load inventory:', error);
    }
  };

  const buildPersistedDiagramState = useCallback((overrides = {}) => {
    const nextName = overrides.name ?? diagramName;
    const nextNodes = overrides.nodes ?? nodes;
    const nextEdges = overrides.edges ?? edges;
    const nodesData = buildPersistedNodesPayload(nextNodes);
    const edgesData = buildPersistedEdgesPayload(nextEdges);

    return {
      name: nextName,
      nodesData,
      edgesData,
      snapshot: serializeDiagramSnapshot(nextName, nodesData, edgesData)
    };
  }, [diagramName, edges, nodes]);

  const saveDiagram = useCallback(async ({
    showToast = true,
    recordVersion = false,
    overrides = {}
  } = {}) => {
    if (!diagramId) return;

    const payload = buildPersistedDiagramState(overrides);

    if (!recordVersion && payload.snapshot === lastSavedSnapshotRef.current) {
      return;
    }

    if (saveInFlightRef.current) {
      queuedSaveOptionsRef.current = {
        showToast: queuedSaveOptionsRef.current?.showToast || showToast,
        recordVersion: queuedSaveOptionsRef.current?.recordVersion || recordVersion,
        overrides
      };
      return;
    }

    saveInFlightRef.current = true;

    try {
      await api.updateDiagram(diagramId, {
        name: payload.name,
        nodes: payload.nodesData,
        edges: payload.edgesData,
        recordVersion
      });
      lastSavedSnapshotRef.current = payload.snapshot;

      if (recordVersion) {
        loadVersions();
      }

      if (showToast) {
        setToast({ message: 'SYSTEM_SYNC: SUCCESS', error: false, warning: false });
        setTimeout(() => setToast(null), 2000);
      }
    } catch (err) {
      console.error('Failed to save:', err);
      if (showToast) {
        setToast({ message: 'SYNC_ERROR: DATA_UNSAVED', error: true });
        setTimeout(() => setToast(null), 3000);
      }
    } finally {
      saveInFlightRef.current = false;

      if (queuedSaveOptionsRef.current) {
        const queuedSaveOptions = queuedSaveOptionsRef.current;
        queuedSaveOptionsRef.current = null;
        setTimeout(() => {
          saveDiagram(queuedSaveOptions);
        }, 0);
      }
    }
  }, [buildPersistedDiagramState, diagramId]);

  useEffect(() => {
    if (!diagramId || !loadCompleteRef.current) {
      return undefined;
    }

    const { snapshot } = buildPersistedDiagramState();
    if (snapshot === lastSavedSnapshotRef.current) {
      return undefined;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    const autoSaveDelay = nodes.length >= 24 ? 9000 : 4500;
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveDiagram({ showToast: false, recordVersion: false });
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [buildPersistedDiagramState, diagramId, nodes.length, saveDiagram]);

  const handleGenerate = async () => {
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
          diagramId: diagramId // Ensure the AI knows which diagram this belongs to
        },
        (chunk) => {
          setStreamingContent(prev => prev + chunk);
        },
        (result) => {
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

          setNodes(newNodes);
          setEdges(newEdges);
          setPrompt('');
          setIsStreaming(false);
          loadVersions(); // Refresh history
          saveDiagram({ showToast: false, recordVersion: false, overrides: { nodes: newNodes, edges: newEdges } });
          setToast({ message: 'SYNTHESIS_COMPLETE: 100%', error: false });
          setTimeout(() => setToast(null), 2000);
        },
        (error) => {
          setStreamError(error);
          setToast({ message: 'SYNTHESIS_FAILED: ' + error, error: true });
          setTimeout(() => setToast(null), 3000);
        }
      );
    } catch (err) {
      console.error('Generation failed:', err);
      setToast({ message: 'SYNTHESIS_FAILED: ' + err.message, error: true });
      setIsStreaming(false);
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVersion = (version) => {
    const newNodes = version.nodes
      .filter(node => !isZoneNode(node))
      .map(node => ({
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

    const newEdges = version.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: simulateFlow
    }));

    setNodes(newNodes);
    setEdges(newEdges);
    saveDiagram({ showToast: false, recordVersion: false, overrides: { nodes: newNodes, edges: newEdges } });
    setToast({ message: 'LOADED_SNAPSHOT_' + version.id.substring(0, 8), error: false });
    setTimeout(() => setToast(null), 2000);
  };

  const handleClearHistory = () => {
    setShowConfirmHistory(true);
  };

  const confirmClearHistory = async () => {
    try {
      await api.clearDiagramVersions(diagramId);
      setVersions([]);
      setShowConfirmHistory(false);
      setToast({ message: 'HISTORY_PURGED', error: false });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setShowConfirmHistory(false);
      setToast({ message: 'PURGE_FAILED', error: true });
      setTimeout(() => setToast(null), 3000);
    }
  };

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

  const refreshEdgeLabelsForNode = useCallback(async (nodeId, nextNodes, baselineEdges = edges) => {
    const edgeUpdates = await Promise.all(baselineEdges.map(async edge => {
      if (edge.source !== nodeId && edge.target !== nodeId) {
        return null;
      }

      const sourceNode = nextNodes.find(node => node.id === edge.source);
      const targetNode = nextNodes.find(node => node.id === edge.target);

      if (!sourceNode || !targetNode) {
        return null;
      }

      try {
        const result = await api.inferConnection({
          source: { name: sourceNode.data.label, category: sourceNode.data.category },
          target: { name: targetNode.data.label, category: targetNode.data.category }
        });

        return [
          edge.id,
          {
            label: result.label || edge.label,
            animated: simulateFlow
          }
        ];
      } catch (err) {
        console.error('Failed to refresh edge label during node replacement:', err);
        return null;
      }
    }));

    return new Map(edgeUpdates.filter(Boolean));
  }, [edges, simulateFlow]);

  const handleReplaceNode = (replacement) => {
    if (!selectedNode) {
      return;
    }

    const targetNodeId = selectedNode.id;
    const replacementReason = `Replaced manually with ${replacement.name} to preserve the ${selectedNode.data.category} layer while changing only this unit.`;
    const nextNodes = nodes.map(node => node.id === selectedNode.id ? ({
      ...node,
      data: {
        ...node.data,
        label: replacement.name,
        icon: replacement.icon || node.data.icon,
        products: replacement.products || node.data.products || [],
        reason: replacementReason
      }
    }) : node);
    const nextSelectedNode = nextNodes.find(node => node.id === selectedNode.id) || null;
    const baselineEdges = edges;
    const nextRefreshSeq = (replacementRefreshSeqByNodeRef.current.get(targetNodeId) || 0) + 1;

    replacementRefreshSeqByNodeRef.current.set(targetNodeId, nextRefreshSeq);

    setNodes(nextNodes);
    setSelectedNode(nextSelectedNode);
    setSelectedEdge(null);
    setLeftSidebarOpen(true);
    setToast({ message: `UNIT_REPLACED: ${replacement.name}`, error: false });
    setTimeout(() => setToast(null), 2000);

    refreshEdgeLabelsForNode(targetNodeId, nextNodes, baselineEdges)
      .then(edgeUpdates => {
        if (replacementRefreshSeqByNodeRef.current.get(targetNodeId) !== nextRefreshSeq) {
          return;
        }

        setEdges(currentEdges => currentEdges.map(edge => (
          edgeUpdates.has(edge.id)
            ? { ...edge, ...edgeUpdates.get(edge.id) }
            : edge
        )));
      })
      .catch(err => {
        console.error('Failed to complete background edge refresh after node replacement:', err);
      });
  };

  const handleFocusFinding = useCallback((finding) => {
    const targetEdgeId = finding.edgeIds?.[0];
    const targetEdge = targetEdgeId ? edges.find(edge => edge.id === targetEdgeId) : null;

    if (targetEdge) {
      setSelectedEdge(targetEdge);
      setSelectedNode(null);
      setLeftSidebarOpen(true);
      setRightPanelOpen(false);
      setHistoryPanelOpen(false);
      return;
    }

    const targetNodeId = finding.nodeIds?.[0];

    if (!targetNodeId) {
      return;
    }

    const targetNode = nodes.find(node => node.id === targetNodeId);

    if (!targetNode) {
      return;
    }

    setSelectedNode(targetNode);
    setSelectedEdge(null);
    setLeftSidebarOpen(true);
    setRightPanelOpen(false);
    setHistoryPanelOpen(false);
  }, [edges, nodes]);

  const handleNodeClick = (event, node) => {
    if (node.type !== 'customNode') {
      return;
    }

    setSelectedNode(node);
    setSelectedEdge(null);
    setLeftSidebarOpen(true);
  };

  const handleEdgeClick = (event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setLeftSidebarOpen(true);
  };

  const handleSelectNodeFlow = useCallback((edgeId) => {
    const targetEdge = edges.find(edge => edge.id === edgeId);

    if (!targetEdge) {
      return;
    }

    setSelectedEdge(targetEdge);
    setSelectedNode(null);
    setLeftSidebarOpen(true);
  }, [edges]);

  const handlePaneClick = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setLeftSidebarOpen(false);
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

    const updatedEdges = [...edges];

    for (const edge of edgesToFix) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        try {
          const result = await api.inferConnection({
            source: { name: sourceNode.data.label, category: sourceNode.data.category },
            target: { name: targetNode.data.label, category: targetNode.data.category }
          });

          const idx = updatedEdges.findIndex(e => e.id === edge.id);
          if (idx !== -1) {
            updatedEdges[idx] = { ...updatedEdges[idx], label: result.label };
          }
        } catch (err) {
          console.error('Failed to synthesize protocol for edge:', edge.id, err);
        } finally {
          autoSynthEdgeIdsRef.current.delete(edge.id);
        }
      } else {
        autoSynthEdgeIdsRef.current.delete(edge.id);
      }
    }

    setEdges(updatedEdges);
    if (showToast) {
      setToast({ message: 'PROTOCOL_SYNTHESIS: COMPLETE', error: false });
      setTimeout(() => setToast(null), 2000);
    }
  }, [edges, setEdges]);

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
      setCollaborators(collaborators.filter(c => c.id !== userId));
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
    navigator.clipboard.writeText(inviteCode);
    setIsCopying(true);
    setTimeout(() => {
      setIsCopying(false);
    }, 2000);
  };

  const handleDragStart = (e, tech) => {
    e.dataTransfer.setData('tech', JSON.stringify(tech));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const techData = e.dataTransfer.getData('tech');
    if (!techData) return;

    const tech = JSON.parse(techData);
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
        role: 'Manual entry',
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

  const deleteSelected = () => {
    if (selectedNode) {
      setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
      setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
      setSelectedEdge(null);
      setLeftSidebarOpen(false);
      return;
    }

    if (selectedEdge) {
      setEdges(eds => eds.filter(edge => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
      setLeftSidebarOpen(false);
    }
  };

  const updateDiagramName = (e) => {
    setDiagramName(e.target.value);
  };

  const handleNameBlur = () => {
    saveDiagram({ showToast: false, recordVersion: false });
  };

  const layoutNodes = useCallback(() => {
    const techNodes = nodes.filter(node => node.type === 'customNode');

    if (techNodes.length === 0) {
      return;
    }

    const measuredNodeWidth = Math.max(
      AUTO_LAYOUT.nodeWidth,
      ...techNodes.map(node => node.width || node.measured?.width || AUTO_LAYOUT.nodeWidth)
    );
    const measuredNodeHeight = Math.max(
      AUTO_LAYOUT.nodeHeight,
      ...techNodes.map(node => node.height || node.measured?.height || AUTO_LAYOUT.nodeHeight)
    );

    const nodesByCategory = {};
    const categoryByNodeId = new Map();
    const techNodeIds = new Set(techNodes.map(node => node.id));
    const neighborIdsByNodeId = new Map(techNodes.map(node => [node.id, new Set()]));

    techNodes.forEach(node => {
      const category = node.data.category || 'backend';
      if (!nodesByCategory[category]) nodesByCategory[category] = [];
      nodesByCategory[category].push(node);
      categoryByNodeId.set(node.id, category);
    });

    edges.forEach(edge => {
      if (!techNodeIds.has(edge.source) || !techNodeIds.has(edge.target) || edge.source === edge.target) {
        return;
      }

      neighborIdsByNodeId.get(edge.source)?.add(edge.target);
      neighborIdsByNodeId.get(edge.target)?.add(edge.source);
    });

    const orderedCategories = getCategoryLayoutOrder(nodesByCategory);
    const laneNodesByCategory = optimizeLaneNodeOrder(
      nodesByCategory,
      orderedCategories,
      neighborIdsByNodeId,
      categoryByNodeId
    );

    const laneConfigs = orderedCategories.map(category => {
      const nodesInCategory = laneNodesByCategory[category];
      const columnCount = Math.min(getBalancedColumnCount(nodesInCategory.length), nodesInCategory.length);
      const rowCount = Math.ceil(nodesInCategory.length / columnCount);
      const nodeBlockHeight = (rowCount * measuredNodeHeight) + ((rowCount - 1) * AUTO_LAYOUT.nodeGapY);

      return {
        category,
        nodesInCategory,
        columnCount,
        rowCount,
        nodeBlockHeight,
        zoneWidth:
          (columnCount * measuredNodeWidth) +
          ((columnCount - 1) * AUTO_LAYOUT.nodeGapX) +
          (AUTO_LAYOUT.zonePaddingX * 2)
      };
    });

    const maxNodeBlockHeight = Math.max(
      ...laneConfigs.map(config => config.nodeBlockHeight),
      measuredNodeHeight
    );
    const uniformZoneHeight =
      AUTO_LAYOUT.zonePaddingTop + maxNodeBlockHeight + AUTO_LAYOUT.zonePaddingBottom;

    const arrangedNodes = [];
    const zones = [];
    let cursorX = AUTO_LAYOUT.startX;

    laneConfigs.forEach(config => {
      const zoneX = cursorX;
      const zoneY = AUTO_LAYOUT.startY;
      const topOffset = (maxNodeBlockHeight - config.nodeBlockHeight) / 2;

      zones.push({
        id: `zone-${config.category}`,
        type: 'zoneNode',
        data: {
          label: config.category.toUpperCase(),
          count: config.nodesInCategory.length,
          columns: config.columnCount
        },
        position: { x: zoneX, y: zoneY },
        style: { width: config.zoneWidth, height: uniformZoneHeight, zIndex: -1 },
        draggable: false,
        selectable: false,
        connectable: false,
        focusable: false,
      });

      config.nodesInCategory.forEach((node, index) => {
        const columnIndex = index % config.columnCount;
        const rowIndex = Math.floor(index / config.columnCount);

        arrangedNodes.push({
          ...node,
          position: {
            x: zoneX + AUTO_LAYOUT.zonePaddingX + (columnIndex * (measuredNodeWidth + AUTO_LAYOUT.nodeGapX)),
            y:
              zoneY +
              AUTO_LAYOUT.zonePaddingTop +
              topOffset +
              (rowIndex * (measuredNodeHeight + AUTO_LAYOUT.nodeGapY))
          }
        });
      });

      cursorX += config.zoneWidth + AUTO_LAYOUT.zoneGapX;
    });

    setNodes([...zones, ...arrangedNodes]);

    if (selectedNode?.id) {
      const refreshedSelection = arrangedNodes.find(node => node.id === selectedNode.id) || null;
      setSelectedNode(refreshedSelection);
    }
    
    setTimeout(() => {
      if (rfInstance) {
        rfInstance.fitView({ padding: 0.16, duration: 900 });
      }
    }, 50);

    setToast({ message: `AUTO_LAYOUT_OPTIMIZED: ${arrangedNodes.length}_NODES`, error: false });
    setTimeout(() => setToast(null), 2000);
  }, [edges, nodes, rfInstance, selectedNode, setNodes]);

  useEffect(() => {
    setEdges(eds => eds.map(edge => ({ ...edge, animated: simulateFlow })));
  }, [simulateFlow, setEdges]);

  const exportJSON = () => {
    const data = {
      name: diagramName,
      nodes: nodes.filter(node => node.type === 'customNode'),
      edges,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `archflow_${diagramName.toLowerCase().replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);

    setToast({ message: 'EXPORT_JSON: SUCCESS', error: false });
    setTimeout(() => setToast(null), 2000);
  };

  const exportPNG = async () => {
    if (!rfInstance) return;

    setToast({ message: 'RENDER_4K_BLUEPRINT...', warning: true });

    try {
      const nodesBounds = getRectOfNodes(nodes);
      const padding = 150;
      
      // Calculate dynamic dimensions for a pixel-perfect render
      const exportWidth = nodesBounds.width + (padding * 2);
      const exportHeight = nodesBounds.height + (padding * 2);

      const dataUrl = await toPng(document.querySelector('.react-flow__viewport'), {
        backgroundColor: '#ffffff',
        width: exportWidth,
        height: exportHeight,
        pixelRatio: 2, // High-resolution upscale
        style: {
          width: exportWidth,
          height: exportHeight,
          // Shift the viewport so the nodes start at our padded origin
          transform: `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px) scale(1)`,
        },
      });

      const link = document.createElement('a');
      link.download = `archflow_${diagramName.toLowerCase().replace(/\s+/g, '_')}_v1.png`;
      link.href = dataUrl;
      link.click();

      setShowExportMenu(false);
      setToast({ message: 'HI_RES_EXPORT: SUCCESS', error: false });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error('PNG Export failed:', err);
      setToast({ message: 'EXPORT_FAILED: RENDER_BUFFER_OVERFLOW', error: true });
      setTimeout(() => setToast(null), 3000);
    }
  };

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
  const activeUtilityPanel = reviewPanelOpen
    ? {
        key: 'review',
        width: 360,
        content: (
          <ReviewPanel
            findings={reviewFindings}
            connectionMode={connectionMode}
            nodeCount={nodes.filter(node => node.type === 'customNode').length}
            edgeCount={edges.length}
            onFocusFinding={handleFocusFinding}
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
      <GlobalStyle />
      <Container>
        <EditorHeader
          diagramName={diagramName}
          onDiagramNameChange={updateDiagramName}
          onDiagramNameBlur={handleNameBlur}
          hasSelection={Boolean(selectedNode || selectedEdge)}
          detailsOpen={leftSidebarOpen && Boolean(selectedNode || selectedEdge)}
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
          onOpenSpecs={() => setLeftSidebarOpen(true)}
          onDeleteSelection={deleteSelected}
          rightPanelOpen={rightPanelOpen}
          onToggleRightPanel={() => {
            const nextState = !rightPanelOpen;
            setRightPanelOpen(nextState);
            if (nextState) {
              setHistoryPanelOpen(false);
              setReviewPanelOpen(false);
            }
          }}
          reviewPanelOpen={reviewPanelOpen}
          onToggleReviewPanel={() => {
            const nextState = !reviewPanelOpen;
            setReviewPanelOpen(nextState);
            if (nextState) {
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
          connectMode={connectMode}
          onToggleConnectMode={() => { setConnectMode(!connectMode); setConnectSource(null); }}
          simulateFlow={simulateFlow}
          onToggleSimulateFlow={() => setSimulateFlow(!simulateFlow)}
          onOpenInvite={() => setShowInviteModal(true)}
        />

        <MainArea>
          {selectedEdge ? (
            <ConnectionDetailsSidebar
              open={leftSidebarOpen}
              onClose={() => {
                setLeftSidebarOpen(false);
                setSelectedEdge(null);
              }}
              selectedEdge={selectedEdge}
              connectionProfile={selectedConnectionProfile}
            />
          ) : (
            <NodeDetailsSidebar
              open={leftSidebarOpen && Boolean(selectedNode)}
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
          )}

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

            {nodes.length === 0 && (
              <EmptyCanvas>
                <EmptyIcon>⬡</EmptyIcon>
                <EmptyText>INITIALIZE_SYSTEM_PROMPT_BELOW</EmptyText>
              </EmptyCanvas>
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
                  borderLeft: '4px solid #000',
                  boxShadow: '10px 0px 20px rgba(0,0,0,0.1)'
                }}
              >
                {activeUtilityPanel.content}
              </motion.div>
            )}
          </AnimatePresence>
        </MainArea>

        <PromptBar
          prompt={prompt}
          onPromptChange={setPrompt}
          template={template}
          onTemplateChange={setTemplate}
          loading={loading}
          onGenerate={handleGenerate}
        />
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
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900 }}>[{toast.message}]</span>
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
