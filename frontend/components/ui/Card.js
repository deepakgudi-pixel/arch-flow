import styled from 'styled-components';

export const Card = styled.div`
  position: relative;
  background: #FFFFFF;
  border: 3px solid #000000;
  border-radius: 0;
  box-shadow: none;
  padding: ${props => props.$padding || '32px'};
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  ${props => props.$interactive ? `
    cursor: pointer;

    &:hover {
      transform: translate(-4px, -4px);
      box-shadow: none;
      background: #FAFAFA;
    }

    &:active {
      transform: translate(0, 0);
      box-shadow: none;
    }
  ` : ''}
`;

export const CardGlow = styled.div`
  display: none;
`;

export const CardHeader = styled.div`
  position: relative;
  display: grid;
  gap: 12px;
  margin-bottom: ${props => props.$compact ? '16px' : '24px'};
`;

export const CardEyebrow = styled.span`
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-ink-soft);
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    background: var(--color-ink);
  }
`;

export const CardTitle = styled.h3`
  font-size: ${props => props.$size || '1.5rem'};
  font-weight: 800;
  color: var(--color-ink);
  letter-spacing: -0.04em;
  text-transform: uppercase;
`;

export const CardText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-ink-muted);
`;

export const CardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--color-ink-soft);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 700;
`;

export default Card;
