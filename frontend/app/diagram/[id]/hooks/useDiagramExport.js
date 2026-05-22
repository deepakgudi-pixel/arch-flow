import { useCallback } from 'react';
import { toPng } from 'html-to-image';
import { getRectOfNodes } from 'reactflow';

export function useDiagramExport({
  diagramName,
  nodes,
  edges,
  rfInstance,
  setShowExportMenu,
  setToast
}) {
  const exportJSON = useCallback(() => {
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
  }, [diagramName, edges, nodes, setShowExportMenu, setToast]);

  const exportPNG = useCallback(async () => {
    if (!rfInstance) return;

    setToast({ message: 'RENDER_4K_BLUEPRINT...', warning: true });

    try {
      const nodesBounds = getRectOfNodes(nodes);
      const padding = 150;
      const exportWidth = nodesBounds.width + (padding * 2);
      const exportHeight = nodesBounds.height + (padding * 2);

      const dataUrl = await toPng(document.querySelector('.react-flow__viewport'), {
        backgroundColor: '#ffffff',
        width: exportWidth,
        height: exportHeight,
        pixelRatio: 2,
        skipFonts: true,
        style: {
          width: exportWidth,
          height: exportHeight,
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
  }, [diagramName, nodes, rfInstance, setShowExportMenu, setToast]);

  return {
    exportJSON,
    exportPNG
  };
}
