'use client';

import { Handle, Position } from 'reactflow';
import { formatTechDisplayLabel } from '@/lib/displayNames';
import {
  NodeWrapper, NodeTopBar, NodeCategoryLabel, NodeBody, NodeContent, NodeText, NodeName,
  IconContainer
} from './CustomNode.styles';

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
          <NodeContent>
            <IconContainer>
              <IconComponent size={16} strokeWidth={3} />
            </IconContainer>
            <NodeText>
              <NodeName>{displayLabel}</NodeName>
            </NodeText>
          </NodeContent>
        </NodeBody>
      </NodeWrapper>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
