'use client';

import styled from 'styled-components';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { CloseBtn } from './editorStyles';

const Panel = styled.div`
  width: 380px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 1px solid rgba(0, 0, 0, 0.04);
`;

const PanelHeader = styled.div`
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: grid;
  gap: 12px;
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
  gap: 10px;
`;

const Title = styled.h3`
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 15px;
  color: #000000;
`;

const ScoreRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ScoreCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  background: ${props =>
    props.$grade === 'A' ? '#065f46' :
    props.$grade === 'B' ? '#1e40af' :
    props.$grade === 'C' ? '#92400e' :
    props.$grade === 'D' ? '#991b1b' :
    '#7f1d1d'};
  flex-shrink: 0;
`;

const ScoreMeta = styled.div`
  display: grid;
  gap: 2px;
`;

const ScoreLabel = styled.div`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  color: #666;
`;

const ScoreBar = styled.div`
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #eee;
  overflow: hidden;
`;

const ScoreFill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: ${props =>
    props.$pct >= 80 ? '#065f46' :
    props.$pct >= 60 ? '#1e40af' :
    props.$pct >= 40 ? '#92400e' :
    '#991b1b'};
  width: ${props => props.$pct}%;
  transition: width 0.5s ease;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

const SummaryCard = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 10px;
  display: grid;
  gap: 4px;
  background: #ffffff;
`;

const SummaryLabel = styled.div`
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SummaryValue = styled.div`
  font-family: var(--font-sans);
  font-size: 1.1rem;
  font-weight: 800;
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
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: ${props =>
    props.$severity === 'critical' ? '#FFF5F5' :
    props.$severity === 'warning' ? '#FFFAF0' :
    '#F9F9F9'};
  cursor: pointer;
  display: grid;
  gap: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(0, 0, 0, 0.1);
    box-shadow: none;
    background: ${props =>
      props.$severity === 'critical' ? '#FFF0F0' :
      props.$severity === 'warning' ? '#FFF5E6' :
      '#F2F2F2'};
  }
`;

const FindingTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const FindingTitle = styled.div`
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  color: #000000;
  letter-spacing: -0.01em;
`;

const FindingDetail = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: #333333;
`;

const Footer = styled.div`
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  color: #999;
  line-height: 1.5;
`;

const EmptyState = styled.div`
  flex: 1;
  padding: 24px;
  display: grid;
  align-content: start;
  gap: 18px;
`;

const EmptyHero = styled.div`
  border: 1px solid rgba(16, 185, 129, 0.1);
  border-radius: 16px;
  background: #F3FFF7;
  padding: 20px;
  display: grid;
  gap: 10px;
`;

const EmptyTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 700;
  color: #065f46;
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
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
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
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  background: #ffffff;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: #666;
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
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background: linear-gradient(180deg, #f2f8ff 0%, #ffffff 100%);
  padding: 16px;
  display: grid;
  gap: 12px;
  box-shadow: none;
`;

const SuggestionTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const SuggestionName = styled.div`
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 700;
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
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.82);
  padding: 10px 12px;
  display: grid;
  gap: 4px;
