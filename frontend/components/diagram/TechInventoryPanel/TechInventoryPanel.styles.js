import styled from 'styled-components';
import { ActionButton, SearchInput } from '../editorStyles';

export const PanelHint = styled.div`
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  margin-bottom: 10px;
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
  gap: 10px;
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: #ffffff;
`;

export const ResponsibilityBuilderTitle = styled.div`
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 800;
  color: #111111;
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
  min-height: 44px;
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
  padding: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
`;

export const CustomTechInput = styled(SearchInput)`
  margin-bottom: 12px;
`;

export const InventoryCard = styled.div`
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #ffffff;
  border: 1px solid ${props => props.$selected ? '#111111' : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 7px;
  cursor: grab;
  margin-bottom: 7px;
  transition: all 0.2s ease;

  &:hover {
    background: #fafafa;
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

export const DragHandle = styled.div`
  display: grid;
  place-items: center;
  color: #b1b1b1;
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
  font-family: var(--font-mono);
  font-size: 8px;
  font-weight: 700;
  color: #999999;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const InventoryCardDescription = styled.div`
  margin-top: 3px;
  font-family: var(--font-sans);
  font-size: 11px;
  line-height: 1.35;
  color: #555555;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const InventoryCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
`;

export const InventoryCardHint = styled.div`
  margin-top: 4px;
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 700;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const UseTechnologyButton = styled.button`
  border: 1px solid #111111;
  border-radius: 6px;
  min-width: 48px;
  padding: 6px 8px;
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
  min-width: 48px;
  min-height: 28px;
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

export const SearchSection = styled.div`
  position: sticky;
  top: -24px;
  z-index: 4;
  padding: 8px 0 4px;
  background: #ffffff;

  input {
    margin-bottom: 0;
  }
`;

export const CatalogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 2px 8px;
`;

export const CatalogCount = styled.div`
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 800;
  color: #8a8a8a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const CategoryStack = styled.div`
  display: grid;
  gap: 8px;
`;

export const CategoryHeading = styled.section`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
`;

export const CategoryButton = styled.button`
  width: 100%;
  min-height: 42px;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 0;
  background: #ffffff;
  color: #111111;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 800;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #fafafa;
  }

  &:focus-visible {
    outline: 2px solid #111111;
    outline-offset: -2px;
  }

  svg:last-child {
    transform: rotate(${props => props.$expanded ? '180deg' : '0deg'});
    transition: transform 180ms ease;
  }
`;

export const CategoryCount = styled.span`
  min-width: 22px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
  font-family: var(--font-mono);
  font-size: 9px;
  text-align: center;
`;

export const CategoryBody = styled.div`
  max-height: ${props => props.$expanded ? '2400px' : '0'};
  opacity: ${props => props.$expanded ? 1 : 0};
  overflow: hidden;
  visibility: ${props => props.$expanded ? 'visible' : 'hidden'};
  transition: max-height 260ms ease, opacity 180ms ease, visibility 0s ${props => props.$expanded ? '0s' : '260ms'};

  > div {
    padding: ${props => props.$expanded ? '4px 8px 8px' : '0 8px'};
    transition: padding 220ms ease;
  }
`;

export const CollapsibleSection = styled.div`
  margin-top: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
`;

export const CollapsibleSectionButton = styled.button`
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 0;
  background: #ffffff;
  color: #444444;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #fafafa;
    color: #111111;
  }

  svg:last-child {
    margin-left: auto;
    transform: rotate(${props => props.$expanded ? '180deg' : '0deg'});
    transition: transform 180ms ease;
  }
`;
