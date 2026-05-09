'use client';

import styled from 'styled-components';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const Panel = styled.div`
  width: 360px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PanelHeader = styled.div`
  padding: 24px;
  border-bottom: 3px solid #000000;
  display: grid;
  gap: 16px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h3`
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 14px;
  text-transform: uppercase;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;

const SummaryCard = styled.div`
  border: 2px solid #000000;
  padding: 12px;
  display: grid;
  gap: 6px;
  background: #ffffff;
`;

const SummaryLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  color: #666;
  text-transform: uppercase;
`;

const SummaryValue = styled.div`
  font-size: 1.2rem;
  font-weight: 900;
  color: #000000;
`;

const FindingsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FindingCard = styled.button`
  width: 100%;
  text-align: left;
  padding: 16px;
  border: 3px solid #000000;
  background: ${props =>
    props.$severity === 'critical' ? '#FFF0EE' :
    props.$severity === 'warning' ? '#FFF8E1' :
    '#F5F5F5'};
  cursor: pointer;
  display: grid;
  gap: 10px;
  transition: transform 0.1s ease, background 0.1s ease;

  &:hover {
    transform: translate(-2px, -2px);
    background: ${props =>
      props.$severity === 'critical' ? '#FFE4E0' :
      props.$severity === 'warning' ? '#FFF1C9' :
      '#ECECEC'};
  }
`;

const FindingTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const FindingTitle = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  color: #000000;
`;

const FindingDetail = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: #333333;
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 3px solid #000000;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: #666666;
  text-transform: uppercase;
`;

const EmptyState = styled.div`
  flex: 1;
  padding: 24px;
  display: grid;
  align-content: start;
  gap: 18px;
`;

const EmptyHero = styled.div`
  border: 3px solid #000000;
  background: #F3FFF7;
  padding: 20px;
  display: grid;
  gap: 10px;
`;

const EmptyTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  color: #000000;
`;

const EmptyDescription = styled.p`
  font-size: 12px;
  line-height: 1.6;
  color: #333333;
`;

const CoverageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

const CoverageCard = styled.div`
  border: 2px solid #000000;
  background: #ffffff;
  padding: 14px;
  display: grid;
  gap: 6px;
`;

const CoverageValue = styled.div`
  font-size: 1.3rem;
  font-weight: 900;
  color: #000000;
`;

const CoverageLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: #666666;
  text-transform: uppercase;
`;

const CheckList = styled.div`
  display: grid;
  gap: 10px;
`;

const CheckItem = styled.div`
  border: 2px solid #000000;
  background: #ffffff;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: #333333;
`;

function severityIcon(severity) {
  if (severity === 'critical') return <ShieldAlert size={14} />;
  if (severity === 'warning') return <AlertTriangle size={14} />;
  return <Info size={14} />;
}

function severityTone(severity) {
  if (severity === 'critical') return 'signal';
  if (severity === 'warning') return 'warning';
  return 'neutral';
}

export default function ReviewPanel({ findings, connectionMode, nodeCount = 0, edgeCount = 0, onFocusFinding }) {
  const criticalCount = findings.filter(finding => finding.severity === 'critical').length;
  const warningCount = findings.filter(finding => finding.severity === 'warning').length;
  const infoCount = findings.filter(finding => finding.severity === 'info').length;

  return (
    <Panel>
      <PanelHeader>
        <TitleRow>
          <ShieldAlert size={18} />
          <Title>Architecture Review</Title>
        </TitleRow>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge $tone="neutral">Mode: {connectionMode || 'guided'}</Badge>
          {findings.length === 0 && <Badge $tone="success"><CheckCircle2 size={12} /> PASS</Badge>}
        </div>
        <SummaryGrid>
          <SummaryCard>
            <SummaryLabel>Critical</SummaryLabel>
            <SummaryValue>{criticalCount}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Warnings</SummaryLabel>
            <SummaryValue>{warningCount}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Signals</SummaryLabel>
            <SummaryValue>{infoCount}</SummaryValue>
          </SummaryCard>
        </SummaryGrid>
      </PanelHeader>

      {findings.length === 0 ? (
        <EmptyState>
          <EmptyHero>
            <EmptyTitle>
              <CheckCircle2 size={16} />
              All Clear
            </EmptyTitle>
            <EmptyDescription>
              No active review findings were raised for the current diagram. That means the rule checks did not spot any obvious architecture risks right now.
            </EmptyDescription>
          </EmptyHero>

          <CoverageGrid>
            <CoverageCard>
              <CoverageValue>{nodeCount}</CoverageValue>
              <CoverageLabel>Units Reviewed</CoverageLabel>
            </CoverageCard>
            <CoverageCard>
              <CoverageValue>{edgeCount}</CoverageValue>
              <CoverageLabel>Flows Checked</CoverageLabel>
            </CoverageCard>
          </CoverageGrid>

          <CheckList>
            <CheckItem>
              <CheckCircle2 size={14} />
              Checked for direct client-to-database and other rule-breaking connections.
            </CheckItem>
            <CheckItem>
              <CheckCircle2 size={14} />
              Looked for missing application, auth, queue, and observability layers when relevant.
            </CheckItem>
            <CheckItem>
              <CheckCircle2 size={14} />
              Flagged generic protocols, isolated units, and obvious scaling pressure signals when present.
            </CheckItem>
          </CheckList>
        </EmptyState>
      ) : (
        <FindingsList>
          {findings.map(finding => (
            <FindingCard
              key={finding.id}
              $severity={finding.severity}
              onClick={() => onFocusFinding?.(finding)}
            >
              <FindingTop>
                <FindingTitle>{finding.title}</FindingTitle>
                <Badge $tone={severityTone(finding.severity)}>
                  {severityIcon(finding.severity)}
                  {finding.severity}
                </Badge>
              </FindingTop>
              <FindingDetail>{finding.detail}</FindingDetail>
            </FindingCard>
          ))}
        </FindingsList>
      )}

      <Footer>
        {findings.length === 0
          ? 'This panel shows system-level review findings when the rule checks detect something worth verifying.'
          : 'Click any finding to focus the affected part of the diagram.'}
      </Footer>
    </Panel>
  );
}
