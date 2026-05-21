import styled from 'styled-components';

export const Panel = styled.div`
  width: 320px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const PanelHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const TitleCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Title = styled.h3`
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 15px;
  color: #000;
`;

export const VersionList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const VersionCard = styled.div`
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-1px);
    border-color: rgba(0, 0, 0, 0.15);
    background: #fcfcfc;
    box-shadow: none;
  }
`;

export const VersionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  color: #999;
  margin-bottom: 8px;
`;

export const VersionPrompt = styled.div`
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const VersionDiff = styled.div`
  margin-top: 10px;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  color: #bbb;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

export const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
`;

export const Footer = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

export const ClearButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #ffffff;
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fff5f5;
    border-color: #ef4444;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
