'use client';

import { BookOpen, Sparkles } from 'lucide-react';
import {
  Overlay, Header, TitleStack, Eyebrow, Title, CloseButton, StepList, Step,
  StepNumber, StepBody, StepTitle, StepText, ActionRow, ActionButton
} from './GuidedModePanel.styles';

const STEPS = [
  {
    title: 'Describe the product',
    text: 'Use a concrete prompt so Archflow can infer users, services, data stores, queues, and reliability layers.'
  },
  {
    title: 'Generate the diagram',
    text: 'The draft is hardened before it opens, so the canvas starts from a review-safe architecture.'
  },
  {
    title: 'Review the reasoning',
    text: 'Use Review to inspect score, flows, missing layers, and the narrative behind the design.'
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
          <Eyebrow><BookOpen size={11} /> Guided mode</Eyebrow>
          <Title>{activeExample ? `${activeExample.name} design path` : 'Build your first architecture in three steps'}</Title>
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
        <ActionButton type="button" onClick={onOpenReview}>Review</ActionButton>
        <ActionButton type="button" $primary onClick={onOpenAssistant}>
          <Sparkles size={12} />
          Ask AI
        </ActionButton>
      </ActionRow>
    </Overlay>
  );
}
