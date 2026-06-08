'use client';

import {
  EmptyEyebrow,
  EmptyPanel,
  EmptyShell,
  EmptyText,
  EmptyTitle
} from './EmptyCanvasState.styles';

export default function EmptyCanvasState({
  activeExample
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
      </EmptyPanel>
    </EmptyShell>
  );
}
