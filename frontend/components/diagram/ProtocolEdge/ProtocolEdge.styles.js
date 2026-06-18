import styled, { keyframes } from 'styled-components';

const edgePulse = keyframes`
  0% {
    opacity: 0.18;
    stroke-width: 8px;
  }

  50% {
    opacity: 0.34;
    stroke-width: 12px;
  }

  100% {
    opacity: 0.18;
    stroke-width: 8px;
  }
`;

const chipPulse = keyframes`
  0% {
    box-shadow: none;
    transform: translate(-50%, -50%) scale(1.04);
  }

  50% {
    box-shadow: none;
    transform: translate(-50%, -50%) scale(1.06);
  }

  100% {
    box-shadow: none;
    transform: translate(-50%, -50%) scale(1.04);
  }
`;

export const SelectedGlowPath = styled.path`
  fill: none;
  stroke: rgba(255, 61, 0, 0.2);
  stroke-linecap: round;
  stroke-linejoin: round;
  pointer-events: none;
  animation: ${edgePulse} 1.9s ease-in-out infinite;
`;

export const ProtocolChip = styled.div`
  position: absolute;
  left: ${props => props.$left}px;
  top: ${props => props.$top}px;
  transform: translate(-50%, -50%) ${props => props.$selected ? 'scale(1.04)' : 'scale(1)'};
  pointer-events: none;
  padding: 8px 10px;
  border: 2px solid #000000;
  background: ${props => props.$selected ? '#fff6f2' : '#ffffff'};
  color: #000000;
  display: grid;
  gap: 4px;
  min-width: 156px;
  max-width: 220px;
  box-shadow: none;
  z-index: 30;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transition: transform 0.18s ease, opacity 0.18s ease, background 0.18s ease;
  animation: ${props => props.$selected ? chipPulse : 'none'} 1.9s ease-in-out infinite;
`;

export const RouteCaption = styled.div`
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0.03em;
  color: #666666;
  text-transform: uppercase;
  white-space: normal;
  word-break: break-word;
`;

export const FlowLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: 0.06em;
  color: #000000;
  text-transform: uppercase;
  white-space: normal;
  word-break: break-word;
`;