`;

const ConnectionRoute = styled.div`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
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
  border-radius: 10px;
  border: 1px solid ${props => props.$tone === 'primary' ? 'transparent' : 'rgba(0, 0, 0, 0.1)'};
  background: ${props => props.$tone === 'primary' ? '#000000' : '#ffffff'};
  color: ${props => props.$tone === 'primary' ? '#ffffff' : '#000000'};
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$tone === 'primary' ? '#1a1a1a' : '#f9f9f9'};
    transform: translateY(-1px);
    box-shadow: none;
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
  onClose,
  architectureScore
}) {
  const criticalCount = findings.filter(finding => finding.severity === 'critical').length;
  const warningCount = findings.filter(finding => finding.severity === 'warning').length;
  const infoCount = findings.filter(finding => finding.severity === 'info').length;
  const nodeById = new Map((nodes || []).map(node => [node.id, node]));
  const hasSuggestions = suggestions.length > 0;
  const hasFindings = findings.length > 0;
  const score = architectureScore || { score: 0, grade: 'F', criticalCount, warningCount, infoCount, categoryCoverage: 0, coveragePct: 0 };

  if (nodeCount === 0) {
    return (
      <Panel>
        <PanelHeader>
          <TitleRow>
            <TitleCluster>
              <ShieldAlert size={16} />
              <Title>Architecture Review</Title>
            </TitleCluster>
            <CloseBtn type="button" onClick={onClose} aria-label="Close architecture review">×</CloseBtn>
          </TitleRow>
        </PanelHeader>
        <EmptyState>
          <EmptyHero>
            <EmptyTitle>
              <Info size={16} />
              No components to review
            </EmptyTitle>
            <EmptyDescription>
              Add technologies to your diagram to see architecture review signals, layer coverage, and improvement suggestions.
            </EmptyDescription>
          </EmptyHero>
        </EmptyState>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader>
        <TitleRow>
          <TitleCluster>
            <ShieldAlert size={16} />
            <Title>Architecture Review</Title>
          </TitleCluster>
          <CloseBtn type="button" onClick={onClose} aria-label="Close architecture review">
            ×
          </CloseBtn>
        </TitleRow>
        <ScoreRow>
          <ScoreCircle $grade={score.grade}>{score.grade}</ScoreCircle>
          <ScoreMeta>
            <ScoreLabel>Architecture Score • {score.score}/100</ScoreLabel>
            <ScoreBar>
              <ScoreFill $pct={score.score} />
            </ScoreBar>
            <ScoreLabel>{score.categoryCoverage}/9 layers • {score.coveragePct}% coverage • {nodeCount} nodes • {edgeCount} edges</ScoreLabel>
          </ScoreMeta>
        </ScoreRow>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Badge $tone="neutral">{connectionMode || 'guided'} mode</Badge>
          {hasSuggestions && <Badge $tone="warning">AI: {suggestions.length} staged</Badge>}
          {!hasSuggestions && !hasFindings && <Badge $tone="success"><CheckCircle2 size={12} /> All checks passed</Badge>}
        </div>
        <SummaryGrid>
          <SummaryCard>
            <SummaryLabel>Critical</SummaryLabel>
            <SummaryValue>{score.criticalCount}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Warnings</SummaryLabel>
            <SummaryValue>{score.warningCount}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Signals</SummaryLabel>
            <SummaryValue>{score.infoCount}</SummaryValue>
          </SummaryCard>
        </SummaryGrid>
      </PanelHeader>

      {!hasSuggestions && !hasFindings ? (
        <EmptyState>
          <EmptyHero>
            <EmptyTitle>
              <CheckCircle2 size={16} />
              All Clear — Score: {score.grade} ({score.score}/100)
            </EmptyTitle>
            <EmptyDescription>
              No issues found. {score.categoryCoverage} of 9 architecture layers are covered. {score.coveragePct}% category coverage.
            </EmptyDescription>
          </EmptyHero>

          <CoverageGrid>
            <CoverageCard>
              <CoverageValue>{nodeCount}</CoverageValue>
              <CoverageLabel>Components</CoverageLabel>
            </CoverageCard>
            <CoverageCard>
              <CoverageValue>{edgeCount}</CoverageValue>
              <CoverageLabel>Connections</CoverageLabel>
            </CoverageCard>
            <CoverageCard>
              <CoverageValue>{score.categoryCoverage}/9</CoverageValue>
              <CoverageLabel>Layers Used</CoverageLabel>
            </CoverageCard>
            <CoverageCard>
              <CoverageValue>{score.coveragePct}%</CoverageValue>
              <CoverageLabel>Coverage</CoverageLabel>
            </CoverageCard>
          </CoverageGrid>

          <CheckList>
            <CheckItem>
              <CheckCircle2 size={14} />
              No direct client-to-database or other invalid connections.
            </CheckItem>
            <CheckItem>
              <CheckCircle2 size={14} />
              All required layers (backend, auth, queue, observability) are present.
            </CheckItem>
            <CheckItem>
              <CheckCircle2 size={14} />
              No isolated nodes, generic protocols, or scaling bottleneck signals.
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
        {score.score >= 80 && !hasFindings && !hasSuggestions
          ? 'Production-grade architecture. No issues detected across all rule checks.'
          : hasSuggestions
            ? 'AI-staged suggestions appear above findings. Accept to auto-connect into the diagram or decline to dismiss.'
            : score.score >= 60
              ? 'Architecture is functional but has room for improvement. Address warnings to harden the design.'
              : score.score >= 40
                ? 'Architecture needs significant improvements. Critical issues should be resolved before production.'
                : 'Architecture has severe gaps. Review critical findings and consider regenerating with a more specific prompt.'}
      </Footer>
    </Panel>
  );
}
