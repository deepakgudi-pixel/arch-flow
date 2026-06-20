import { useCallback, useEffect, useRef, useState } from 'react';
import api, { setToken } from '@/lib/api';
import {
  buildPersistedEdgesPayload,
  buildPersistedNodesPayload,
  isZoneNode,
  serializeDiagramSnapshot
} from '../editorPageUtils';

export function useDiagramPersistence({
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
}) {
  const [diagramName, setDiagramName] = useState('Untitled diagram');
  const [inventory, setInventory] = useState({ builtIn: {} });
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [connectionMode, setConnectionMode] = useState('guided');
  const [connectionRules, setConnectionRules] = useState([]);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [showConfirmHistory, setShowConfirmHistory] = useState(false);
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedSnapshotRef = useRef('');
  const saveInFlightRef = useRef(false);
  const queuedSaveOptionsRef = useRef(null);
  const loadCompleteRef = useRef(false);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  nodesRef.current = nodes;
  edgesRef.current = edges;

  const loadVersions = useCallback(async () => {
    setVersionsLoading(true);
    try {
      const data = await api.getDiagramVersions(diagramId);
      setVersions(data || []);
    } catch (err) {
      console.error('Failed to load versions:', err);
    } finally {
      setVersionsLoading(false);
    }
  }, [diagramId]);

  const loadReviewContext = useCallback(async () => {
    let nextConnectionMode = 'guided';
    let nextConnectionRules = [];

    try {
      const settingsData = await api.getSettings();
      nextConnectionMode = settingsData.connection_mode || 'guided';
    } catch (err) {
      console.error('Failed to load review settings, using guided mode:', err);
    }

    try {
      const rulesData = await api.getConnectionRules();
      nextConnectionRules = rulesData || [];
    } catch (err) {
      console.error('Failed to load connection rules, using local fallbacks:', err);
    }

    setConnectionMode(nextConnectionMode);
    setConnectionRules(nextConnectionRules);
  }, []);

  const loadDiagram = useCallback(async () => {
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
            workflow: node.workflow || node.data?.workflow,
            implementation: node.implementation || node.data?.implementation,
            implementationDescription: node.implementationDescription || node.data?.implementationDescription,
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
  }, [diagramId, setEdges, setNodes, setToast, simulateFlow]);

  const loadInventory = useCallback(async () => {
    try {
      const data = await api.getInventory();
      setInventory({
        builtIn: data.builtIn || {}
      });
    } catch (error) {
      console.error('Failed to load inventory:', error);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn || !diagramId) {
      return;
    }

    let cancelled = false;

    const initializeDiagramPage = async () => {
      try {
        const token = await getToken();

        if (cancelled) {
          return;
        }

        if (token) {
          setToken(token);
        }
      } catch (err) {
        console.error('Failed to resolve auth token for diagram page:', err);
      }

      if (cancelled) {
        return;
      }

      loadDiagram();
      loadInventory();
      loadVersions();
      loadReviewContext();
    };

    initializeDiagramPage();

    return () => {
      cancelled = true;
    };
  }, [diagramId, getToken, isSignedIn, loadDiagram, loadInventory, loadReviewContext, loadVersions]);

  const buildPersistedDiagramState = useCallback((overrides = {}) => {
    const nextName = overrides.name ?? overrides.diagramName ?? diagramName;
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

    if (saveInFlightRef.current) {
      queuedSaveOptionsRef.current = {
        showToast: queuedSaveOptionsRef.current?.showToast || showToast,
        recordVersion: queuedSaveOptionsRef.current?.recordVersion || recordVersion,
        overrides
      };
      return;
    }

    setSaveStatus('saving');
    saveInFlightRef.current = true;

    try {
      const effectiveOverrides = Object.keys(overrides).length > 0
        ? { nodes: overrides.nodes || nodesRef.current, edges: overrides.edges || edgesRef.current, diagramName: overrides.diagramName || diagramName }
        : {};
      const payload = buildPersistedDiagramState(effectiveOverrides);

      if (!recordVersion && payload.snapshot === lastSavedSnapshotRef.current) {
        saveInFlightRef.current = false;
        setSaveStatus('saved');
        return;
      }

      await api.updateDiagram(diagramId, {
        name: payload.name,
        nodes: payload.nodesData,
        edges: payload.edgesData,
        recordVersion
      });
      lastSavedSnapshotRef.current = payload.snapshot;
      setSaveStatus('saved');

      if (recordVersion) {
        loadVersions();
      }

      if (showToast) {
        setToast({ message: 'SYSTEM_SYNC: SUCCESS', error: false, warning: false });
        setTimeout(() => setToast(null), 2000);
      }
    } catch (err) {
      console.error('Failed to save:', err);
      setSaveStatus('error');
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
  }, [buildPersistedDiagramState, diagramId, diagramName, loadVersions, setToast]);

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

  const handleSelectVersion = useCallback((version) => {
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
          workflow: node.workflow,
          implementation: node.implementation,
          implementationDescription: node.implementationDescription,
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
  }, [saveDiagram, setEdges, setNodes, setToast, simulateFlow]);

  const handleClearHistory = useCallback(() => {
    setShowConfirmHistory(true);
  }, []);

  const confirmClearHistory = useCallback(async () => {
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
  }, [diagramId, setToast]);

  const updateDiagramName = useCallback((event) => {
    setDiagramName(event.target.value);
  }, []);

  const handleNameBlur = useCallback(() => {
    saveDiagram({ showToast: false, recordVersion: false });
  }, [saveDiagram]);

  return {
    diagramName,
    setDiagramName,
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
  };
}
