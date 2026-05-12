'use client';

import styled, { keyframes } from 'styled-components';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';
import { getEdgeLabelBasePosition } from '@/lib/edgeLabelLayout';

const edgePulse = keyframes`
  0% {
    opacity: 0.18;
    stroke-width: 8px;
  }

  50% {
    opacity: 0.34;
    stroke-width: 12px;
  }

  100% {
    opacity: 0.18;
    stroke-width: 8px;
  }
`;

const chipPulse = keyframes`
  0% {
    box-shadow: none;
    transform: translate(-50%, -50%) scale(1.04);
  }

  50% {
    box-shadow: none;
    transform: translate(-50%, -50%) scale(1.06);
  }

  100% {
    box-shadow: none;
    transform: translate(-50%, -50%) scale(1.04);
  }
`;

const SelectedGlowPath = styled.path`
  fill: none;
  stroke: rgba(255, 61, 0, 0.2);
  stroke-linecap: round;
  stroke-linejoin: round;
  pointer-events: none;
  animation: ${edgePulse} 1.9s ease-in-out infinite;
`;

const ProtocolChip = styled.div`
  position: absolute;
  pointer-events: none;
  padding: 8px 10px;
  border: 2px solid #000000;
  background: #ffffff;
  color: #000000;
  display: grid;
  gap: 4px;
  min-width: 156px;
  max-width: 220px;
  box-shadow: none;
  z-index: 30;
  opacity: 1;
  transition: transform 0.18s ease, opacity 0.18s ease, background 0.18s ease;
  animation: ${props => props.$selected ? chipPulse : 'none'} 1.9s ease-in-out infinite;
`;

const RouteCaption = styled.div`
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0.03em;
  color: #666666;
  text-transform: uppercase;
  white-space: normal;
  word-break: break-word;
`;

const FlowLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: 0.06em;
  color: #000000;
  text-transform: uppercase;
  white-space: normal;
  word-break: break-word;
`;

export function ProtocolEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  label,
  selected,
  data
}) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 20
  });

  const basePosition = getEdgeLabelBasePosition({
    edgeId: id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    selected
  });
  const showProtocol = Boolean(data?.showProtocol && label);
  const routeText = data?.routeText;

  return (
    <>
      {selected && <SelectedGlowPath d={edgePath} />}

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#FF3D00' : data?.highlighted ? '#FF7A45' : style?.stroke || '#000000',
          strokeWidth: selected ? 4 : data?.highlighted ? 3.5 : style?.strokeWidth || 3,
          opacity: data?.dimmed ? 0.28 : 1
        }}
      />

      {showProtocol && (
        <EdgeLabelRenderer>
          <ProtocolChip
            $selected={selected}
            style={{
              left: basePosition.x + (data?.labelShiftX || 0),
              top: basePosition.y + (data?.labelShiftY || 0),
              transform: `translate(-50%, -50%) ${selected ? 'scale(1.04)' : 'scale(1)'}`,
              background: selected ? '#fff6f2' : '#ffffff'
            }}
          >
            {routeText && <RouteCaption>{routeText}</RouteCaption>}
            <FlowLabel>{label}</FlowLabel>
          </ProtocolChip>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default ProtocolEdge;
