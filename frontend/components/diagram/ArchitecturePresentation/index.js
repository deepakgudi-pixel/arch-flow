'use client';

import { buildArchitectureNarrative } from '@/lib/architectureNarrative';
import { buildDiagramStudyGuide } from '@/lib/learningInsights';
import {
  CloseButton,
  Eyebrow,
  HeaderCopy,
  Overlay,
  PresentationBody,
  PresentationHeader,
  PresentationShell,
  ReviewNote,
  ScoreLabel,
  ScoreStrip,
  ScoreTile,
  ScoreValue,
  Section,
  SectionTitle,
  StoryItem,
  StoryList,
  Summary,
  Title,
  WalkthroughCard,
  WalkthroughGrid,
  WalkthroughText,
  WalkthroughTitle
} from './ArchitecturePresentation.styles';

export default function ArchitecturePresentation({
  open,
  onClose,
  diagramName,
  nodes,
  edges,
  findings,
  score,
  activeExample
}) {
  if (!open) {
    return null;
  }

  const narrative = buildArchitectureNarrative({ nodes, edges, findings, score });
  const studyGuide = buildDiagramStudyGuide(nodes, edges);
  const activeFindings = (findings || []).filter(finding => finding.severity === 'critical' || finding.severity === 'warning');
  const layerCount = new Set((nodes || []).map(node => node.data?.category).filter(Boolean)).size;

  return (
    <Overlay role="dialog" aria-modal="true" aria-label="Architecture presentation">
      <PresentationShell>
        <PresentationHeader>
          <HeaderCopy>
            <Eyebrow>{activeExample ? `${activeExample.name} system design` : 'Presentation mode'}</Eyebrow>
            <Title>{diagramName || narrative.title}</Title>
          </HeaderCopy>
          <CloseButton type="button" onClick={onClose} aria-label="Close presentation">×</CloseButton>
        </PresentationHeader>

        <PresentationBody>
          <ScoreStrip>
            <ScoreTile>
              <ScoreValue>{score?.score ?? 0}/100</ScoreValue>
              <ScoreLabel>Review Score</ScoreLabel>
            </ScoreTile>
            <ScoreTile>
              <ScoreValue>{activeFindings.length}</ScoreValue>
              <ScoreLabel>Active Signals</ScoreLabel>
            </ScoreTile>
            <ScoreTile>
              <ScoreValue>{layerCount}</ScoreValue>
              <ScoreLabel>Architecture Layers</ScoreLabel>
            </ScoreTile>
            <ScoreTile>
              <ScoreValue>{edges?.length || 0}</ScoreValue>
              <ScoreLabel>Verified Flows</ScoreLabel>
            </ScoreTile>
          </ScoreStrip>

          <Section>
            <SectionTitle>{narrative.title}</SectionTitle>
            <Summary>{narrative.summary}</Summary>
            <StoryList>
              {narrative.strengths.map(strength => (
                <StoryItem key={strength}>{strength}</StoryItem>
              ))}
            </StoryList>
          </Section>

          {studyGuide.length > 0 && (
            <Section>
              <SectionTitle>System Walkthrough</SectionTitle>
              <WalkthroughGrid>
                {studyGuide.map(item => (
                  <WalkthroughCard key={item.title}>
                    <WalkthroughTitle>{item.title}</WalkthroughTitle>
                    <WalkthroughText>{item.detail}</WalkthroughText>
                    <WalkthroughText>{item.inspect}</WalkthroughText>
                  </WalkthroughCard>
                ))}
              </WalkthroughGrid>
            </Section>
          )}

          <ReviewNote>{narrative.reviewNote}</ReviewNote>
        </PresentationBody>
      </PresentationShell>
    </Overlay>
  );
}
