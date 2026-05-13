'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hexagon, 
  ChevronDown, 
  History, 
  MousePointer2, 
  Activity, 
  Trash2, 
  Save, 
  Share2, 
  Download, 
  ArrowLeft,
  Search,
  LayoutGrid,
  Bot,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Cloud,
  Undo2,
  Redo2,
  Sparkles
} from 'lucide-react';
import {
  Header, HeaderLeft, Logo, LogoIcon, DiagramNameWrap, DiagramName,
  HeaderCenter, HeaderRight
} from './editorStyles';
import { ActionButton } from './editorStyles';

const CenterStack = styled(HeaderCenter)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 2;
`;

const StatusRail = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FocusChip = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const FocusLabel = styled.div`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const FocusValue = styled.div`
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  color: #000;
`;

const StatusChip = styled(motion.div)`
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

const SaveStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.$tone === 'error' ? '#dc2626' : '#999'};
  margin-top: -2px;
`;

const ActionRail = styled(HeaderRight)`
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
`;

const PrimaryGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
`;

const PrimaryAction = styled(ActionButton)`
  border: none;
  background: ${props => props.$active ? '#000000' : 'transparent'};
  color: ${props => props.$active ? '#ffffff' : '#444'};
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 700;

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
  background: #ffffff;
  padding: 8px 14px;
  font-weight: 700;
`;

const UtilityDropdownShell = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1000;
  min-width: 220px;
`;

const UtilityDropdown = styled.div`
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: none;
  overflow: hidden;
  padding: 6px;
`;

const UtilityItem = styled.div`
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
  background: ${props => props.$danger ? 'transparent' : 'transparent'};
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

const Divider = styled.div`
  height: 1px;
  background: rgba(0, 0, 0, 0.05);
  margin: 4px 0;
`;

const UtilityMeta = styled.span`
  color: #999;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
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
  simulateFlow, onToggleSimulateFlow,
  onOpenInvite,
  saveStatus = 'saved',
  canUndo, canRedo, onUndo, onRedo, onOptimize,
}) {
  const utilityItems = [
    {
      label: 'Optimize to 100',
      icon: <Sparkles />,
      onClick: onOptimize
    },
    { divider: true },
    {
      label: historyPanelOpen ? 'Hide history' : 'Open history',
      meta: historyPanelOpen ? 'Active' : null,
      icon: <History />,
      onClick: onToggleHistoryPanel
    },
    {
      label: simulateFlow ? 'Disable flow' : 'Enable flow',
      meta: simulateFlow ? 'Active' : null,
      icon: <Activity />,
      onClick: onToggleSimulateFlow
    },
    hasSelection
      ? {
          label: 'Delete selection',
          icon: <Trash2 />,
          onClick: onDeleteSelection,
          danger: true
        }
      : null,
    { divider: true },
    { label: 'Save changes', icon: <Save />, onClick: () => onSave(true) },
    { label: 'Invite collaborator', icon: <Share2 />, onClick: onOpenInvite },
    { label: 'Export image', icon: <Download />, onClick: onExportPNG },
    { label: 'Export JSON', icon: <Cloud />, onClick: onExportJSON },
    { divider: true },
    { label: 'Exit', icon: <ArrowLeft />, onClick: () => { window.location.href = '/dashboard'; } }
  ].filter(Boolean);

  return (
    <Header>
      <HeaderLeft>
        <Link href="/dashboard">
          <Logo>
            <LogoIcon>
              <Hexagon size={16} strokeWidth={3} fill="currentColor" />
            </LogoIcon>
            Archflow
          </Logo>
        </Link>
        <DiagramNameWrap>
          <DiagramName 
            value={diagramName} 
            onChange={onDiagramNameChange} 
            onBlur={onDiagramNameBlur}
            placeholder="Untitled Diagram"
          />
          <SaveStatus $tone={saveStatus === 'error' ? 'error' : 'default'}>
            {saveStatus === 'saving' ? <Loader2 size={10} /> : saveStatus === 'error' ? <AlertCircle size={10} /> : <CheckCircle2 size={10} />}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'error' ? 'Save failed' : 'Saved to cloud'}
          </SaveStatus>
        </DiagramNameWrap>
      </HeaderLeft>

      <CenterStack>
        <AnimatePresence mode="popLayout">
          {hasSelection && (
            <FocusChip
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              key="focus"
            >
              <MousePointer2 size={12} fill="currentColor" />
              <FocusLabel>{selectionKind || 'Selection'}</FocusLabel>
              <FocusValue>{selectionLabel}</FocusValue>
            </FocusChip>
          )}

          {simulateFlow && (
            <StatusChip
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key="flow"
            >
              <Activity size={12} />
              Live Flow
            </StatusChip>
          )}

          {reviewSuggestionCount > 0 && (
            <StatusChip 
              $tone="alert"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key="review"
            >
              <Bot size={12} />
              {reviewSuggestionCount} Review Pending
            </StatusChip>
          )}
        </AnimatePresence>
      </CenterStack>

      <ActionRail>
        <PrimaryGroup>
          <PrimaryAction onClick={onUndo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.35 }}>
            <Undo2 size={15} />
          </PrimaryAction>
          <PrimaryAction onClick={onRedo} disabled={!canRedo} style={{ opacity: canRedo ? 1 : 0.35 }}>
            <Redo2 size={15} />
          </PrimaryAction>
          <PrimaryAction $active={assistantPanelOpen} onClick={onToggleAssistantPanel}>
            <Bot size={16} />
            AI Assistant
          </PrimaryAction>
          <PrimaryAction $active={reviewPanelOpen} onClick={onToggleReviewPanel}>
            <Search size={16} />
            Review
            {reviewSuggestionCount > 0 && (
              <ReviewCount $active={reviewPanelOpen}>{reviewSuggestionCount}</ReviewCount>
            )}
          </PrimaryAction>
          <PrimaryAction $active={rightPanelOpen} onClick={onToggleRightPanel}>
            <LayoutGrid size={16} />
            Library
          </PrimaryAction>
        </PrimaryGroup>

        <UtilityWrapper>
          <UtilityTrigger onClick={onToggleExportMenu}>
            Actions
            <ChevronDown size={14} style={{ transform: showExportMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </UtilityTrigger>
          <AnimatePresence>
            {showExportMenu && (
              <UtilityDropdownShell
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <UtilityDropdown>
                  {utilityItems.map((item, idx) => item.divider ? (
                    <Divider key={`divider_${idx}`} style={{ margin: '4px 0' }} />
                  ) : (
                    <UtilityItem
                      key={item.label}
                      $danger={item.danger}
                      onClick={() => { onToggleExportMenu(); item.onClick(); }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
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
