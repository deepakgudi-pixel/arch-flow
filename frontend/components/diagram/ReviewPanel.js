'use client';

import styled from 'styled-components';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { CloseBtn } from './editorStyles';

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
  justify-content: space-between;
  gap: 12px;
`;

const TitleCluster = styled.div`
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

const ReviewSection = styled.div`
  display: grid;
  gap: 10px;
`;

const SectionHeading = styled.div`
  padding: 4px 4px 0;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  color: #666666;
  text-transform: uppercase;
`;

const SuggestionCard = styled.div`
  border: 3px solid #000000;
  background: linear-gradient(180deg, #f2f8ff 0%, #ffffff 100%);
  padding: 16px;
  display: grid;
  gap: 12px;
`;

const SuggestionTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const SuggestionName = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  color: #000000;
`;

const SuggestionRole = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: #333333;
`;

const ConnectionList = styled.div`
  display: grid;
  gap: 8px;
`;

const ConnectionItem = styled.div`
  border: 2px solid #000000;
  background: rgba(255, 255, 255, 0.82);
  padding: 10px 12px;
  display: grid;
  gap: 4px;
`;

const ConnectionRoute = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  color: #000000;
`;

const ConnectionReason = styled.div`
  font-size: 11px;
  line-height: 1.5;
  color: #555555;
`;

const SuggestionActions = styled.div`
  display: flex;
  gap: 10px;
`;

const SuggestionButton = styled.button`
  flex: 1;
  padding: 10px 12px;
  border: 3px solid #000000;
  background: ${props => props.$tone === 'primary' ? '#000000' : '#ffffff'};
  color: ${props => props.$tone === 'primary' ? '#ffffff' : '#000000'};
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;

  &:hover {
    transform: translate(-1px, -1px);
  }
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

function formatConnectionPreview(connection, nodeById) {
  const resolveLabel = (nodeId) => {
    if (nodeId === '__NEW__') {
      return 'New module';
    }

    const node = nodeById.get(nodeId);

    return node?.data?.label || node?.name || nodeId;
  };

  return `${resolveLabel(connection.source)} -> ${resolveLabel(connection.target)} ${connection.label ? `(${connection.label})` : ''}`;
}

export default function ReviewPanel({
  findings,
  suggestions = [],
  nodes = [],
  connectionMode,
  nodeCount = 0,
  edgeCount = 0,
  onFocusFinding,
  onAcceptSuggestion,
  onDeclineSuggestion,
  onClose
}) {
  const criticalCount = findings.filter(finding => finding.severity === 'critical').length;
  const warningCount = findings.filter(finding => finding.severity === 'warning').length;
  const infoCount = findings.filter(finding => finding.severity === 'info').length;
  const nodeById = new Map((nodes || []).map(node => [node.id, node]));
  const hasSuggestions = suggestions.length > 0;
  const hasFindings = findings.length > 0;

  return (
    <Panel>
      <PanelHeader>
        <TitleRow>
          <TitleCluster>
            <ShieldAlert size={18} />
            <Title>Architecture Review</Title>
          </TitleCluster>
          <CloseBtn type="button" onClick={onClose} aria-label="Close architecture review">
            ×
          </CloseBtn>
        </TitleRow>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge $tone="neutral">Mode: {connectionMode || 'guided'}</Badge>
          {hasSuggestions && <Badge $tone="warning">AI Staged: {suggestions.length}</Badge>}
          {!hasSuggestions && !hasFindings && <Badge $tone="success"><CheckCircle2 size={12} /> PASS</Badge>}
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

      {!hasSuggestions && !hasFindings ? (
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
          {hasSuggestions && (
            <ReviewSection>
              <SectionHeading>AI Staged Additions</SectionHeading>
              {suggestions.map(suggestion => (
                <SuggestionCard key={suggestion.id}>
                  <SuggestionTop>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <SuggestionName>{suggestion.name}</SuggestionName>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Badge $tone="brand">{suggestion.category}</Badge>
                        <Badge $tone="neutral">Staged from chat</Badge>
                      </div>
                    </div>
                  </SuggestionTop>

                  <SuggestionRole>{suggestion.reason}</SuggestionRole>
                  <SuggestionRole>{suggestion.role}</SuggestionRole>

                  {suggestion.connections?.length > 0 && (
                    <ConnectionList>
                      {suggestion.connections.map((connection, index) => (
                        <ConnectionItem key={`${suggestion.id}_conn_${index}`}>
                          <ConnectionRoute>{formatConnectionPreview(connection, nodeById)}</ConnectionRoute>
                          {connection.reason && <ConnectionReason>{connection.reason}</ConnectionReason>}
                        </ConnectionItem>
                      ))}
                    </ConnectionList>
                  )}

                  <SuggestionActions>
                    <SuggestionButton
                      type="button"
                      $tone="primary"
                      onClick={() => onAcceptSuggestion?.(suggestion)}
                    >
                      Accept and connect
                    </SuggestionButton>
                    <SuggestionButton
                      type="button"
                      onClick={() => onDeclineSuggestion?.(suggestion)}
                    >
                      Decline
                    </SuggestionButton>
                  </SuggestionActions>
                </SuggestionCard>
              ))}
            </ReviewSection>
          )}

          {hasFindings && (
            <ReviewSection>
              <SectionHeading>Rule Findings</SectionHeading>
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
            </ReviewSection>
          )}
        </FindingsList>
      )}

      <Footer>
        {!hasSuggestions && !hasFindings
          ? 'This panel shows system-level review findings when the rule checks detect something worth verifying.'
          : hasSuggestions
            ? 'These items were staged by the AI assistant. Accept one to add it into the diagram and connect it into the current architecture, or decline it to discard the suggestion.'
            : 'Click any finding to focus the affected part of the diagram.'}
      </Footer>
    </Panel>
  );
}
