'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  buildDiagramStudyGuide,
  buildReviewLearningSummary,
  getFindingLearningProfile
} from '@/lib/learningInsights';
import { CloseBtn } from './editorStyles';

const Panel = styled.div`
  width: 380px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 1px solid rgba(0, 0, 0, 0.04);
  padding: 0 24px;
`;

const PanelHeader = styled.div`
  padding: 20px 0 16px;
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
  padding: 12px 0;
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
  padding: 20px 0;
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

const BreakdownToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  color: #999;
  padding: 4px 0;
  transition: color 0.2s;

  &:hover {
    color: #666;
  }
`;

const BreakdownPanel = styled.div`
  background: #f8f8f8;
  border-radius: 10px;
  padding: 12px;
  display: grid;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.6;
`;

const BreakdownRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BreakdownLabel = styled.span`
  font-family: var(--font-sans);
  font-weight: ${props => props.$bold ? '800' : '500'};
  color: ${props => props.$tone || '#333'};
`;

const BreakdownValue = styled.span`
  font-weight: 700;
  color: ${props => props.$tone || '#333'};
`;

const AutoFixesList = styled.div`
  display: grid;
  gap: 6px;
  padding: 8px 12px;
  background: #f0f7ff;
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.1);
`;

const AutoFixItem = styled.div`
  font-size: 11px;
  line-height: 1.5;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LearningSummary = styled.div`
  padding: 12px 14px;
  border: 1px solid rgba(3, 105, 161, 0.12);
  border-radius: 12px;
  background: #f7fbff;
  display: grid;
  gap: 5px;
`;

const LearningTitle = styled.div`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 800;
  color: #0369a1;
  text-transform: uppercase;
`;

const LearningText = styled.p`
  font-size: 12px;
  line-height: 1.55;
  color: #333333;
`;

const FindingLesson = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 10px;
  display: grid;
  gap: 6px;
`;

const LessonLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 900;
  color: #666666;
  text-transform: uppercase;
`;

const LessonText = styled.p`
  font-size: 11px;
  line-height: 1.55;
  color: #333333;
`;

const StudyGuideList = styled.div`
  display: grid;
  gap: 10px;
`;

const StudyCard = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: #ffffff;
  padding: 14px;
  display: grid;
  gap: 8px;
`;

const StudyTitle = styled.div`
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 800;
  color: #000000;
`;

const StudyText = styled.p`
  font-size: 12px;
  line-height: 1.55;
  color: #333333;
`;

