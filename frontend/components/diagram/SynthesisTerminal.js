'use client';

import styled from 'styled-components';
import { useEffect, useRef } from 'react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 40px;
`;

const TerminalContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: #000000;
  border: 4px solid #000000;
  display: flex;
  flex-direction: column;
  height: 60vh;
`;

const TerminalHeader = styled.div`
  background: #000000;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #333;
`;

const TerminalTitle = styled.div`
  color: #ffffff;
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 12px;
  letter-spacing: 0.1em;
`;

const TerminalBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: #4ADE80; // Terminal Green
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
  }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 8px;
  height: 15px;
  background: #4ADE80;
  margin-left: 4px;
  vertical-align: middle;
  animation: blink 1s step-end infinite;

  @keyframes blink {
    50% { opacity: 0; }
  }
`;

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
          <div style={{ display: 'flex', gap: '8px' }}>
            <div 
              style={{ width: '12px', height: '12px', background: '#333', cursor: 'pointer' }} 
              onClick={onClose}
            />
          </div>
        </TerminalHeader>
        <TerminalBody ref={bodyRef}>
          <div style={{ marginBottom: '16px', color: '#888' }}>
            [SYSTEM]: Initializing architectural synthesis...<br />
            [SYSTEM]: Accessing OpenRouter mainframe...<br />
            [SYSTEM]: Streaming technical specification...
          </div>
          {content}
          
          {!error && <Cursor />}
          
          {error && (
            <div style={{ marginTop: '24px', padding: '16px', border: '2px solid #ef4444', color: '#ef4444' }}>
              [CRITICAL_FAILURE]: {error}<br /><br />
              <button 
                onClick={onRetry}
                style={{ 
                  background: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                RETRY_SYNTHESIS
              </button>
            </div>
          )}
        </TerminalBody>
      </TerminalContainer>
    </Overlay>
  );
}
