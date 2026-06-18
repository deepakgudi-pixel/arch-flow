'use client';

import { createGlobalStyle } from 'styled-components';
import { MarkerType } from 'reactflow';
import { CustomNode } from '@/components/diagram/CustomNode';
import { ZoneNode } from '@/components/diagram/ZoneNode';
import { ProtocolEdge } from '@/components/diagram/ProtocolEdge';

export const GlobalStyle = createGlobalStyle`
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
    cursor: ${props => props.$isDesktop ? 'auto' : 'crosshair'};
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
    box-shadow: none;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    border-radius: 8px !important;
    overflow: hidden;
    background: #ffffff !important;
  }
  .react-flow__controls-button {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
    background: transparent !important;
    &:last-child { border-bottom: none !important; }
    &:hover { background: #f9f9f9 !important; }
  }
  .react-flow__minimap {
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    border-radius: 12px !important;
    background: #ffffff !important;
    box-shadow: none;
  }

  .react-flow__attribution {
    display: none !important;
  }

  .react-flow__viewport.archflow-exporting .archflow-protocol-chip {
    visibility: visible !important;
    opacity: 1 !important;
    min-width: 44px !important;
    max-width: 84px !important;
    padding: 3px 6px !important;
    border-width: 1px !important;
    gap: 0 !important;
  }

  .react-flow__viewport.archflow-exporting .archflow-protocol-route {
    display: none !important;
  }

  .react-flow__viewport.archflow-exporting .archflow-protocol-chip > div:last-child {
    font-size: 8px !important;
    line-height: 1 !important;
    letter-spacing: 0 !important;
    white-space: nowrap !important;
  }
`;

export const nodeTypes = {
  customNode: CustomNode,
  zoneNode: ZoneNode
};

export const edgeTypes = {
  protocolEdge: ProtocolEdge
};

export const defaultEdgeOptions = {
  type: 'protocolEdge',
  style: { stroke: '#000000', strokeWidth: 3 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#000000', width: 16, height: 16 }
};
