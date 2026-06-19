import styled from 'styled-components';

export const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

export const NodeLabel = styled.div`
  font-family: var(--font-sans);
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 12px;
  color: #000;
  overflow-wrap: break-word;
  word-break: normal;
  letter-spacing: -0.02em;
  
  ${props => props.$isLong && `
    font-size: 1.4rem;
  `}
`;

export const NodeRoleLabel = styled.div`
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 14px;
  opacity: 0.8;
`;

export const NodeTechLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 8px 12px;
  margin-bottom: 28px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.02);
  font-family: var(--font-sans);
  font-size: 12px;
  color: #444444;
`;

export const NodeTechKey = styled.span`
  font-weight: 700;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 10px;
`;

export const NodeTechValue = styled.span`
  font-weight: 700;
  color: #000000;
`;

export const InsightList = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
`;

export const InsightItem = styled.div`
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  background: #f9f9f9;
  font-size: 12px;
  line-height: 1.6;
  color: #444;
`;

export const ReplaceStack = styled.div`
  display: grid;
  gap: 12px;
`;

export const ReplaceHint = styled.div`
  padding: 12px 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.02);
  font-size: 12px;
  line-height: 1.5;
  color: #555555;
`;

export const ReplaceCard = styled.div`
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: #ffffff;
  display: grid;
  gap: 12px;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(0, 0, 0, 0.15);
    box-shadow: none;
  }
`;

export const ReplaceTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const ReplaceName = styled.div`
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 0.95rem;
  color: #000000;
`;

export const ReplaceMeta = styled.div`
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

export const ReplaceDescription = styled.div`
  font-size: 12px;
  line-height: 1.5;
  color: #444;
`;

export const ConnectionStack = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
`;

export const ConnectionCard = styled.div`
  padding: 14px 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: #ffffff;
  display: grid;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(0, 0, 0, 0.15);
    background: #fcfcfc;
    box-shadow: none;
  }
`;

export const ConnectionRoute = styled.div`
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  line-height: 1.4;
  letter-spacing: 0.02em;
`;

export const ConnectionLabel = styled.div`
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 0.95rem;
  color: #000000;
  line-height: 1.35;
`;

export const ConnectionMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const EmptyHint = styled.div`
  padding: 20px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  color: #999;
  text-align: center;
  background: rgba(0, 0, 0, 0.01);
`;
