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
  border: 2px solid #000000;
  border-radius: 8px;
  background: #ffffff;
  padding: 24px;
  display: grid;
  gap: 16px;
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
  font-size: 2.25rem;
  line-height: 1;
  font-weight: 900;
  color: #000000;
  text-transform: uppercase;

  @media (max-width: 560px) {
    font-size: 1.7rem;
  }
`;

export const EmptyText = styled.p`
  font-size: 0.98rem;
  line-height: 1.55;
  color: #333333;
`;

export const EmptyActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const EmptyPromptButton = styled.button`
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: #ffffff;
  color: #000000;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 800;
  transition: background 0.18s ease, border-color 0.18s ease;

  &:hover {
    border-color: #000000;
    background: #f7f7f7;
  }
`;

export const EmptySecondaryButton = styled(EmptyPromptButton)`
  background: #000000;
  border-color: #000000;
  color: #ffffff;

  &:hover {
    background: #1a1a1a;
  }
`;
