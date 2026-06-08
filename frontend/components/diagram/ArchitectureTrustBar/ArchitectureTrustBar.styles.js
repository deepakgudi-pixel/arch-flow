import styled from 'styled-components';

export const TrustBarShell = styled.div`
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 78;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  width: max-content;
  max-width: calc(100% - 36px);
  min-height: 46px;
  padding: 6px;
  border: 2px solid #000000;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;

  @media (max-width: 1100px) {
    left: 18px;
    right: 18px;
    transform: none;
    width: auto;
    max-width: none;
    justify-content: flex-start;
  }

  @media (max-width: 720px) {
    top: 12px;
    left: 12px;
    right: 12px;
    gap: 6px;
    padding: 6px;
  }
`;

export const TrustChip = styled.div`
  height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  padding: 0 10px;
  border: 1px solid ${props => props.$tone === 'strong' ? '#000000' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 6px;
  background: ${props =>
    props.$tone === 'success' ? '#ecfdf5' :
    props.$tone === 'warning' ? '#fff7ed' :
    props.$tone === 'strong' ? '#000000' :
    '#ffffff'};
  color: ${props => props.$tone === 'strong' ? '#ffffff' : '#000000'};
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: ${props => props.as === 'button' ? 'pointer' : 'default'};
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;

  &[type='button'] {
    appearance: none;
  }

  @media (max-width: 720px) {
    height: 28px;
    gap: 5px;
    padding: 0 8px;
    font-size: 9px;
    max-width: 140px;
  }
`;

export const TrustAction = styled.button`
  height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  padding: 0 12px;
  border: 1px solid #000000;
  border-radius: 6px;
  background: #000000;
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;

  @media (max-width: 720px) {
    height: 28px;
    gap: 5px;
    padding: 0 9px;
    font-size: 9px;
  }
`;
