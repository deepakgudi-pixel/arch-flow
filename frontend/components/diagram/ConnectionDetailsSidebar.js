'use client';

import { Badge } from '@/components/ui/Badge';
import { Trash2 } from 'lucide-react';
import { getProtocolLearningProfile } from '@/lib/learningInsights';
import {
  LeftSidebar,
  SidebarContent,
  SidebarTitle,
  CloseBtn,
  TechBadge,
  SectionTitle,
  Description
} from './editorStyles';
import {
  DetailHeader, RouteCard, RouteMeta, Arrow, EndpointName, ProtocolHero, InsightList,
  InsightItem, EmptyHint, DangerButton
} from './ConnectionDetailsSidebar.styles';

export default function ConnectionDetailsSidebar({
  open,
  onClose,
  selectedEdge,
  connectionProfile,
  onDeleteEdge
}) {
  const protocolLearning = connectionProfile
    ? getProtocolLearningProfile(
        connectionProfile.protocolLabel,
        connectionProfile.sourceCategory,
        connectionProfile.targetCategory
      )
    : null;

  return (
    <LeftSidebar $open={open}>
      {open && (
        <SidebarContent>
          <SidebarTitle>
            Connection Details
            <CloseBtn onClick={onClose}>×</CloseBtn>
          </SidebarTitle>

          {selectedEdge && connectionProfile ? (
            <>
              <DetailHeader>
                <Badge
                  $tone={
                    connectionProfile.confidence === 'HIGH' ? 'success' :
                    connectionProfile.confidence === 'MEDIUM' ? 'warning' :
                    'signal'
                  }
                >
                  {connectionProfile.confidenceLabel}
                </Badge>
                <ProtocolHero>{connectionProfile.protocolLabel}</ProtocolHero>
              </DetailHeader>

              <RouteCard>
                <RouteMeta>
                  <TechBadge $category={connectionProfile.sourceCategory}>
                    {connectionProfile.sourceCategory}
                  </TechBadge>
                  <Arrow>→</Arrow>
                  <TechBadge $category={connectionProfile.targetCategory}>
                    {connectionProfile.targetCategory}
                  </TechBadge>
                </RouteMeta>

                <EndpointName>{connectionProfile.sourceLabel}</EndpointName>
                <Arrow>TO</Arrow>
                <EndpointName>{connectionProfile.targetLabel}</EndpointName>
              </RouteCard>

              <SectionTitle>Connection Spec</SectionTitle>
              <Description>{connectionProfile.summary}</Description>

              <SectionTitle>Why This Connection Fits</SectionTitle>
              <Description>{connectionProfile.whyChosen}</Description>

              {protocolLearning && (
                <>
                  <SectionTitle>Protocol Primer</SectionTitle>
                  <InsightList>
                    <InsightItem>{protocolLearning.summary}</InsightItem>
                    <InsightItem>{protocolLearning.whenToUse}</InsightItem>
                    <InsightItem>{protocolLearning.watchOut}</InsightItem>
                  </InsightList>
                </>
              )}

              {connectionProfile.assumptions?.length > 0 && (
                <>
                  <SectionTitle>Assumptions</SectionTitle>
                  <InsightList>
                    {connectionProfile.assumptions.map((assumption, index) => (
                      <InsightItem key={`${selectedEdge.id}_assumption_${index}`}>
                        {assumption}
                      </InsightItem>
                    ))}
                  </InsightList>
                </>
              )}

              {connectionProfile.risks?.length > 0 ? (
                <>
                  <SectionTitle>Review Risks</SectionTitle>
                  <InsightList>
                    {connectionProfile.risks.map((risk, index) => (
                      <InsightItem key={`${selectedEdge.id}_risk_${index}`}>
                        {risk}
                      </InsightItem>
                    ))}
                  </InsightList>
                </>
              ) : (
                <>
                  <SectionTitle>Review Risks</SectionTitle>
                  <EmptyHint>No immediate connection-level review flags were raised.</EmptyHint>
                </>
              )}

              <DangerButton type="button" onClick={onDeleteEdge}>
                <Trash2 size={15} />
                Disconnect
              </DangerButton>
            </>
          ) : null}
        </SidebarContent>
      )}
    </LeftSidebar>
  );
}
