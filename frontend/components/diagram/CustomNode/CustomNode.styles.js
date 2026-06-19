import styled from 'styled-components';
import { categoryColors } from '@/lib/theme';

export const NodeWrapper = styled.div`
  padding: 0;
  background: #ffffff;
  border: 3px solid #000000;
  width: 240px;
  min-width: 240px;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  transition: all 0.1s;
  overflow: hidden;
  opacity: ${props => props.$dimmed ? 0.32 : 1};
  filter: ${props => props.$dimmed ? 'grayscale(0.16)' : 'none'};
  box-shadow: none;
  ${props => props.$highlighted && `
    border-color: #ff3d00;
    box-shadow: 0 0 0 4px rgba(255, 61, 0, 0.14);
  `}
  ${props => props.$selected && `
    transform: translate(-2px, -2px);
    border-width: 4px;
    border-color: #ff3d00;
  `}
`;

export const NodeTopBar = styled.div`
  height: 24px;
  background: ${props => categoryColors[props.$category] || '#000000'};
  border-bottom: 3px solid #000000;
  display: flex;
  align-items: center;
  padding: 0 10px;
`;

export const NodeCategoryLabel = styled.span`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  color: #ffffff;
  letter-spacing: 0.05em;
`;

export const NodeBody = styled.div`
  padding: 12px 14px;
  display: flex;
  flex: 1;
`;

export const NodeContent = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
`;

export const NodeText = styled.div`
  flex: 1;
  min-width: 0;
`;

export const NodeName = styled.div`
  font-weight: 900;
  color: #000000;
  font-size: 14px;
  text-transform: uppercase;
  line-height: 1.2;
  word-break: keep-all;
  overflow-wrap: break-word;
  letter-spacing: -0.02em;
`;

export const NodeMeta = styled.div`
  margin-top: 6px;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  color: #6b6b6b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.35;
`;

export const IconContainer = styled.div`
  padding: 6px;
  border: 2px solid #000;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
