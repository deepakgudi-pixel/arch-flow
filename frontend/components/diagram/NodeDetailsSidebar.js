'use client';

import styled from 'styled-components';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatTechDisplayLabel } from '@/lib/displayNames';
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

const InsightList = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
`;

const InsightItem = styled.div`
  padding: 14px 16px;
  border: 2px solid #000000;
  background: #f8f8f8;
  font-size: 12px;
  line-height: 1.5;
  color: #333;
`;

const ReplaceStack = styled.div`
  display: grid;
  gap: 12px;
`;

const ReplaceCard = styled.div`
  padding: 14px 16px;
  border: 2px solid #000000;
  background: #ffffff;
  display: grid;
  gap: 10px;
`;

const ReplaceTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ReplaceName = styled.div`
  font-weight: 900;
  font-size: 0.95rem;
  text-transform: uppercase;
  color: #000000;
`;

const ReplaceMeta = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: #666;
  text-transform: uppercase;
`;

const ReplaceDescription = styled.div`
  font-size: 12px;
  line-height: 1.5;
  color: #444;
`;

const ConnectionStack = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
`;

const ConnectionCard = styled.div`
  padding: 14px 16px;
  border: 2px solid #000000;
  background: #ffffff;
  display: grid;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease;

  &:hover {
    transform: translate(-2px, -2px);
    background: #fffaf6;
  }
`;

const ConnectionRoute = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: #666666;
  text-transform: uppercase;
  line-height: 1.4;
  word-break: break-word;
`;

const ConnectionLabel = styled.div`
  font-weight: 900;
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #000000;
  line-height: 1.35;
  word-break: break-word;
`;

const ConnectionMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const EmptyHint = styled.div`
  padding: 14px 16px;
  border: 2px dashed #bdbdbd;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: #777;
  text-transform: uppercase;
`;

export default function NodeDetailsSidebar({
  open, onClose, selectedNode, trustProfile, replacementOptions, connectedFlows, onSelectFlow, onReplaceNode
}) {
  const displayLabel = selectedNode
    ? formatTechDisplayLabel(selectedNode.data.label, selectedNode.data.category)
    : '';

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
                <Badge $tone={
                  trustProfile?.confidence === 'HIGH' ? 'success' :
                  trustProfile?.confidence === 'MEDIUM' ? 'warning' :
                  'signal'
                }>
                  {trustProfile?.confidenceLabel || 'REVIEW'}
                </Badge>
              </DetailHeader>

              <NodeLabel $isLong={displayLabel.length > 12}>
                {displayLabel}
              </NodeLabel>
              <NodeRoleLabel>ROLE: {selectedNode.data.role}</NodeRoleLabel>

              <SectionTitle>Function Spec</SectionTitle>
              <Description>
                {selectedNode.data.category === 'database' && `${displayLabel} handles persistence operations and state management for the identified domain.`}
                {selectedNode.data.category === 'mobile' && `${displayLabel} serves as the native entry point for Android and iOS users, providing high-precision mobile interfaces.`}
                {selectedNode.data.category === 'frontend' && `${displayLabel} provides the primary interaction layer and state orchestration for end-users.`}
                {selectedNode.data.category === 'backend' && `${displayLabel} executes core business logic and exposes secure operational endpoints.`}
                {selectedNode.data.category === 'auth' && `${displayLabel} manages identity verification and permission lifecycle.`}
                {selectedNode.data.category === 'queue' && `${displayLabel} buffers high-volume data streams for asynchronous processing.`}
                {selectedNode.data.category === 'storage' && `${displayLabel} provides scalable object storage for unstructured binary data.`}
                {selectedNode.data.category === 'external' && `${displayLabel} represents an external dependency outside the primary system boundary.`}
                {selectedNode.data.category === 'devops' && `${displayLabel} facilitates infrastructure automation and delivery pipelines.`}
              </Description>

              {trustProfile?.whyChosen && (
                <>
                  <SectionTitle>Why This Was Chosen</SectionTitle>
                  <Description>{trustProfile.whyChosen}</Description>
                </>
              )}

              {trustProfile?.assumptions?.length > 0 && (
                <>
                  <SectionTitle>Assumptions</SectionTitle>
                  <InsightList>
                    {trustProfile.assumptions.map((assumption, index) => (
                      <InsightItem key={`${selectedNode.id}_assumption_${index}`}>
                        {assumption}
                      </InsightItem>
                    ))}
                  </InsightList>
                </>
              )}

              {trustProfile?.risks?.length > 0 && (
                <>
                  <SectionTitle>Review Risks</SectionTitle>
                  <InsightList>
                    {trustProfile.risks.map((risk, index) => (
                      <InsightItem key={`${selectedNode.id}_risk_${index}`}>
                        {risk}
                      </InsightItem>
                    ))}
                  </InsightList>
                </>
              )}

              <SectionTitle>Connected Flows</SectionTitle>
              <ConnectionStack>
                {connectedFlows && connectedFlows.length > 0 ? (
                  connectedFlows.map(flow => (
                    <ConnectionCard key={flow.id} onClick={() => onSelectFlow?.(flow.id)}>
                      <ConnectionRoute>{flow.routeText}</ConnectionRoute>
                      <ConnectionLabel>{flow.label}</ConnectionLabel>
                      <ConnectionMeta>
                        <Badge $tone={
                          flow.confidence === 'HIGH' ? 'success' :
                          flow.confidence === 'MEDIUM' ? 'warning' :
                          'signal'
                        }>
                          {flow.confidenceLabel || flow.confidence}
                        </Badge>
                        <ReplaceMeta>{flow.direction}</ReplaceMeta>
                      </ConnectionMeta>
                    </ConnectionCard>
                  ))
                ) : (
                  <EmptyHint>No connected flows yet.</EmptyHint>
                )}
              </ConnectionStack>

              {selectedNode.data.products && selectedNode.data.products.length > 0 && (
                <>
                  <SectionTitle>Recommended Stack</SectionTitle>
                  {selectedNode.data.products.map((product, idx) => (
                    <ProductCard key={idx} onClick={() => window.open(product.url, '_blank')}>
                      <ProductName>{product.name}</ProductName>
                      <ProductDesc>{product.description}</ProductDesc>
                    </ProductCard>
                  ))}
                </>
              )}

              <SectionTitle>Replace Unit</SectionTitle>
              <ReplaceStack>
                {replacementOptions && replacementOptions.length > 0 ? (
                  replacementOptions.map(option => (
                    <ReplaceCard key={`${selectedNode.id}_${option.name}`}>
                      <ReplaceTitle>
                        <ReplaceName>{option.name}</ReplaceName>
                        <ReplaceMeta>{option.source}</ReplaceMeta>
                      </ReplaceTitle>
                      <ReplaceDescription>
                        {option.description || `${option.name} can replace this ${selectedNode.data.category} unit without changing the rest of the architecture.`}
                      </ReplaceDescription>
                      <Button $variant="secondary" $size="sm" onClick={() => onReplaceNode?.(option)}>
                        Replace With {option.name}
                      </Button>
                    </ReplaceCard>
                  ))
                ) : (
                  <EmptyHint>No same-category replacements available yet.</EmptyHint>
                )}
              </ReplaceStack>
            </>
          )}
        </SidebarContent>
      )}
    </LeftSidebar>
  );
}
