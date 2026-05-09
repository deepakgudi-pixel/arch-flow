'use client';

import styled from 'styled-components';
import { Handle, Position } from 'reactflow';
import { categoryColors } from '@/lib/theme';
import { formatTechDisplayLabel } from '@/lib/displayNames';

const NodeWrapper = styled.div`
  padding: 0;
  background: #ffffff;
  border: 3px solid #000000;
  width: 220px;
  min-width: 220px;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  transition: all 0.1s;
  overflow: hidden;
  opacity: ${props => props.$dimmed ? 0.32 : 1};
  filter: ${props => props.$dimmed ? 'grayscale(0.16)' : 'none'};
  box-shadow: ${props => props.$highlighted ? '0 0 0 4px rgba(255, 122, 69, 0.18)' : 'none'};
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
  display: flex;
  flex: 1;
`;

const NodeName = styled.div`
  font-weight: 900;
  color: #000000;
  font-size: 15px;
  text-transform: uppercase;
  line-height: 1.2;
  overflow-wrap: anywhere;
  margin-bottom: 4px;
`;

import * as LucideIcons from 'lucide-react';

export function CustomNode({ data, selected }) {
  const IconComponent = LucideIcons[data.icon] || LucideIcons.Layers;
  const displayLabel = formatTechDisplayLabel(data.label, data.category);

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <NodeWrapper
        $selected={selected}
        $category={data.category}
        $dimmed={data.dimmed}
        $highlighted={data.highlighted}
      >
        <NodeTopBar $category={data.category}>
          <NodeCategoryLabel>{data.category}</NodeCategoryLabel>
        </NodeTopBar>
        <NodeBody>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ padding: '6px', border: '2px solid #000', background: '#f5f5f5' }}>
              <IconComponent size={16} strokeWidth={3} />
            </div>
            <div>
              <NodeName style={{ marginBottom: 0 }}>{displayLabel}</NodeName>
            </div>
          </div>
        </NodeBody>
      </NodeWrapper>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
