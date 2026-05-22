'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  buildDiagramStudyGuide,
  buildReviewLearningSummary,
  getFindingLearningProfile
} from '@/lib/learningInsights';
import { buildArchitectureNarrative } from '@/lib/architectureNarrative';
import { CloseBtn } from '../editorStyles';
import {
  Panel, PanelHeader, TitleRow, TitleCluster, Title, ScoreRow, ScoreCircle, ScoreMeta,
  ScoreLabel, ScoreBar, ScoreFill, SummaryGrid, SummaryCard, SummaryLabel, SummaryValue,
  FindingsList, FindingCard, FindingTop, FindingTitle, FindingDetail, Footer, EmptyState,
  EmptyHero, EmptyTitle, EmptyDescription, CoverageGrid, CoverageCard, CoverageValue,
  CoverageLabel, CheckList, CheckItem, ReviewSection, SectionHeading, SuggestionCard,
  SuggestionTop, SuggestionName, SuggestionRole, ConnectionList, ConnectionItem,
  ConnectionRoute, ConnectionReason, SuggestionActions, SuggestionButton, BreakdownToggle,
  BreakdownPanel, BreakdownRow, BreakdownLabel, BreakdownValue, ScoreDivider, AutoFixesList,
  AutoFixItem, BadgeRow, SuggestionMetaStack, LearningSummary, LearningTitle, LearningText,
  FindingLesson, LessonLabel, LessonText, StudyGuideList, StudyCard, StudyTitle, StudyText,
  StudyInspect, NarrativeCard, NarrativeList, NarrativeItem, FindingInspectHint
} from './ReviewPanel.styles';

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
  const narrative = buildArchitectureNarrative({
    nodes,
    edges,
    findings: safeFindings,
    score
  });
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
            <ScoreDivider />
            <BreakdownRow><BreakdownLabel $bold>Final Score</BreakdownLabel><BreakdownValue $bold>{score.score}</BreakdownValue></BreakdownRow>
          </BreakdownPanel>
        )}
        <BadgeRow>
          <Badge $tone="neutral">{connectionMode || 'guided'} mode</Badge>
          {hasSuggestions && <Badge $tone="warning">AI: {suggestions.length} staged</Badge>}
          {!hasSuggestions && !hasActiveFindings && <Badge $tone="success"><CheckCircle2 size={12} /> All checks passed</Badge>}
        </BadgeRow>
        <LearningSummary>
          <LearningTitle>{learningSummary.title}</LearningTitle>
          <LearningText>{learningSummary.detail}</LearningText>
        </LearningSummary>
        <NarrativeCard>
          <LearningTitle>{narrative.title}</LearningTitle>
          <LearningText>{narrative.summary}</LearningText>
          <NarrativeList>
            {narrative.strengths.map(strength => (
              <NarrativeItem key={strength}>{strength}</NarrativeItem>
            ))}
          </NarrativeList>
          <LessonText>{narrative.reviewNote}</LessonText>
        </NarrativeCard>
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
                    <SuggestionMetaStack>
                      <SuggestionName>{suggestion.name}</SuggestionName>
                      <BadgeRow>
                        <Badge $tone="brand">{suggestion.category}</Badge>
                        <Badge $tone="neutral">Staged from chat</Badge>
                      </BadgeRow>
                    </SuggestionMetaStack>
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
                    <FindingInspectHint>
                      Click to highlight {finding.edgeIds?.length ? 'the exact flow' : finding.nodeIds?.length ? 'the affected component' : 'this review signal'} on the canvas
                    </FindingInspectHint>
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
