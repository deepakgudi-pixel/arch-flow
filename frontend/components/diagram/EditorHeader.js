'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import styled from 'styled-components';
import {
  Header, HeaderLeft, Logo, LogoIcon, DiagramNameWrap, DiagramName,
  HeaderCenter, HeaderRight
} from './editorStyles';
import { ActionButton } from './editorStyles';

const CenterStack = styled(HeaderCenter)`
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
`;

const StatusRail = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
`;

const FocusChip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  max-width: min(100%, 440px);
  padding: 8px 12px;
  border: 2px solid #000000;
  background: #f6f6f6;
`;

const FocusLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  color: #6b7280;
  text-transform: uppercase;
  flex-shrink: 0;
`;

const FocusValue = styled.div`
  font-size: 12px;
  font-weight: 900;
  color: #000000;
  text-transform: uppercase;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 2px solid #000000;
  background: ${props => props.$tone === 'alert' ? '#fff4db' : '#ffffff'};
  color: #000000;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1;
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${props => props.$tone === 'alert' ? '#f59e0b' : '#000000'};
  flex-shrink: 0;
`;

const ActionRail = styled(HeaderRight)`
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const PrimaryGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border: 2px solid #000000;
  background: #f3f3f3;
  flex-wrap: wrap;
`;

const PrimaryAction = styled(ActionButton)`
  border-width: 2px;
  padding: 10px 14px;
  min-height: 40px;
  background: ${props => props.$active ? '#000000' : 'transparent'};
  color: ${props => props.$active ? '#ffffff' : '#000000'};

  &:hover {
    transform: none;
    background: ${props => props.$active ? '#000000' : '#ffffff'};
  }

  &:active {
    transform: none;
  }
`;

const ReviewCount = styled.span`
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

const UtilityWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
`;

const UtilityTrigger = styled(ActionButton)`
  border-width: 2px;
  padding: 10px 14px;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  transform: none !important;

  &:hover {
    transform: none;
    background: #f3f3f3;
  }

  &:active {
    transform: none;
  }
`;

const UtilityDropdownShell = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 1000;
  min-width: 250px;
`;

const UtilityDropdown = styled(motion.div)`
  background: #ffffff;
  border: 2px solid #000000;
  width: 100%;
  overflow: hidden;
`;

const UtilityItem = styled.div`
  padding: 12px 14px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  text-align: left;
  background: ${props => props.$danger ? '#fff7f7' : '#ffffff'};
  color: ${props => props.$danger ? '#b42318' : '#000000'};

  &:hover {
    background: ${props => props.$danger ? '#ffecec' : '#f3f4f6'};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #d1d5db;
`;

const FieldLabel = styled.span`
  font-size: 10px;
  font-weight: 900;
  color: #999;
`;

const UtilityMeta = styled.span`
  color: #6b7280;
  font-size: 10px;
`;

export default function EditorHeader({
  diagramName, onDiagramNameChange, onDiagramNameBlur,
  hasSelection, selectionKind, selectionLabel, onDeleteSelection,
  rightPanelOpen, onToggleRightPanel,
  assistantPanelOpen, onToggleAssistantPanel,
  reviewPanelOpen, onToggleReviewPanel,
  reviewSuggestionCount = 0,
  historyPanelOpen, onToggleHistoryPanel,
  showExportMenu, onToggleExportMenu,
  onSave, onExportPNG, onExportJSON,
  connectMode, onToggleConnectMode,
  simulateFlow, onToggleSimulateFlow,
  onOpenInvite,
}) {
  const utilityItems = [
    {
      label: historyPanelOpen ? 'Hide history' : 'Open history',
      meta: historyPanelOpen ? 'Active' : null,
      onClick: onToggleHistoryPanel
    },
    {
      label: connectMode ? 'Disable connect mode' : 'Enable connect mode',
      meta: connectMode ? 'Active' : null,
      onClick: onToggleConnectMode
    },
    {
      label: simulateFlow ? 'Disable live flow' : 'Enable live flow',
      meta: simulateFlow ? 'Active' : null,
      onClick: onToggleSimulateFlow
    },
    hasSelection
      ? {
          label: 'Remove selection',
          onClick: onDeleteSelection,
          danger: true
        }
      : null,
    { divider: true },
    { label: 'Save changes', onClick: () => onSave(true) },
    { label: 'Invite collaborator', onClick: onOpenInvite },
    { label: 'Export PNG', onClick: onExportPNG },
    { label: 'Export JSON', onClick: onExportJSON },
    { divider: true },
    { label: 'Return to dashboard', onClick: () => { window.location.href = '/dashboard'; } }
  ].filter(Boolean);

  return (
    <Header>
      <HeaderLeft>
        <Link href="/dashboard">
          <Logo>
            <LogoIcon>⬡</LogoIcon>
            Archflow
          </Logo>
        </Link>
        <DiagramNameWrap>
          <FieldLabel>DIAGRAM</FieldLabel>
          <DiagramName value={diagramName} onChange={onDiagramNameChange} onBlur={onDiagramNameBlur} />
        </DiagramNameWrap>
      </HeaderLeft>
      <CenterStack>
        <StatusRail>
          {hasSelection && (
            <FocusChip>
              <FocusLabel>{selectionKind || 'Selection'}</FocusLabel>
              <FocusValue>{selectionLabel}</FocusValue>
            </FocusChip>
          )}
          {connectMode && (
            <StatusChip>
              <StatusDot />
              Connect mode on
            </StatusChip>
          )}
          {simulateFlow && (
            <StatusChip>
              <StatusDot />
              Live flow on
            </StatusChip>
          )}
          {reviewSuggestionCount > 0 && (
            <StatusChip $tone="alert">
              <StatusDot $tone="alert" />
              {reviewSuggestionCount} staged in review
            </StatusChip>
          )}
        </StatusRail>
      </CenterStack>
      <ActionRail>
        <PrimaryGroup>
          <PrimaryAction $active={assistantPanelOpen} onClick={onToggleAssistantPanel}>
            Assistant
          </PrimaryAction>
          <PrimaryAction $active={reviewPanelOpen} onClick={onToggleReviewPanel}>
            Review
            {reviewSuggestionCount > 0 && (
              <ReviewCount $active={reviewPanelOpen}>{reviewSuggestionCount}</ReviewCount>
            )}
          </PrimaryAction>
          <PrimaryAction $active={rightPanelOpen} onClick={onToggleRightPanel}>
            Library
          </PrimaryAction>
        </PrimaryGroup>
        <UtilityWrapper>
          <UtilityTrigger onClick={onToggleExportMenu}>
            Actions {showExportMenu ? '↑' : '↓'}
          </UtilityTrigger>
          <AnimatePresence>
            {showExportMenu && (
              <UtilityDropdownShell>
                <UtilityDropdown
                  initial={{ opacity: 0, y: -10, scaleY: 0.96 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -8, scaleY: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: 'top right' }}
                >
                  {utilityItems.map((item, idx) => item.divider ? (
                    <Divider key={idx} />
                  ) : (
                    <UtilityItem
                      key={idx}
                      $danger={item.danger}
                      onClick={() => { item.onClick(); onToggleExportMenu(); }}
                    >
                      <span>{item.label}</span>
                      {item.meta ? <UtilityMeta>{item.meta}</UtilityMeta> : null}
                    </UtilityItem>
                  ))}
                </UtilityDropdown>
              </UtilityDropdownShell>
            )}
          </AnimatePresence>
        </UtilityWrapper>
      </ActionRail>
    </Header>
  );
}
