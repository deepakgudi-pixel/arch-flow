import styled from 'styled-components';

export const Overlay = styled.div`
  position: absolute;
  top: 24px;
  left: 24px;
  width: min(360px, calc(100vw - 48px));
  z-index: 90;
  background: #ffffff;
  border: 2px solid #000000;
  border-radius: 8px;
  box-shadow: none;
  padding: 16px;
  display: grid;
  gap: 14px;
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const TitleStack = styled.div`
  display: grid;
  gap: 4px;
`;

export const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  color: #666666;
`;

export const Title = styled.h2`
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 900;
  color: #000000;
`;

export const CloseButton = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
`;

export const StepList = styled.div`
  display: grid;
  gap: 10px;
`;

export const Step = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 10px;
  align-items: start;
`;

export const StepNumber = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #000000;
  color: #ffffff;
  display: grid;
  place-items: center;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
`;

export const StepBody = styled.div`
  display: grid;
  gap: 3px;
`;

export const StepTitle = styled.div`
  font-size: 12px;
  font-weight: 800;
  color: #000000;
`;

export const StepText = styled.p`
  font-size: 11px;
  line-height: 1.5;
  color: #555555;
`;

export const ActionRow = styled.div`
  display: flex;
  gap: 8px;
`;

export const ActionButton = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid ${props => props.$primary ? '#000000' : 'rgba(0, 0, 0, 0.12)'};
  background: ${props => props.$primary ? '#000000' : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : '#000000'};
  border-radius: 8px;
  padding: 9px 10px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
`;
