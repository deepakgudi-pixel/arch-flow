import styled from 'styled-components';

const tones = {
  success: {
    background: 'rgba(220, 252, 231, 0.94)',
    color: 'var(--color-success)',
    border: 'rgba(21, 128, 61, 0.2)'
  },
  error: {
    background: 'rgba(254, 226, 226, 0.96)',
    color: 'var(--color-error)',
    border: 'rgba(185, 28, 28, 0.18)'
  },
  warning: {
    background: 'rgba(254, 243, 199, 0.96)',
    color: 'var(--color-warning)',
    border: 'rgba(180, 83, 9, 0.18)'
  },
  info: {
    background: 'rgba(219, 234, 254, 0.96)',
    color: 'var(--color-accent)',
    border: 'rgba(37, 99, 235, 0.18)'
  }
};

export const Toast = styled.div`
  position: fixed;
  top: 22px;
  right: 22px;
  max-width: 360px;
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  border: 1px solid ${props => tones[props.$tone || 'success'].border};
  box-shadow: var(--shadow-md);
  background: ${props => tones[props.$tone || 'success'].background};
  color: ${props => tones[props.$tone || 'success'].color};
  z-index: 1500;
  font-weight: 700;
`;

export default Toast;
