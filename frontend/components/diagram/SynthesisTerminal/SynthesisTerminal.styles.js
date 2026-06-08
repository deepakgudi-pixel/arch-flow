import styled from 'styled-components';

export const Overlay = styled.div`
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

export const TerminalContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 60vh;
`;

export const TerminalHeader = styled.div`
  background: #000000;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #333;
`;

export const TerminalTitle = styled.div`
  color: #ffffff;
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 12px;
  letter-spacing: 0.1em;
`;

export const TerminalControls = styled.div`
  display: flex;
  gap: 8px;
`;

export const CloseControl = styled.button`
  width: 12px;
  height: 12px;
  background: #333;
  cursor: pointer;
  border: 0;
  padding: 0;
`;

export const TerminalBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: #4ADE80;
  
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #333;
  }
`;

export const ProgressRail = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  padding: 14px 20px;
  border-bottom: 1px solid #222222;
  background: #050505;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const ProgressStatus = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: #9ca3af;
  text-transform: uppercase;

  @media (max-width: 720px) {
    flex-direction: column;
    gap: 4px;
  }
`;

export const ProgressStep = styled.div`
  min-width: 0;
  display: grid;
  gap: 5px;
`;

export const ProgressLine = styled.div`
  height: 4px;
  background: ${props => props.$complete ? '#4ADE80' : props.$active ? '#ffffff' : '#333333'};
`;

export const ProgressLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 900;
  color: ${props => props.$complete || props.$active ? '#ffffff' : '#666666'};
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SystemLines = styled.div`
  margin-bottom: 16px;
  color: #888;
`;

export const ErrorBlock = styled.div`
  margin-top: 24px;
  padding: 16px;
  border: 2px solid #ef4444;
  color: #ef4444;
`;

export const RetryButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  font-family: var(--font-mono);
  font-weight: 900;
  cursor: pointer;
`;

export const Cursor = styled.span`
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
