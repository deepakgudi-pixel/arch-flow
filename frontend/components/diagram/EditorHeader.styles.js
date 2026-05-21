import styled from 'styled-components';
import { motion } from 'framer-motion';
import { HeaderCenter, HeaderRight, ActionButton } from './editorStyles';

export const CenterStack = styled(HeaderCenter)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 2;
`;

export const FocusChip = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

export const FocusLabel = styled.div`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

export const FocusValue = styled.div`
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  color: #000;
`;

export const StatusChip = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: ${props => props.$tone === 'alert' ? '#FFFBEB' : '#F0F9FF'};
  color: ${props => props.$tone === 'alert' ? '#B45309' : '#0369A1'};
  border: 1px solid ${props => props.$tone === 'alert' ? 'rgba(180, 83, 9, 0.1)' : 'rgba(3, 105, 161, 0.1)'};
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 700;
`;

export const SaveStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.$tone === 'error' ? '#dc2626' : '#999'};
  margin-top: -2px;
`;

export const ActionRail = styled(HeaderRight)`
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
`;

export const PrimaryGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
`;

export const PrimaryAction = styled(ActionButton)`
  border: none;
  background: ${props => props.$active ? '#000000' : 'transparent'};
  color: ${props => props.$active ? '#ffffff' : '#444'};
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 700;
  opacity: ${props => props.$muted ? 0.35 : 1};

  &:hover:not(:disabled) {
    background: ${props => props.$active ? '#000000' : 'rgba(0, 0, 0, 0.05)'};
    color: ${props => props.$active ? '#ffffff' : '#000'};
    transform: none;
    box-shadow: none;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export const ReviewCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${props => props.$active ? '#ffffff' : '#000000'};
  color: ${props => props.$active ? '#000000' : '#ffffff'};
  font-size: 10px;
  line-height: 1;
`;

export const UtilityWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
`;

export const UtilityTrigger = styled(ActionButton)`
  background: #ffffff;
  padding: 8px 14px;
  font-weight: 700;

  svg {
    transform: ${props => props.$open ? 'rotate(180deg)' : 'none'};
    transition: transform 0.2s;
  }
`;

export const UtilityDropdownShell = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1000;
  min-width: 220px;
`;

export const UtilityDropdown = styled.div`
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: none;
  overflow: hidden;
  padding: 6px;
`;

export const UtilityItem = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: transparent;
  color: ${props => props.$danger ? '#DC2626' : '#444'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$danger ? '#FEF2F2' : '#F9F9F9'};
    color: ${props => props.$danger ? '#B91C1C' : '#000'};
  }

  svg {
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }
`;

export const UtilityItemLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const Divider = styled.div`
  height: 1px;
  background: rgba(0, 0, 0, 0.05);
  margin: 4px 0;
`;

export const UtilityMeta = styled.span`
  color: #999;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;
