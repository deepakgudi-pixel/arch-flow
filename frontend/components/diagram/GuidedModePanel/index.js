'use client';

import { BookOpen, Sparkles } from 'lucide-react';
import {
  Overlay, Header, TitleStack, Eyebrow, Title, CloseButton, StepList, Step,
  StepNumber, StepBody, StepTitle, StepText, ActionRow, ActionButton
} from './GuidedModePanel.styles';

const STEPS = [
  {
    title: 'Generate a real system',
    text: 'Start from a familiar demo or describe any product. Archflow builds the first architecture draft.'
  },
  {
    title: 'Watch the quality gate',
    text: 'Generation checks rules, fills reliability layers, and hardens the diagram before you review it.'
  },
  {
    title: 'Learn through review',
    text: 'Open Architecture Review, click a finding, and Archflow highlights the exact node or path.'
  },
  {
    title: 'Present the story',
    text: 'Use Present to explain why the architecture works, what layers exist, and what tradeoffs remain.'
  }
];

export default function GuidedModePanel({
  onClose,
  onGenerate,
  onOpenAssistant,
  onOpenReview,
  activeExample
}) {
  return (
    <Overlay aria-label="Guided system design tutorial">
      <Header>
        <TitleStack>
          <Eyebrow><BookOpen size={11} /> Guided Mode</Eyebrow>
          <Title>{activeExample ? `${activeExample.name} system design path` : 'Learn system design through the diagram'}</Title>
        </TitleStack>
        <CloseButton type="button" onClick={onClose} aria-label="Close guided mode">×</CloseButton>
      </Header>

      <StepList>
        {STEPS.map((step, index) => (
          <Step key={step.title}>
            <StepNumber>{index + 1}</StepNumber>
            <StepBody>
              <StepTitle>{step.title}</StepTitle>
              <StepText>{step.text}</StepText>
            </StepBody>
          </Step>
        ))}
      </StepList>

      <ActionRow>
        <ActionButton type="button" onClick={onGenerate}>Generate</ActionButton>
        <ActionButton type="button" onClick={onOpenReview}>Open Review</ActionButton>
        <ActionButton type="button" $primary onClick={onOpenAssistant}>
          <Sparkles size={12} />
          Ask Assistant
        </ActionButton>
      </ActionRow>
    </Overlay>
  );
}
