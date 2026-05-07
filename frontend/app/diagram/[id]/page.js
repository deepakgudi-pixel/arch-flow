'use client';

import styled, { createGlobalStyle } from 'styled-components';
import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  getRectOfNodes,
  getTransformForBounds
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import api, { setToken } from '@/lib/api';
import { categoryColors } from '@/lib/theme';
import { Badge } from '@/components/ui/Badge';

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
    box-shadow: 4px 4px 0px #000000 !important;
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

  .react-flow__controls {
    box-shadow: none !important;
    border: 3px solid #000000;
  }

  .react-flow__controls-button {
    border-bottom: 1px solid #eee !important;
    box-shadow: none !important;
    background: #ffffff !important;

    &:hover {
      background: #f0f0f0 !important;
    }
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-canvas);
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: #ffffff;
  border-bottom: 4px solid #000000;
  z-index: 100;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
`;

const Logo = styled.div`
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #000000;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.span`
  width: 32px;
  height: 32px;
  background: #000000;
  color: white;
  display: grid;
  place-items: center;
  border: 2px solid #000000;
`;

const DiagramNameWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border: 2px solid #000000;
  background: #f8f8f8;
`;

const DiagramName = styled.input`
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 800;
  color: #000000;
  border: none;
  background: transparent;
  width: 240px;
  text-transform: uppercase;

  &:focus {
    outline: none;
  }
`;

