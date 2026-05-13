'use client';

import styled from 'styled-components';
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

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
`;

const RouteCard = styled.div`
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background: #ffffff;
  display: grid;
  gap: 16px;
  box-shadow: none;
`;

const RouteMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const Arrow = styled.span`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  color: #bbb;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const EndpointName = styled.div`
  font-family: var(--font-sans);
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.2;
  color: #000000;
  overflow-wrap: break-word;
`;

const ProtocolHero = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #f0f0f0;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #444;
`;

const InsightList = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
`;

const InsightItem = styled.div`
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  background: #f9f9f9;
  font-size: 12px;
  line-height: 1.6;
  color: #444;
`;

const EmptyHint = styled.div`
  padding: 20px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  color: #999;
  text-align: center;
  background: rgba(0, 0, 0, 0.01);
`;

const DangerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 24px;
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 12px;
  background: #fff;
  color: #DC2626;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #FEF2F2;
    border-color: rgba(220, 38, 38, 0.4);
  }
`;

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
