import styled from 'styled-components';
import { ActionButton, SearchInput } from './editorStyles';

export const GenerateSection = styled.div`
  margin-bottom: 32px;
`;

export const CustomTechInput = styled(SearchInput)`
  margin-bottom: 12px;
`;

export const AiBadge = styled.span`
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 800;
  background: rgba(0, 0, 0, 0.05);
  color: #666;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

export const DeleteBtn = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    color: #ef4444;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 32px 24px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.01);
`;

export const EmptyStateLabel = styled.div`
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  color: #999;
  margin-bottom: 16px;
`;

export const WideButton = styled(ActionButton)`
  width: 100%;
  justify-content: center;
  padding: 10px;
  font-size: 12px;
`;
