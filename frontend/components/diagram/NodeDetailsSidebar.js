'use client';

import styled from 'styled-components';
import { Badge } from '@/components/ui/Badge';
import {
  LeftSidebar, SidebarContent, SidebarTitle, CloseBtn,
  TechBadge, SectionTitle, Description, ProductCard, ProductName, ProductDesc
} from './editorStyles';

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const NodeLabel = styled.div`
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 16px;
  text-transform: uppercase;
  overflow-wrap: break-word;
  word-break: normal; /* Don't break in middle of letters if possible */
  letter-spacing: -0.04em;
  hyphens: none;
  
  /* Scale down earlier and more aggressively for long names */
  ${props => props.$isLong && `
    font-size: 1.6rem;
    letter-spacing: -0.02em;
  `}
`;

const NodeRoleLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: #666;
  margin-bottom: 32px;
  text-transform: uppercase;
  word-break: break-word;
`;

export default function NodeDetailsSidebar({
  open, onClose, selectedNode
}) {
  return (
    <LeftSidebar $open={open}>
      {open && (
        <SidebarContent>
          <SidebarTitle>
            UNIT_DETAILS
            <CloseBtn onClick={onClose}>×</CloseBtn>
          </SidebarTitle>

          {selectedNode && (
            <>
              <DetailHeader>
                <TechBadge $category={selectedNode.data.category}>
                  {selectedNode.data.category}
                </TechBadge>
                <Badge $tone="neutral">STABLE</Badge>
              </DetailHeader>

              <NodeLabel $isLong={selectedNode.data.label?.length > 12}>
                {selectedNode.data.label}
              </NodeLabel>
              <NodeRoleLabel>ROLE: {selectedNode.data.role}</NodeRoleLabel>

              <SectionTitle>FUNCTION_SPEC</SectionTitle>
              <Description>
                {selectedNode.data.category === 'database' && `${selectedNode.data.label} handles persistence operations and state management for the identified domain.`}
                {selectedNode.data.category === 'mobile' && `${selectedNode.data.label} serves as the native entry point for Android and iOS users, providing high-precision mobile interfaces.`}
                {selectedNode.data.category === 'frontend' && `${selectedNode.data.label} provides the primary interaction layer and state orchestration for end-users.`}
                {selectedNode.data.category === 'backend' && `${selectedNode.data.label} executes core business logic and exposes secure operational endpoints.`}
                {selectedNode.data.category === 'auth' && `${selectedNode.data.label} manages identity verification and permission lifecycle.`}
                {selectedNode.data.category === 'queue' && `${selectedNode.data.label} buffers high-volume data streams for asynchronous processing.`}
                {selectedNode.data.category === 'storage' && `${selectedNode.data.label} provides scalable object storage for unstructured binary data.`}
                {selectedNode.data.category === 'external' && `${selectedNode.data.label} represents an external dependency outside the primary system boundary.`}
                {selectedNode.data.category === 'devops' && `${selectedNode.data.label} facilitates infrastructure automation and delivery pipelines.`}
              </Description>

              {selectedNode.data.reason && (
                <>
                  <SectionTitle>DESIGN_RATIONALE</SectionTitle>
                  <Description>{selectedNode.data.reason}</Description>
                </>
              )}

              {selectedNode.data.products && selectedNode.data.products.length > 0 && (
                <>
                  <SectionTitle>RECOMMENDED_STACK</SectionTitle>
                  {selectedNode.data.products.map((product, idx) => (
                    <ProductCard key={idx} onClick={() => window.open(product.url, '_blank')}>
                      <ProductName>{product.name}</ProductName>
                      <ProductDesc>{product.description}</ProductDesc>
                    </ProductCard>
                  ))}
                </>
              )}
            </>
          )}
        </SidebarContent>
      )}
    </LeftSidebar>
  );
}
