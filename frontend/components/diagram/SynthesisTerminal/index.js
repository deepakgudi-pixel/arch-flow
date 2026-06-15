'use client';

import { useEffect, useRef } from 'react';
import {
  Overlay, TerminalContainer, TerminalHeader, TerminalTitle, TerminalControls, CloseControl,
  TerminalBody, SystemLines, ErrorBlock, RetryButton, Cursor, ProgressRail,
  ProgressStep, ProgressLine, ProgressLabel, ProgressStatus
} from './SynthesisTerminal.styles';

export default function SynthesisTerminal({ content, error, progress, onRetry, onClose }) {
  const bodyRef = useRef(null);
  const stages = progress?.stages || [];
  const activeIndex = progress?.activeIndex || 0;
  const elapsedSeconds = progress?.elapsedSeconds || 0;
  const isCreditError = /^AI_CREDITS_LOW/i.test(error || '');
  const errorTitle = isCreditError ? 'Credits are low' : 'Generation needs attention';
  const errorMessage = isCreditError
    ? 'The AI provider could not complete this request with the current credit balance. Try a shorter prompt or add OpenRouter credits.'
    : String(error || 'The architecture draft could not be completed. Retry once, or simplify the prompt if this keeps happening.');

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [content, error]);

  return (
    <Overlay>
      <TerminalContainer>
        <TerminalHeader>
          <TerminalTitle>Synthesizing architecture</TerminalTitle>
          <TerminalControls>
            <CloseControl type="button" onClick={onClose} aria-label="Close synthesis terminal" />
          </TerminalControls>
        </TerminalHeader>
        {stages.length > 0 && (
          <ProgressRail>
            {stages.map((stage, index) => (
              <ProgressStep key={stage.id}>
                <ProgressLine $complete={index < activeIndex} $active={index === activeIndex} />
                <ProgressLabel $complete={index < activeIndex} $active={index === activeIndex}>
                  {stage.label}
                </ProgressLabel>
              </ProgressStep>
            ))}
            <ProgressStatus>
              <span>{progress?.detail || 'Working through the generation pipeline.'}</span>
              <span>{elapsedSeconds}s elapsed</span>
            </ProgressStatus>
          </ProgressRail>
        )}
        <TerminalBody ref={bodyRef}>
          <SystemLines>
            Preparing the architecture draft...<br />
            Streaming components and connections from the AI service...<br />
            Hardening rules run before the diagram opens.
          </SystemLines>
          {content}
          
          {!error && <Cursor />}
          
          {error && (
            <ErrorBlock>
              <strong>{errorTitle}</strong>
              <span>{errorMessage}</span>
              <RetryButton type="button" onClick={onRetry}>
                Retry
              </RetryButton>
            </ErrorBlock>
          )}
        </TerminalBody>
      </TerminalContainer>
    </Overlay>
  );
}
