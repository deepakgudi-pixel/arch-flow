'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatTechDisplayLabel } from '@/lib/displayNames';
import { getLayerLearningProfile } from '@/lib/learningInsights';
import {
  getNodeImplementationDisplayName,
  getNodeUnitTypeLabel,
  hasDistinctImplementation,
  isSemanticNodeData
} from '@/lib/nodePresentation';
import {
  LeftSidebar, SidebarContent, SidebarTitle, CloseBtn,
  TechBadge, SectionTitle, Description, ProductCard, ProductName, ProductDesc
} from '../editorStyles';
import {
  DetailHeader, NodeLabel, NodeRoleLabel, NodeTechKey, NodeTechLabel, NodeTechValue, InsightList, InsightItem, ReplaceHint, ReplaceStack,
  ReplaceCard, ReplaceTitle, ReplaceName, ReplaceMeta, ReplaceDescription, ConnectionStack,
  ConnectionCard, ConnectionRoute, ConnectionLabel, ConnectionMeta, EmptyHint
} from './NodeDetailsSidebar.styles';

export default function NodeDetailsSidebar({
  open, onClose, selectedNode, trustProfile, replacementOptions, connectedFlows, onSelectFlow, onReplaceNode
}) {
  const displayLabel = selectedNode
    ? formatTechDisplayLabel(selectedNode.data.label, selectedNode.data.category)
    : '';
  const implementationLabel = selectedNode
    ? getNodeImplementationDisplayName(selectedNode.data)
    : '';
  const unitTypeLabel = selectedNode
    ? getNodeUnitTypeLabel(selectedNode.data.category)
    : '';
  const hasDistinctTech = selectedNode
    ? hasDistinctImplementation(selectedNode.data)
    : false;
  const isSemanticUnit = selectedNode
    ? isSemanticNodeData(selectedNode.data)
    : false;
  const learningProfile = selectedNode
    ? getLayerLearningProfile(selectedNode.data.category, displayLabel)
    : null;

  return (
    <LeftSidebar $open={open}>
      {open && (
        <SidebarContent>
          <SidebarTitle>
            Unit Details
            <CloseBtn onClick={onClose}>×</CloseBtn>
          </SidebarTitle>

          {selectedNode && (
            <>
              <DetailHeader>
                <TechBadge $category={selectedNode.data.category}>
                  {unitTypeLabel}
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
              {(hasDistinctTech || isSemanticUnit) && (
                <NodeTechLabel>
                  <NodeTechKey>{isSemanticUnit ? 'Implementation' : 'Technology'}</NodeTechKey>
                  <NodeTechValue>{implementationLabel || 'Choose technology'}</NodeTechValue>
                </NodeTechLabel>
              )}

              {selectedNode.data.implementationDescription && (
                <>
                  <SectionTitle>Why This Technology Fits</SectionTitle>
                  <Description>{selectedNode.data.implementationDescription}</Description>
                </>
              )}

              {learningProfile && (
                <>
                  <SectionTitle>System Design Lesson</SectionTitle>
                  <InsightList>
                    <InsightItem>{learningProfile.principle}</InsightItem>
                    <InsightItem>{learningProfile.responsibilities}</InsightItem>
                    <InsightItem>{learningProfile.scalingCue}</InsightItem>
                  </InsightList>
                </>
              )}

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

              {learningProfile && (
                <>
                  <SectionTitle>Inspect This</SectionTitle>
                  <InsightList>
                    <InsightItem>{learningProfile.inspectQuestion}</InsightItem>
                    <InsightItem>{learningProfile.commonMistake}</InsightItem>
                  </InsightList>
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

              <SectionTitle>{isSemanticUnit ? 'Swap Technology' : 'Replace Unit'}</SectionTitle>
              <ReplaceStack>
                {isSemanticUnit && (
                  <ReplaceHint>
                    This keeps <strong>{displayLabel}</strong> as the responsibility and swaps only the technology behind it.
                  </ReplaceHint>
                )}
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
                        {isSemanticUnit ? `Use ${option.name}` : `Replace With ${option.name}`}
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
