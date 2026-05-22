'use client';

import { BookOpen, Sparkles } from 'lucide-react';
import {
  Overlay, Header, TitleStack, Eyebrow, Title, CloseButton, StepList, Step,
  StepNumber, StepBody, StepTitle, StepText, ActionRow, ActionButton
} from './GuidedModePanel.styles';

const STEPS = [
  {
    title: 'Start from a real system',
    text: 'Use the example picker or describe any product. Archflow builds the first architecture draft.'
  },
  {
    title: 'Read the diagram',
    text: 'Click components and flows to learn what each layer does and why the protocol matters.'
  },
  {
    title: 'Review the weak spots',
    text: 'Open Architecture Review, click a finding, and Archflow highlights the exact node or path.'
  },
  {
    title: 'Improve safely',
    text: 'Use staged assistant suggestions or Optimize to 100 to fix gaps without losing control.'
  }
];

export default function GuidedModePanel({
  onClose,
  onOpenAssistant,
  onOpenReview
}) {
  return (
    <Overlay aria-label="Guided system design tutorial">
      <Header>
        <TitleStack>
          <Eyebrow><BookOpen size={11} /> Guided Mode</Eyebrow>
          <Title>Learn system design through the diagram</Title>
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
        <ActionButton type="button" onClick={onOpenReview}>Open Review</ActionButton>
        <ActionButton type="button" $primary onClick={onOpenAssistant}>
          <Sparkles size={12} />
          Ask Assistant
        </ActionButton>
      </ActionRow>
    </Overlay>
  );
}