const StudyInspect = styled.p`
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 8px;
  font-size: 11px;
  line-height: 1.55;
  color: #555555;
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
  edges = [],
  connectionMode,
  nodeCount = 0,
  edgeCount = 0,
  onFocusFinding,
  onAcceptSuggestion,
  onDeclineSuggestion,
  onClose,
  architectureScore,
  autoFixes = []
}) {
  const safeFindings = findings || [];
  const criticalCount = safeFindings.filter(finding => finding.severity === 'critical').length;
  const warningCount = safeFindings.filter(finding => finding.severity === 'warning').length;
  const infoCount = safeFindings.filter(finding => finding.severity === 'info').length;
  const nodeById = new Map((nodes || []).map(node => [node.id, node]));
  const hasSuggestions = suggestions.length > 0;
  const hasActiveFindings = safeFindings.filter(f => f.severity === 'critical' || f.severity === 'warning').length > 0;
  const score = architectureScore || { score: 0, grade: 'F', criticalCount, warningCount, infoCount, categoryCoverage: 0, coveragePct: 0, breakdown: { deductions: {}, bonuses: {} } };
  const learningSummary = buildReviewLearningSummary(safeFindings, nodeCount, edgeCount);
  const studyGuide = buildDiagramStudyGuide(nodes, edges);
  const [displayScore, setDisplayScore] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const prevScore = useRef(0);

  useEffect(() => {
    const target = score.score;
    const start = prevScore.current;
    if (start === target) return;
    const duration = 600;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    prevScore.current = target;
    requestAnimationFrame(animate);
  }, [score.score]);

  const renderStudyGuide = () => (
    studyGuide.length > 0 && (
      <ReviewSection>
        <SectionHeading>System Walkthrough</SectionHeading>
        <StudyGuideList>
          {studyGuide.map(item => (
            <StudyCard key={item.title}>
              <StudyTitle>{item.title}</StudyTitle>
              <StudyText>{item.detail}</StudyText>
              <StudyInspect>{item.inspect}</StudyInspect>
            </StudyCard>
          ))}
        </StudyGuideList>
      </ReviewSection>
    )
  );

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
          <LearningSummary>
            <LearningTitle>{learningSummary.title}</LearningTitle>
            <LearningText>{learningSummary.detail}</LearningText>
          </LearningSummary>
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
            <ScoreLabel>Architecture Score • {displayScore}/100</ScoreLabel>
            <ScoreBar>
              <ScoreFill $pct={displayScore} />
            </ScoreBar>
            <ScoreLabel>{score.categoryCoverage} layers • {score.coveragePct}% relevant coverage • {nodeCount} nodes • {edgeCount} edges</ScoreLabel>
          </ScoreMeta>
        </ScoreRow>
        <BreakdownToggle type="button" onClick={() => setShowBreakdown(!showBreakdown)}>
          {showBreakdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {showBreakdown ? 'Hide' : 'Show'} score breakdown
        </BreakdownToggle>
        {showBreakdown && (
          <BreakdownPanel>
            <BreakdownRow><BreakdownLabel $bold>Base</BreakdownLabel><BreakdownValue>100</BreakdownValue></BreakdownRow>
            {score.breakdown?.deductions?.critical > 0 && (
              <BreakdownRow><BreakdownLabel $tone="#dc2626">-{score.breakdown.deductions.critical / 15} critical × 15</BreakdownLabel><BreakdownValue $tone="#dc2626">-{score.breakdown.deductions.critical}</BreakdownValue></BreakdownRow>
            )}
            {score.breakdown?.deductions?.warning > 0 && (
              <BreakdownRow><BreakdownLabel $tone="#d97706">-{score.breakdown.deductions.warning / 8} warning × 8</BreakdownLabel><BreakdownValue $tone="#d97706">-{score.breakdown.deductions.warning}</BreakdownValue></BreakdownRow>
            )}
            {score.breakdown?.deductions?.info > 0 && (
              <BreakdownRow><BreakdownLabel $tone="#6b7280">-{score.breakdown.deductions.info / 2} info × 2</BreakdownLabel><BreakdownValue $tone="#6b7280">-{score.breakdown.deductions.info}</BreakdownValue></BreakdownRow>
            )}
            {Object.entries(score.breakdown?.bonuses || {}).filter(([, v]) => v > 0).map(([key, val]) => (
              <BreakdownRow key={key}><BreakdownLabel $tone="#059669">+{key === 'backendDb' ? 'backend+db' : key} bonus</BreakdownLabel><BreakdownValue $tone="#059669">+{val}</BreakdownValue></BreakdownRow>
            ))}
            <div style={{ borderTop: '1px solid #ddd', margin: '4px 0' }} />
            <BreakdownRow><BreakdownLabel $bold>Final Score</BreakdownLabel><BreakdownValue $bold>{score.score}</BreakdownValue></BreakdownRow>
          </BreakdownPanel>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Badge $tone="neutral">{connectionMode || 'guided'} mode</Badge>
          {hasSuggestions && <Badge $tone="warning">AI: {suggestions.length} staged</Badge>}
          {!hasSuggestions && !hasActiveFindings && <Badge $tone="success"><CheckCircle2 size={12} /> All checks passed</Badge>}
        </div>
        <LearningSummary>
          <LearningTitle>{learningSummary.title}</LearningTitle>
          <LearningText>{learningSummary.detail}</LearningText>
        </LearningSummary>
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
        {autoFixes.length > 0 && (
          <AutoFixesList>
            {autoFixes.map((fix, i) => (
              <AutoFixItem key={i}><CheckCircle2 size={12} />{fix}</AutoFixItem>
            ))}
          </AutoFixesList>
        )}
      </PanelHeader>

      {!hasSuggestions && !hasActiveFindings ? (
        <EmptyState>
          <EmptyHero>
            <EmptyTitle>
              <CheckCircle2 size={16} />
              All Clear — Score: {score.grade} ({score.score}/100)
            </EmptyTitle>
            <EmptyDescription>
              No issues found. {score.categoryCoverage} architecture layers covered ({score.coveragePct}% of relevant).
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
              <CoverageValue>{score.categoryCoverage}</CoverageValue>
              <CoverageLabel>Layers Used</CoverageLabel>
            </CoverageCard>
            <CoverageCard>
              <CoverageValue>{score.coveragePct}%</CoverageValue>
              <CoverageLabel>Coverage</CoverageLabel>
            </CoverageCard>
          </CoverageGrid>

          {renderStudyGuide()}

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
          {renderStudyGuide()}

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

          {safeFindings.length > 0 && (
            <ReviewSection>
              <SectionHeading>Rule Findings</SectionHeading>
              {safeFindings.map(finding => {
                const lesson = getFindingLearningProfile(finding.title);

                return (
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
                    <FindingLesson>
                      <LessonLabel>Why It Matters</LessonLabel>
                      <LessonText>{lesson.why}</LessonText>
                      <LessonLabel>How To Fix</LessonLabel>
                      <LessonText>{lesson.fix}</LessonText>
                    </FindingLesson>
                  </FindingCard>
                );
              })}
            </ReviewSection>
          )}
        </FindingsList>
      )}

      <Footer>
        {score.score >= 80 && !hasActiveFindings && !hasSuggestions
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
