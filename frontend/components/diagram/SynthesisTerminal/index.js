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
  const errorLabel = /^AI_CREDITS_LOW/i.test(error || '') ? 'ACTION_REQUIRED' : 'CRITICAL_FAILURE';

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [content, error]);

  return (
    <Overlay>
      <TerminalContainer>
        <TerminalHeader>
          <TerminalTitle>AI_SYNTHESIS_MAIN_PROCESS_V1.0</TerminalTitle>
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
            [SYSTEM]: Initializing architectural synthesis...<br />
            [SYSTEM]: Streaming architecture draft from the AI service...<br />
            [SYSTEM]: Review-safe hardening runs automatically before the diagram opens...
          </SystemLines>
          {content}
          
          {!error && <Cursor />}
          
          {error && (
            <ErrorBlock>
              [{errorLabel}]: {error}<br /><br />
              <RetryButton type="button" onClick={onRetry}>
                RETRY_SYNTHESIS
              </RetryButton>
            </ErrorBlock>
          )}
        </TerminalBody>
      </TerminalContainer>
    </Overlay>
  );
}
