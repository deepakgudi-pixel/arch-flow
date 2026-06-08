import { useCallback, useEffect, useRef, useState } from 'react';

function cloneSnapshot(nodes, edges) {
  return {
    nodes: JSON.parse(JSON.stringify(nodes || [])),
    edges: JSON.parse(JSON.stringify(edges || []))
  };
}

function snapshotKey(snapshot) {
  return JSON.stringify(snapshot || { nodes: [], edges: [] });
}

export function useUndoRedo({ nodes, edges, setNodes, setEdges }) {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const isUndoingRef = useRef(false);
  const isRedoingRef = useRef(false);
  const skipHistoryRef = useRef(false);
  const isNodeDraggingRef = useRef(false);
  const dragStartSnapshotRef = useRef(null);
  const lastCommittedSnapshotRef = useRef(null);
  const currentSnapshotRef = useRef(cloneSnapshot(nodes, edges));

  const pushUndoSnapshot = useCallback((snapshot) => {
    if (!snapshot || (snapshot.nodes.length === 0 && snapshot.edges.length === 0)) {
      return;
    }

    setUndoStack(prev => {
      if (prev.length > 0 && snapshotKey(prev[prev.length - 1]) === snapshotKey(snapshot)) {
        return prev;
      }

      return [...prev.slice(-50), snapshot];
    });
    setRedoStack([]);
  }, []);

  useEffect(() => {
    const currentSnapshot = cloneSnapshot(nodes, edges);
    currentSnapshotRef.current = currentSnapshot;

    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      lastCommittedSnapshotRef.current = currentSnapshot;
      return;
    }

    if (isUndoingRef.current || isRedoingRef.current) return;
    if (nodes.length === 0 && edges.length === 0) return;
    if (isNodeDraggingRef.current) return;

    if (!lastCommittedSnapshotRef.current) {
      lastCommittedSnapshotRef.current = currentSnapshot;
      return;
    }

    if (snapshotKey(lastCommittedSnapshotRef.current) === snapshotKey(currentSnapshot)) {
      return;
    }

    pushUndoSnapshot(lastCommittedSnapshotRef.current);
    lastCommittedSnapshotRef.current = currentSnapshot;
  }, [edges, nodes, pushUndoSnapshot]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      skipHistoryRef.current = true;
      isUndoingRef.current = true;
      setRedoStack(r => [...r, cloneSnapshot(nodes, edges)]);
      setNodes(last.nodes);
      setEdges(last.edges);
      setTimeout(() => { isUndoingRef.current = false; }, 0);
      return prev.slice(0, -1);
    });
  }, [edges, nodes, setEdges, setNodes, undoStack.length]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      skipHistoryRef.current = true;
      isRedoingRef.current = true;
      setUndoStack(u => [...u, cloneSnapshot(nodes, edges)]);
      setNodes(last.nodes);
      setEdges(last.edges);
      setTimeout(() => { isRedoingRef.current = false; }, 0);
      return prev.slice(0, -1);
    });
  }, [edges, nodes, redoStack.length, setEdges, setNodes]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 'z' && event.shiftKey) {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRedo, handleUndo]);

  const handleNodeDragStart = useCallback(() => {
    isNodeDraggingRef.current = true;
    dragStartSnapshotRef.current = lastCommittedSnapshotRef.current || currentSnapshotRef.current;
  }, []);

  const handleNodeDragStop = useCallback(() => {
    const dragStartSnapshot = dragStartSnapshotRef.current;
    const currentSnapshot = cloneSnapshot(nodes, edges);

    isNodeDraggingRef.current = false;
    dragStartSnapshotRef.current = null;
    currentSnapshotRef.current = currentSnapshot;

    if (!dragStartSnapshot || snapshotKey(dragStartSnapshot) === snapshotKey(currentSnapshot)) {
      lastCommittedSnapshotRef.current = currentSnapshot;
      return;
    }

    pushUndoSnapshot(dragStartSnapshot);
    lastCommittedSnapshotRef.current = currentSnapshot;
  }, [edges, nodes, pushUndoSnapshot]);

  return {
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    handleUndo,
    handleRedo,
    handleNodeDragStart,
    handleNodeDragStop,
    skipHistoryRef
  };
}
