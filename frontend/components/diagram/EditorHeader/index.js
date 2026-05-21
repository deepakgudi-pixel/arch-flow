'use client';

import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
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
  Header, HeaderLeft, Logo, LogoIcon, DiagramNameWrap, DiagramName
} from '../editorStyles';
import {
  CenterStack, FocusChip, FocusLabel, FocusValue, StatusChip, SaveStatus, ActionRail,
  PrimaryGroup, PrimaryAction, ReviewCount, UtilityWrapper, UtilityTrigger, UtilityDropdownShell,
  UtilityDropdown, UtilityItem, UtilityItemLabel, Divider, UtilityMeta
} from './EditorHeader.styles';

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
          <PrimaryAction onClick={onUndo} disabled={!canUndo} $muted={!canUndo}>
            <Undo2 size={15} />
          </PrimaryAction>
          <PrimaryAction onClick={onRedo} disabled={!canRedo} $muted={!canRedo}>
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
          <UtilityTrigger onClick={onToggleExportMenu} $open={showExportMenu}>
            Actions
            <ChevronDown size={14} />
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
                    <Divider key={`divider_${idx}`} />
                  ) : (
                    <UtilityItem
                      key={item.label}
                      $danger={item.danger}
                      onClick={() => { onToggleExportMenu(); item.onClick(); }}
                    >
                      <UtilityItemLabel>
                        {item.icon}
                        <span>{item.label}</span>
                      </UtilityItemLabel>
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
