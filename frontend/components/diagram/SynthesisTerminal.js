'use client';

import { useEffect, useRef } from 'react';
import {
  Overlay, TerminalContainer, TerminalHeader, TerminalTitle, TerminalControls, CloseControl,
  TerminalBody, SystemLines, ErrorBlock, RetryButton, Cursor
} from './SynthesisTerminal.styles';

export default function SynthesisTerminal({ content, error, onRetry, onClose }) {
  const bodyRef = useRef(null);

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
        <TerminalBody ref={bodyRef}>
          <SystemLines>
            [SYSTEM]: Initializing architectural synthesis...<br />
            [SYSTEM]: Accessing OpenRouter mainframe...<br />
            [SYSTEM]: Streaming technical specification...
          </SystemLines>
          {content}
          
          {!error && <Cursor />}
          
          {error && (
            <ErrorBlock>
              [CRITICAL_FAILURE]: {error}<br /><br />
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