const HeaderCenter = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  border: 3px solid #000000;
  background: ${props => props.$active ? '#000000' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#000000'};
  transition: all 0.1s;

  &:hover {
    transform: translate(-1px, -1px);
  }

  &:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MainArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LeftSidebar = styled.div`
  width: ${props => props.$open ? '400px' : '0'};
  background: #ffffff;
  border-right: 4px solid #000000;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  flex-shrink: 0;
  z-index: 50;
`;

const SidebarContent = styled.div`
  width: 400px;
  padding: 32px;
  height: 100%;
  overflow-y: auto;
`;

const SidebarTitle = styled.h2`
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 900;
  color: #000000;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: uppercase;
`;

const CloseBtn = styled.button`
  background: #000000;
  border: none;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: white;
  font-size: 18px;
  cursor: pointer;
  
  &:hover {
    background: #333;
  }
`;

const TechBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border: 2px solid #000000;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  background: ${props => categoryColors[props.$category] || '#000000'};
  color: white;
`;

const SectionTitle = styled.h3`
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 900;
  color: #666;
  text-transform: uppercase;
  margin: 32px 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 2px;
    background: #e5e5e5;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #333;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const ProductCard = styled.div`
  padding: 16px;
  background: #ffffff;
  border: 3px solid #000000;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.1s;
  &:hover {
    transform: translate(-2px, -2px);
  }
`;

const ProductName = styled.div`
  font-weight: 900;
  font-size: 1.1rem;
  text-transform: uppercase;
  color: #000000;
  margin-bottom: 8px;
`;

const ProductDesc = styled.div`
  font-size: 13px;
  color: #666;
  line-height: 1.4;
`;

const CanvasWrapper = styled.div`
  flex: 1;
  position: relative;
  background: #ffffff;
`;

const RightPanel = styled.div`
  width: ${props => props.$open ? '320px' : '0'};
  background: #ffffff;
  border-left: 4px solid #000000;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  flex-shrink: 0;
  z-index: 50;
`;

const PanelContent = styled.div`
  width: 320px;
  height: 100%;
  overflow-y: auto;
  padding: 24px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 3px solid #000000;
  font-family: var(--font-mono);
  font-size: 13px;
  margin-bottom: 24px;
  background: #f8f8f8;

  &:focus {
    outline: none;
    background: #ffffff;
  }
`;

const TechChip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #ffffff;
  border: 2px solid #000000;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  color: #000000;
  cursor: grab;
  margin-bottom: 8px;
  transition: all 0.1s;

  &:hover {
    background: #f0f0f0;
    transform: translateX(4px);
  }

  &::before {
    content: '::';
    color: ${props => categoryColors[props.$category] || '#000000'};
  }
`;

const TechCategory = styled.div`
  margin-bottom: 24px;
`;

const CategoryLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

const BottomBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background: #ffffff;
  border-top: 4px solid #000000;
`;

const PromptInput = styled.input`
  flex: 1;
  padding: 16px 24px;
  border: 3px solid #000000;
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 500;
  background: #f8f8f8;

  &:focus {
    outline: none;
    background: #ffffff;
  }
`;

const TemplateSelect = styled.select`
  padding: 16px 40px 16px 20px;
  border: 3px solid #000000;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  background: #ffffff;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='4' stroke-linecap='square' stroke-linejoin='inherit'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  transition: all 0.1s;

  &:focus {
    outline: none;
    background-color: #f8f8f8;
  }

  &:hover {
    background-color: #f0f0f0;
    transform: translate(-1px, -1px);
    box-shadow: 2px 2px 0px #000000;
  }
`;

const EmptyCanvas = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 1;
`;

const EmptyIcon = styled.div`
  font-size: 80px;
  filter: grayscale(100%);
  margin-bottom: 24px;
  opacity: 0.1;
`;

const EmptyText = styled.p`
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  color: #000000;
  letter-spacing: 0.1em;
`;

const NodeWrapper = styled.div`
  padding: 0;
  background: #ffffff;
  border: 3px solid #000000;
  min-width: 180px;
  transition: all 0.1s;
  overflow: hidden;

  ${props => props.$selected && `
    transform: translate(-2px, -2px);
    border-width: 4px;
  `}
`;

const NodeTopBar = styled.div`
  height: 24px;
  background: ${props => categoryColors[props.$category] || '#000000'};
  border-bottom: 3px solid #000000;
  display: flex;
  align-items: center;
  padding: 0 10px;
`;

const NodeCategoryLabel = styled.span`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  color: #ffffff;
  letter-spacing: 0.05em;
`;

const NodeBody = styled.div`
  padding: 16px;
`;

const NodeName = styled.div`
  font-weight: 900;
  color: #000000;
  font-size: 15px;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const NodeRole = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
`;

const Toast = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  background: ${props => props.$error ? '#fee2e2' : props.$warning ? '#fef3c7' : '#dcfce7'};
  color: ${props => props.$error ? '#ef4444' : props.$warning ? '#92400e' : '#166534'};
  border: 3px solid #000000;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1001;
`;

function CustomNode({ data, selected }) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <NodeWrapper $selected={selected} $category={data.category}>
        <NodeTopBar $category={data.category}>
          <NodeCategoryLabel>{data.category}</NodeCategoryLabel>
        </NodeTopBar>
        <NodeBody>
          <NodeName>{data.label}</NodeName>
          <NodeRole>{data.role}</NodeRole>
        </NodeBody>
      </NodeWrapper>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

const nodeTypes = { customNode: CustomNode };

const defaultEdgeOptions = {
  type: 'step',
  style: { stroke: '#000000', strokeWidth: 3 },
  labelStyle: { fill: '#000000', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: '10px' },
  labelBgStyle: { fill: '#ffffff', fillOpacity: 1, stroke: '#000000', strokeWidth: 2 },
  labelBgPadding: [4, 2],
  labelBgBorderRadius: 0,
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
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
  const [inventory, setInventory] = useState({ builtIn: {}, custom: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [rfInstance, setRfInstance] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [customTechPrompt, setCustomTechPrompt] = useState('');
  const [generatingTech, setGeneratingTech] = useState(false);
  const [simulateFlow, setSimulateFlow] = useState(false);

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
    }
  }, [isSignedIn, diagramId]);

  useEffect(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(() => saveDiagram(false), 30000);
    setAutoSaveTimer(timer);
    return () => clearTimeout(timer);
  }, [nodes, edges]);

  const loadDiagram = async () => {
    try {
      const data = await api.getDiagram(diagramId);
      setDiagramName(data.name);

      const loadedNodes = (data.nodes || []).map(node => ({
        id: node.id,
        type: 'customNode',
        position: node.position || { x: 0, y: 0 },
        data: { label: node.name, role: node.role, category: node.category, reason: node.reason, products: node.products }
      }));

      const loadedEdges = (data.edges || []).map((edge, idx) => ({
        id: edge.id || `e_${idx}_${Date.now()}`,
        source: edge.source,
        target: edge.target,
        label: edge.label || 'CONNECTION',
        animated: simulateFlow
      }));

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
      setInventory(data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  };

  const saveDiagram = async (showToast = true) => {
    if (!diagramId) return;

    try {
      const nodesData = nodes.map(node => ({
        id: node.id,
        name: node.data.label,
        category: node.data.category,
        role: node.data.role,
        reason: node.data.reason,
        products: node.data.products,
        position: node.position
      }));

      const edgesData = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'step'
      }));

      await api.updateDiagram(diagramId, { name: diagramName, nodes: nodesData, edges: edgesData });

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
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setToast({ message: 'INPUT_REQUIRED: PROMPT_EMPTY', error: true });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const result = await api.generateDiagram({ description: prompt, template: template === 'blank' ? null : template });

      const newNodes = result.nodes.map(node => ({
        id: node.id,
        type: 'customNode',
        position: node.position,
        data: { label: node.name, role: node.role, category: node.category, reason: node.reason, products: node.products || [] }
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

      setToast({ message: 'SYNTHESIS_COMPLETE: 100%', error: false });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error('Generation failed:', err);
      setToast({ message: 'SYNTHESIS_FAILED: ' + err.message, error: true });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
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

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    setLeftSidebarOpen(true);
  };

  const handlePaneClick = () => {
    setSelectedNode(null);
    setLeftSidebarOpen(false);
  };

  const onConnect = useCallback(async (params) => {
    // 1. Create edge with placeholder
    const edgeId = `e_${Date.now()}`;
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);

    setEdges(ed => addEdge({
      ...params,
      id: edgeId,
      label: 'INFERRING...',
      animated: simulateFlow
    }, ed));

    // 2. Infer label via AI
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


  const synthesizeProtocols = async () => {
    const edgesToFix = edges.filter(e => e.label === 'CONNECTION' || e.label === 'INFERRING...' || !e.label);
    
    if (edgesToFix.length === 0) {
      setToast({ message: 'PROTOCOLS_VALIDATED: 100%', error: false });
      setTimeout(() => setToast(null), 2000);
      return;
    }

    setToast({ message: `SYNTHESIZING_${edgesToFix.length}_PROTOCOLS...`, warning: true });

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
        }
      }
    }

    setEdges(updatedEdges);
    setToast({ message: 'PROTOCOL_SYNTHESIS: COMPLETE', error: false });
    setTimeout(() => setToast(null), 2000);
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
      data: { label: tech.name, role: 'Manual entry', category: tech.category, products: tech.products || [] }
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
      setLeftSidebarOpen(false);
    }
  };

  const updateDiagramName = (e) => {
    setDiagramName(e.target.value);
  };

  const handleNameBlur = () => {
    saveDiagram(false);
  };

  const layoutNodes = useCallback(() => {
    const categoryOrder = ['frontend', 'backend', 'database', 'queue', 'auth', 'storage', 'external', 'devops'];
    const columnWidth = 320;
    const nodeHeight = 120;
    const startX = 100;
    const startY = 100;

    const nodesByCategory = {};
    nodes.forEach(node => {
      const cat = node.data.category || 'backend';
      if (!nodesByCategory[cat]) nodesByCategory[cat] = [];
      nodesByCategory[cat].push(node);
    });

    const newNodes = nodes.map(node => {
      const cat = node.data.category || 'backend';
      const catIdx = categoryOrder.indexOf(cat);
      const x = startX + (catIdx !== -1 ? catIdx : categoryOrder.length) * columnWidth;
      
      const nodesInCat = nodesByCategory[cat];
      const nodeIdx = nodesInCat.findIndex(n => n.id === node.id);
      const y = startY + (nodeIdx * nodeHeight);

      return {
        ...node,
        position: { x, y }
      };
    });

    setNodes(newNodes);
    setToast({ message: 'REORG_COMPLETE: 100%', error: false });
    setTimeout(() => setToast(null), 2000);
  }, [nodes, setNodes]);

  useEffect(() => {
    setEdges(eds => eds.map(edge => ({ ...edge, animated: simulateFlow })));
  }, [simulateFlow, setEdges]);

  const exportJSON = () => {
    const data = {
      name: diagramName,
      nodes,
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

    setToast({ message: 'GENERATING_IMAGE...', warning: true });
    
    try {
      const nodesBounds = getRectOfNodes(nodes);
      const transform = getTransformForBounds(nodesBounds, 1200, 800, 0.5, 2);

      const dataUrl = await toPng(document.querySelector('.react-flow__viewport'), {
        backgroundColor: '#ffffff',
        width: 1200,
        height: 800,
        style: {
          width: 1200,
          height: 800,
          transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
        },
      });

      const link = document.createElement('a');
      link.download = `archflow_${diagramName.toLowerCase().replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      
      setShowExportMenu(false);
      setToast({ message: 'EXPORT_PNG: SUCCESS', error: false });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error('PNG Export failed:', err);
      setToast({ message: 'EXPORT_FAILED: IMAGE_RENDER_ERROR', error: true });
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <HeaderLeft>
            <Link href="/dashboard">
              <Logo>
                <LogoIcon>⬡</LogoIcon>
                Archflow
              </Logo>
            </Link>
            <DiagramNameWrap>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#999' }}>ID:</span>
              <DiagramName value={diagramName} onChange={updateDiagramName} onBlur={handleNameBlur} />
            </DiagramNameWrap>
          </HeaderLeft>
          <HeaderCenter>
            <div style={{ display: 'flex', gap: '8px', background: '#000', padding: '4px' }}>
              <ActionButton 
                $active={connectMode} 
                onClick={() => { setConnectMode(!connectMode); setConnectSource(null); }}
                style={{ background: connectMode ? '#fff' : '#000', color: connectMode ? '#000' : '#fff', border: 'none', height: '32px' }}
              >
                CONNECT
              </ActionButton>
              <ActionButton 
                $active={simulateFlow} 
                onClick={() => setSimulateFlow(!simulateFlow)}
                style={{ background: simulateFlow ? '#fff' : '#000', color: simulateFlow ? '#000' : '#fff', border: 'none', height: '32px' }}
              >
                LIVE_FLOW
              </ActionButton>
              <ActionButton 
                onClick={synthesizeProtocols}
                style={{ background: '#000', color: '#fff', border: 'none', height: '32px' }}
              >
                SYNTH_ALL
              </ActionButton>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
              {selectedNode && (
                <>
                  <ActionButton onClick={() => setLeftSidebarOpen(true)}>SPECS</ActionButton>
                  <ActionButton onClick={deleteSelected} style={{ borderColor: '#ff4444', color: '#ff4444' }}>DELETE</ActionButton>
                </>
              )}
              <ActionButton onClick={() => setRightPanelOpen(!rightPanelOpen)}>
                {rightPanelOpen ? 'CLOSE_MODS' : 'VIEW_MODS'}
              </ActionButton>
            </div>
          </HeaderCenter>
          <HeaderRight>
            <div style={{ position: 'relative' }}>
              <ActionButton onClick={() => setShowExportMenu(!showExportMenu)}>
                SYSTEM_MENU {showExportMenu ? '↑' : '↓'}
              </ActionButton>
              {showExportMenu && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  background: '#ffffff',
                  border: '3px solid #000000',
                  boxShadow: '4px 4px 0px #000000',
                  zIndex: 1000,
                  width: '200px'
                }}>
                  {[
                    { label: '💾 SAVE_CHANGES', onClick: () => saveDiagram(true) },
                    { label: '🪄 REPAIR_PROTOCOLS', onClick: synthesizeProtocols },
                    { divider: true },
                    { label: '🖼️ EXPORT_PNG', onClick: exportPNG },
                    { label: '📄 EXPORT_JSON', onClick: exportJSON },
                    { divider: true },
                    { label: '🚪 EXIT_SESSION', onClick: () => window.location.href = '/dashboard' }
                  ].map((item, idx) => item.divider ? (
                    <div key={idx} style={{ height: '2px', background: '#000' }} />
                  ) : (
                    <div 
                      key={idx}
                      onClick={() => { item.onClick(); setShowExportMenu(false); }}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 900,
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={e => e.target.style.background = '#f0f0f0'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </HeaderRight>
        </Header>

        <MainArea>
          <LeftSidebar $open={leftSidebarOpen}>
            {leftSidebarOpen && (
              <SidebarContent>
                <SidebarTitle>
                  UNIT_DETAILS
                  <CloseBtn onClick={() => setLeftSidebarOpen(false)}>×</CloseBtn>
                </SidebarTitle>

                {selectedNode && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <TechBadge $category={selectedNode.data.category}>
                        {selectedNode.data.category}
                      </TechBadge>
                      <Badge $tone="neutral">STABLE</Badge>
                    </div>

                    <div style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: 1, marginBottom: '16px', textTransform: 'uppercase' }}>
                      {selectedNode.data.label}
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#666', marginBottom: '32px', textTransform: 'uppercase' }}>
                      ROLE: {selectedNode.data.role}
                    </div>

                    <SectionTitle>FUNCTION_SPEC</SectionTitle>
                    <Description>
                      {selectedNode.data.category === 'database' && `${selectedNode.data.label} handles persistence operations and state management for the identified domain.`}
                      {selectedNode.data.category === 'frontend' && `${selectedNode.data.label} provides the primary interaction layer and state orchestration for end-users.`}
                      {selectedNode.data.category === 'backend' && `${selectedNode.data.label} executes core business logic and exposes secure operational endpoints.`}
                      {selectedNode.data.category === 'auth' && `${selectedNode.data.label} manages identity verification and permission lifecycle.`}
                      {selectedNode.data.category === 'queue' && `${selectedNode.data.label} buffers high-volume data streams for asynchronous processing.`}
                      {selectedNode.data.category === 'storage' && `${selectedNode.data.label} provides scalable object storage for unstructured binary data.`}
                      {selectedNode.data.category === 'external' && `${selectedNode.data.label} represents an external dependency outside the primary system boundary.`}
                      {selectedNode.data.category === 'devops' && `${selectedNode.data.label} facilitates infrastructure automation and delivery pipelines.`}
                    </Description>

                    {selectedNode.data.reason && (
                      <>
                        <SectionTitle>DESIGN_RATIONALE</SectionTitle>
                        <Description>{selectedNode.data.reason}</Description>
                      </>
                    )}

                    {selectedNode.data.products && selectedNode.data.products.length > 0 && (
                      <>
                        <SectionTitle>RECOMMENDED_STACK</SectionTitle>
                        {selectedNode.data.products.map((product, idx) => (
                          <ProductCard key={idx} onClick={() => window.open(product.url, '_blank')}>
                            <ProductName>{product.name}</ProductName>
                            <ProductDesc>{product.description}</ProductDesc>
                          </ProductCard>
                        ))}
                      </>
                    )}
                  </>
                )}
              </SidebarContent>
            )}
          </LeftSidebar>

          <CanvasWrapper onDrop={handleDrop} onDragOver={handleDragOver}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              onInit={setRfInstance}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              fitView
              snapToGrid
              snapGrid={[20, 20]}
            >
              <Background color="#000" gap={20} size={1} />
              <Background id="1" color="#000" gap={100} size={2} style={{ opacity: 0.1 }} />
              <Controls showInteractive={false}>
                <button 
                  type="button" 
                  className="react-flow__controls-button" 
                  title="rearrange nodes" 
                  onClick={layoutNodes}
                  style={{ display: 'grid', placeItems: 'center', fontSize: '14px' }}
                >
                  ⚡
                </button>
              </Controls>
              <MiniMap 
                nodeColor={n => categoryColors[n.data?.category] || '#000000'}
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

          <RightPanel $open={rightPanelOpen}>
            {rightPanelOpen && (
              <PanelContent>
                <SidebarTitle>MODULES</SidebarTitle>
                <SearchInput
                  placeholder="FILTER_TECH..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />

                <SectionTitle>GENERATE_MODULE</SectionTitle>
                <div style={{ marginBottom: '32px' }}>
                  <SearchInput
                    placeholder="DESCRIBE_CUSTOM_TECH..."
                    value={customTechPrompt}
                    onChange={e => setCustomTechPrompt(e.target.value)}
                    style={{ marginBottom: '12px' }}
                    onKeyPress={e => e.key === 'Enter' && handleGenerateTech()}
                  />
                  <ActionButton 
                    style={{ width: '100%', fontSize: '11px' }}
                    onClick={handleGenerateTech}
                    disabled={generatingTech || !customTechPrompt.trim()}
                  >
                    {generatingTech ? 'SYNTHESIZING...' : 'INITIATE_TECH_GEN'}
                  </ActionButton>
                </div>
                
                {Object.keys(inventory.builtIn).map(category => {
                  const builtInForCat = inventory.builtIn[category] || [];
                  const customForCat = (inventory.custom || []).filter(item => item.category === category);
                  const allItems = [...builtInForCat, ...customForCat]
                    .filter(tech => tech.name.toLowerCase().includes(searchTerm.toLowerCase()));

                  if (allItems.length === 0) return null;

                  return (
                    <TechCategory key={category}>
                      <CategoryLabel>{category}</CategoryLabel>
                      {allItems.map((tech, idx) => (
                        <TechChip
                          key={idx}
                          $category={category}
                          draggable
                          onDragStart={e => handleDragStart(e, { ...tech, category })}
                        >
                          {tech.name}
                          {tech.id && (
                            <span style={{ 
                              fontSize: '8px', 
                              background: '#000', 
                              color: '#fff', 
                              padding: '2px 4px', 
                              marginLeft: '8px',
                              verticalAlign: 'middle'
                            }}>AI</span>
                          )}
                        </TechChip>
                      ))}
                    </TechCategory>
                  );
                })}

                {/* Handle any custom categories the AI might have invented that aren't in built-in */}
                {inventory.custom && inventory.custom.some(item => !inventory.builtIn[item.category]) && (
                  inventory.custom
                    .filter(item => !inventory.builtIn[item.category])
                    .reduce((acc, item) => {
                      if (!acc.includes(item.category)) acc.push(item.category);
                      return acc;
                    }, [])
                    .map(category => (
                      <TechCategory key={category}>
                        <CategoryLabel>{category}</CategoryLabel>
                        {inventory.custom
                          .filter(item => item.category === category && item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((tech, idx) => (
                            <TechChip
                              key={idx}
                              $category={category}
                              draggable
                              onDragStart={e => handleDragStart(e, tech)}
                            >
                              {tech.name}
                              <span style={{ 
                                fontSize: '8px', 
                                background: '#000', 
                                color: '#fff', 
                                padding: '2px 4px', 
                                marginLeft: '8px',
                                verticalAlign: 'middle'
                              }}>AI</span>
                            </TechChip>
                          ))}
                      </TechCategory>
                    ))
                )}

                {searchTerm && !Object.values(inventory.builtIn).some(cat => cat.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))) && 
                 !inventory.custom?.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())) && (
                  <div style={{ textAlign: 'center', padding: '20px', border: '2px dashed #ccc' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#999', marginBottom: '12px' }}>NO_LOCAL_MATCH_FOUND</div>
                    <ActionButton 
                      style={{ width: '100%', fontSize: '11px' }}
                      onClick={() => {
                        setCustomTechPrompt(searchTerm);
                        handleGenerateTech();
                      }}
                      disabled={generatingTech}
                    >
                      {generatingTech ? 'SYNTHESIZING...' : `SYNTHESIZE_${searchTerm.toUpperCase()}`}
                    </ActionButton>
                  </div>
                )}
              </PanelContent>
            )}
          </RightPanel>
        </MainArea>

        <BottomBar>
          <PromptInput
            placeholder="DESCRIBE_ARCHITECTURE_REQS_HERE..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleGenerate()}
          />
          <TemplateSelect value={template} onChange={e => setTemplate(e.target.value)}>
            <option value="blank">BLANK_CANVAS</option>
            <option value="saas">SAAS_PLATFORM</option>
            <option value="ecommerce">E_COMMERCE_STACK</option>
            <option value="realtime">REALTIME_SYSTEM</option>
          </TemplateSelect>
          <ActionButton 
            $active 
            style={{ padding: '16px 32px', fontSize: '14px' }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'SYNTHESIZING...' : 'INITIATE_SYNTHESIS'}
          </ActionButton>
        </BottomBar>
      </Container>

      {toast && (
        <Toast $error={toast.error} $warning={toast.warning}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900 }}>[{toast.message}]</span>
        </Toast>
      )}
    </>
  );
}