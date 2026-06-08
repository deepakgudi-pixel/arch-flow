import styled from 'styled-components';

export const ViewControlsShell = styled.div`
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 80;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 46px;
  padding: 6px;
  border: 2px solid #000000;
  background: #ffffff;
  border-radius: 8px;
`;

export const ViewButton = styled.button`
  height: 30px;
  min-width: 72px;
  border: 1px solid ${props => props.$active ? '#000000' : 'rgba(0, 0, 0, 0.08)'};
  background: ${props => props.$active ? '#000000' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#000000'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    border-color: #000000;
  }

  @media (max-width: 720px) {
    min-width: 36px;
    width: 36px;

    span {
      display: none;
    }
  }
`;
