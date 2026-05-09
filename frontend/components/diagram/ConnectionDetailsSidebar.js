'use client';

import styled from 'styled-components';
import { Badge } from '@/components/ui/Badge';
import {
  LeftSidebar,
  SidebarContent,
  SidebarTitle,
  CloseBtn,
  TechBadge,
  SectionTitle,
  Description
} from './editorStyles';

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
`;

const RouteCard = styled.div`
  padding: 18px;
  border: 3px solid #000000;
  background: #ffffff;
  display: grid;
  gap: 14px;
`;

const RouteMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const Arrow = styled.span`
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 900;
  color: #666666;
`;

const EndpointName = styled.div`
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1.1;
  text-transform: uppercase;
  color: #000000;
  overflow-wrap: break-word;
`;

const ProtocolHero = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 10px 14px;
  border: 2px solid #000000;
  background: #f6f6f6;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
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
  color: #333333;
`;

const EmptyHint = styled.div`
  padding: 14px 16px;
  border: 2px dashed #bdbdbd;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: #777777;
  text-transform: uppercase;
`;

export default function ConnectionDetailsSidebar({
  open,
  onClose,
  selectedEdge,
  connectionProfile
}) {
  return (
    <LeftSidebar $open={open}>
      {open && (
        <SidebarContent>
          <SidebarTitle>
            CONNECTION_DETAILS
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
            </>
          ) : null}
        </SidebarContent>
      )}
    </LeftSidebar>
  );
}
