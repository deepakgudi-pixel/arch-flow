'use client';

import { Handle, Position } from 'reactflow';
import {
  getNodeDisplayName,
  getNodeImplementationDisplayName,
  getNodeUnitTypeLabel,
  hasDistinctImplementation
} from '@/lib/nodePresentation';
import {
  NodeWrapper, NodeTopBar, NodeCategoryLabel, NodeBody, NodeContent, NodeText, NodeName,
  IconContainer, NodeMeta
} from './CustomNode.styles';

import * as LucideIcons from 'lucide-react';

export function CustomNode({ data, selected }) {
  const IconComponent = LucideIcons[data.icon] || LucideIcons.Layers;
  const displayLabel = getNodeDisplayName(data);
  const implementationLabel = getNodeImplementationDisplayName(data);
  const unitTypeLabel = getNodeUnitTypeLabel(data.category);
  const metaLabel = hasDistinctImplementation(data)
    ? implementationLabel
    : '';

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
          <NodeCategoryLabel>{unitTypeLabel}</NodeCategoryLabel>
        </NodeTopBar>
        <NodeBody>
          <NodeContent>
            <IconContainer>
              <IconComponent size={16} strokeWidth={3} />
            </IconContainer>
            <NodeText>
              <NodeName>{displayLabel}</NodeName>
              {metaLabel && <NodeMeta>{metaLabel}</NodeMeta>}
            </NodeText>
          </NodeContent>
        </NodeBody>
      </NodeWrapper>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
