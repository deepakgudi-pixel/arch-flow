'use client';

import styled from 'styled-components';
import { Handle, Position } from 'reactflow';
import { categoryColors } from '@/lib/theme';

const NodeWrapper = styled.div`
  padding: 0;
  background: #ffffff;
  border: 3px solid #000000;
  min-width: 180px;
  transition: all 0.1s;
  overflow: hidden;
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
`;

const NodeName = styled.div`
  font-weight: 900;
  color: #000000;
  font-size: 15px;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const NodeRole = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
`;

import * as LucideIcons from 'lucide-react';

export function CustomNode({ data, selected }) {
  const IconComponent = LucideIcons[data.icon] || LucideIcons.Layers;

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <NodeWrapper $selected={selected} $category={data.category}>
        <NodeTopBar $category={data.category}>
          <NodeCategoryLabel>{data.category}</NodeCategoryLabel>
        </NodeTopBar>
        <NodeBody>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ padding: '6px', border: '2px solid #000', background: '#f5f5f5' }}>
              <IconComponent size={16} strokeWidth={3} />
            </div>
            <div>
              <NodeName>{data.label}</NodeName>
              <NodeRole>{data.role}</NodeRole>
            </div>
          </div>
        </NodeBody>
      </NodeWrapper>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
