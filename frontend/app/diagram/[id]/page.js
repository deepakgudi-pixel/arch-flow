'use client';

import { createGlobalStyle } from 'styled-components';
import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect, useState, useCallback } from 'react';
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
  getRectOfNodes,
  getTransformForBounds
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import api, { setToken } from '@/lib/api';
import { categoryColors } from '@/lib/theme';
import { CustomNode } from '@/components/diagram/CustomNode';
import EditorHeader from '@/components/diagram/EditorHeader';
import NodeDetailsSidebar from '@/components/diagram/NodeDetailsSidebar';
import TechInventoryPanel from '@/components/diagram/TechInventoryPanel';
import PromptBar from '@/components/diagram/PromptBar';
import InviteModal from '@/components/diagram/InviteModal';
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
  const [inventory, setInventory] = useState({ builtIn: {}, community: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
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
      setInventory({
        builtIn: data.builtIn,
        community: data.community
      });
    } catch (error) {
      console.error('Failed to load inventory:', error);
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

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    setLeftSidebarOpen(true);
  };

  const handlePaneClick = () => {
    setSelectedNode(null);
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
        <EditorHeader
          diagramName={diagramName}
          onDiagramNameChange={updateDiagramName}
          onDiagramNameBlur={handleNameBlur}
          selectedNode={selectedNode}
          onOpenSpecs={() => setLeftSidebarOpen(true)}
          onDeleteNode={deleteSelected}
          rightPanelOpen={rightPanelOpen}
          onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
          showExportMenu={showExportMenu}
          onToggleExportMenu={() => setShowExportMenu(!showExportMenu)}
          onSave={saveDiagram}
          onSynthesizeProtocols={synthesizeProtocols}
          onExportPNG={exportPNG}
          onExportJSON={exportJSON}
          connectMode={connectMode}
          onToggleConnectMode={() => { setConnectMode(!connectMode); setConnectSource(null); }}
          simulateFlow={simulateFlow}
          onToggleSimulateFlow={() => setSimulateFlow(!simulateFlow)}
          onOpenInvite={() => setShowInviteModal(true)}
        />

        <MainArea>
          <NodeDetailsSidebar
            open={leftSidebarOpen}
            onClose={() => setLeftSidebarOpen(false)}
            selectedNode={selectedNode}
          />

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
    </>
  );
}
