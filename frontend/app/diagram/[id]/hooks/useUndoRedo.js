import { useCallback, useEffect, useRef, useState } from 'react';

export function useUndoRedo({ nodes, edges, setNodes, setEdges }) {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const isUndoingRef = useRef(false);
  const isRedoingRef = useRef(false);
  const skipHistoryRef = useRef(false);

  useEffect(() => {
    if (skipHistoryRef.current) { skipHistoryRef.current = false; return; }
    if (isUndoingRef.current || isRedoingRef.current) return;
    if (nodes.length === 0 && edges.length === 0) return;
    setUndoStack(prev => [...prev.slice(-50), { nodes, edges }]);
    setRedoStack([]);
  }, [nodes, edges]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      skipHistoryRef.current = true;
      isUndoingRef.current = true;
      setRedoStack(r => [...r, { nodes, edges }]);
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
      setUndoStack(u => [...u, { nodes, edges }]);
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

  return {
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    handleUndo,
    handleRedo,
    skipHistoryRef
  };
}
