import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { isSemanticNodeData } from '@/lib/nodePresentation';

export function useDiagramSelection({
  nodes,
  edges,
  setNodes,
  setEdges,
  setLeftSidebarOpen,
  setRightPanelOpen,
  setHistoryPanelOpen,
  simulateFlow,
  setToast
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const replacementRefreshSeqByNodeRef = useRef(new Map());

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
  }, [nodes, selectedEdge, selectedNode, setLeftSidebarOpen]);

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
  }, [edges, selectedEdge, selectedNode, setLeftSidebarOpen]);

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

  const handleReplaceNode = useCallback((replacement) => {
    if (!selectedNode) {
      return;
    }

    const targetNodeId = selectedNode.id;
    const preservesRole = isSemanticNodeData(selectedNode.data);
    const replacementReason = preservesRole
      ? `Kept ${selectedNode.data.role || selectedNode.data.label} and swapped the implementation to ${replacement.name}.`
      : `Replaced manually with ${replacement.name} to preserve the ${selectedNode.data.category} layer while changing only this unit.`;
    const nextNodes = nodes.map(node => node.id === selectedNode.id ? ({
      ...node,
      data: {
        ...node.data,
        label: preservesRole ? node.data.label : replacement.name,
        icon: preservesRole ? (node.data.icon || replacement.icon) : (replacement.icon || node.data.icon),
        implementation: replacement.name,
        implementationDescription: replacement.description || replacement.role || '',
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
    setToast({
      message: preservesRole
        ? `IMPLEMENTATION_UPDATED: ${replacement.name}`
        : `UNIT_REPLACED: ${replacement.name}`,
      error: false
    });
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
  }, [edges, nodes, refreshEdgeLabelsForNode, selectedNode, setEdges, setLeftSidebarOpen, setNodes, setToast]);

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
  }, [edges, nodes, setHistoryPanelOpen, setLeftSidebarOpen, setRightPanelOpen]);

  const handleNodeClick = useCallback((event, node) => {
    if (node.type !== 'customNode') {
      return;
    }

    setSelectedNode(node);
    setSelectedEdge(null);
    setLeftSidebarOpen(true);
  }, [setLeftSidebarOpen]);

  const handleEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setLeftSidebarOpen(true);
  }, [setLeftSidebarOpen]);

  const handleSelectNodeFlow = useCallback((edgeId) => {
    const targetEdge = edges.find(edge => edge.id === edgeId);

    if (!targetEdge) {
      return;
    }

    setSelectedEdge(targetEdge);
    setSelectedNode(null);
    setLeftSidebarOpen(true);
  }, [edges, setLeftSidebarOpen]);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setLeftSidebarOpen(false);
  }, [setLeftSidebarOpen]);

  const deleteSelected = useCallback(() => {
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
  }, [selectedEdge, selectedNode, setEdges, setLeftSidebarOpen, setNodes]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNode || selectedEdge) {
          event.preventDefault();
          deleteSelected();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, selectedEdge, selectedNode]);

  return {
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
  };
}
