import styled from 'styled-components';
import { ActionButton, SearchInput } from '../editorStyles';

export const PanelHint = styled.div`
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  margin-bottom: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.02);
`;

export const PanelHintTitle = styled.div`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 800;
  color: #000000;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const PanelHintBody = styled.div`
  font-family: var(--font-sans);
  font-size: 12px;
  line-height: 1.5;
  color: #555555;
`;

export const ResponsibilityBuilder = styled.div`
  display: grid;
  gap: 14px;
  padding: 14px 0 22px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  margin-bottom: 22px;
`;

export const ResponsibilityField = styled.div`
  display: grid;
  gap: 7px;
`;

export const ResponsibilityLabel = styled.label`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  color: #555555;
`;

export const ResponsibilityInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  background: #ffffff;
  color: #111111;
  font-family: var(--font-sans);
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: #111111;
  }

  &::placeholder {
    color: #999999;
  }
`;

export const SelectedTechnology = styled.div`
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border: 1px ${props => props.$empty ? 'dashed' : 'solid'} rgba(0, 0, 0, ${props => props.$empty ? '0.14' : '0.28'});
  border-radius: 8px;
  background: ${props => props.$empty ? 'rgba(0, 0, 0, 0.015)' : '#ffffff'};
`;

export const SelectedTechnologyLabel = styled.div`
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 700;
  color: #999999;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const SelectedTechnologyName = styled.div`
  margin-top: 3px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  color: #111111;
`;

export const SelectedTechnologyClear = styled.button`
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  background: #ffffff;
  color: #555555;
  cursor: pointer;

  &:hover {
    border-color: #111111;
    color: #111111;
  }
`;

export const ResponsibilityBuilderActions = styled.div`
  display: flex;
`;

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

export const InventoryCard = styled.div`
  display: grid;
  gap: 10px;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid ${props => props.$selected ? '#111111' : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 10px;
  cursor: grab;
  margin-bottom: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: #fafafa;
    border-color: rgba(0, 0, 0, 0.14);
    transform: translateX(4px);
  }
`;

export const InventoryCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const InventoryCardTitle = styled.div`
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  color: #000000;
  line-height: 1.3;
`;

export const InventoryCardMeta = styled.div`
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  color: #999999;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const InventoryCardDescription = styled.div`
  font-family: var(--font-sans);
  font-size: 12px;
  line-height: 1.45;
  color: #555555;
`;

export const InventoryCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const InventoryCardHint = styled.div`
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const UseTechnologyButton = styled.button`
  border: 1px solid #111111;
  border-radius: 6px;
  padding: 5px 8px;
  background: #111111;
  color: #ffffff;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.18s ease, color 0.18s ease;

  &:hover {
    background: #ffffff;
    color: #111111;
  }

  &:focus-visible {
    outline: 2px solid #111111;
    outline-offset: 2px;
  }
`;

export const SelectTechnologyButton = styled.button`
  min-width: 54px;
  min-height: 26px;
  display: inline-grid;
  place-items: center;
  border: 1px solid ${props => props.$selected ? '#111111' : 'rgba(0, 0, 0, 0.14)'};
  border-radius: 6px;
  padding: 5px 8px;
  background: ${props => props.$selected ? '#111111' : '#ffffff'};
  color: ${props => props.$selected ? '#ffffff' : '#111111'};
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: #111111;
  }

  &:focus-visible {
    outline: 2px solid #111111;
    outline-offset: 2px;
  }
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
