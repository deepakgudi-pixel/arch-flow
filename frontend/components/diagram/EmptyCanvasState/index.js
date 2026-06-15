'use client';

import { BookOpen, Sparkles } from 'lucide-react';
import {
  EmptyActions,
  EmptyEyebrow,
  EmptyPanel,
  EmptyPromptButton,
  EmptySecondaryButton,
  EmptyShell,
  EmptyText,
  EmptyTitle
} from './EmptyCanvasState.styles';

const QUICK_PROMPTS = [
  'Design a food delivery platform with customers, restaurants, couriers, dispatch, maps, payments, promos, fraud checks, notifications, and monitoring.',
  'Design a trading app with mobile clients, portfolio APIs, market data streams, order routing, risk checks, ledger, fraud detection, and audit logs.',
  'Design a travel marketplace with guest and host apps, search, booking checkout, calendars, payments, messaging, reviews, maps, trust workflows, and monitoring.'
];

export default function EmptyCanvasState({
  activeExample,
  onUsePrompt,
  onOpenGuide
}) {
  return (
    <EmptyShell aria-label="Empty diagram canvas">
      <EmptyPanel>
        <EmptyEyebrow>{activeExample ? `${activeExample.name} demo loaded` : 'Ready to synthesize'}</EmptyEyebrow>
        <EmptyTitle>{activeExample ? `${activeExample.name} system design` : 'Start with a real architecture'}</EmptyTitle>
        <EmptyText>
          {activeExample
            ? 'The prompt is staged below. Generate it, then open Review to inspect the reliability score, teaching notes, and exact architecture flows.'
            : 'Describe a product or choose a template. Archflow will generate the diagram, harden the result, and review it before you present it.'}
        </EmptyText>
        {!activeExample && (
          <EmptyActions aria-label="Quick architecture prompts">
            {QUICK_PROMPTS.map((quickPrompt, index) => (
              <EmptyPromptButton
                key={quickPrompt}
                type="button"
                onClick={() => onUsePrompt?.(quickPrompt)}
              >
                <Sparkles size={13} />
                {index === 0 ? 'Food delivery' : index === 1 ? 'Trading app' : 'Travel marketplace'}
              </EmptyPromptButton>
            ))}
            <EmptySecondaryButton type="button" onClick={onOpenGuide}>
              <BookOpen size={13} />
              Guided mode
            </EmptySecondaryButton>
          </EmptyActions>
        )}
      </EmptyPanel>
    </EmptyShell>
  );
}
