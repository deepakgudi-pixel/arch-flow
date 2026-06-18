'use client';

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';
import { getEdgeLabelBasePosition } from '@/lib/edgeLabelLayout';
import { SelectedGlowPath, ProtocolChip, RouteCaption, FlowLabel } from './ProtocolEdge.styles';

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

      {label && (
        <EdgeLabelRenderer>
          <ProtocolChip
            className="archflow-protocol-chip"
            $selected={selected}
            $visible={showProtocol}
            $left={basePosition.x + (data?.labelShiftX || 0)}
            $top={basePosition.y + (data?.labelShiftY || 0)}
          >
            {routeText && <RouteCaption className="archflow-protocol-route">{routeText}</RouteCaption>}
            <FlowLabel>{label}</FlowLabel>
          </ProtocolChip>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default ProtocolEdge;
