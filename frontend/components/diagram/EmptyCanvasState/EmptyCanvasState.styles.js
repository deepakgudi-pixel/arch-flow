import styled from 'styled-components';

export const EmptyShell = styled.div`
  position: absolute;
  inset: 0;
  z-index: 35;
  display: grid;
  place-items: center;
  pointer-events: none;
  padding: 24px;
`;

export const EmptyPanel = styled.div`
  width: min(560px, calc(100vw - 48px));
  border: 3px solid #000000;
  border-radius: 8px;
  background: #ffffff;
  padding: 24px;
  display: grid;
  gap: 18px;
  pointer-events: auto;
`;

export const EmptyEyebrow = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  color: #666666;
  text-transform: uppercase;
`;

export const EmptyTitle = styled.h2`
  font-size: clamp(1.8rem, 4vw, 2.7rem);
  line-height: 0.98;
  font-weight: 900;
  color: #000000;
  text-transform: uppercase;
`;

export const EmptyText = styled.p`
  font-size: 0.98rem;
  line-height: 1.55;
  color: #333333;
`;
