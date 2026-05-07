import styled from 'styled-components';

const tones = {
  neutral: {
    background: '#E5E5E5',
    color: '#000000'
  },
  brand: {
    background: '#000000',
    color: '#FFFFFF'
  },
  accent: {
    background: '#000000',
    color: '#FFFFFF'
  },
  signal: {
    background: '#FF3D00',
    color: '#FFFFFF'
  },
  success: {
    background: '#00C853',
    color: '#FFFFFF'
  },
  warning: {
    background: '#FFAB00',
    color: '#000000'
  }
};

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 2px solid #000000;
  background: ${props => tones[props.$tone || 'neutral'].background};
  color: ${props => tones[props.$tone || 'neutral'].color};
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export default Badge;
