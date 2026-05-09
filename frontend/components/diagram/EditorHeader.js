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
  gap: 10px;
`;

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
  background: #000;
  padding: 4px;
  flex-wrap: wrap;
`;

const SecondaryGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ContextCard = styled.div`
  min-width: 220px;
  max-width: 420px;
  padding: 10px 14px;
  border: 2px solid #000000;
  background: #f8f8f8;
  display: grid;
  gap: 4px;
`;

const ContextLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  color: #666666;
  text-transform: uppercase;
`;

const ContextValue = styled.div`
  font-size: 12px;
  font-weight: 900;
  color: #000000;
  text-transform: uppercase;
  line-height: 1.35;
  word-break: break-word;
`;

const ExportWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 220px;
`;

const ExportTrigger = styled(ActionButton)`
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  z-index: 1001;
  background: #ffffff;
  transform: none !important;
  text-align: center;

  ${props => props.$open && `
    border-bottom: none;
  `}

  &:hover {
    transform: none;
    background: #f3f3f3;
  }

  &:active {
    transform: none;
  }
`;

const ExportDropdownShell = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 100%;
  overflow: visible;
`;

const ExportDropdown = styled(motion.div)`
  background: #ffffff;
  border: 3px solid #000000;
  border-top: none;
  width: 100%;
  overflow: hidden;
`;

const ExportItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  &:hover {
    background: #f0f0f0;
  }
`;

const Divider = styled.div`
  height: 2px;
  background: #000;
`;

const FieldLabel = styled.span`
  font-size: 10px;
  font-weight: 900;
  color: #999;
`;

export default function EditorHeader({
  diagramName, onDiagramNameChange, onDiagramNameBlur,
  hasSelection, detailsOpen, selectionKind, selectionLabel, onOpenSpecs, onDeleteSelection,
  rightPanelOpen, onToggleRightPanel,
  reviewPanelOpen, onToggleReviewPanel,
  historyPanelOpen, onToggleHistoryPanel,
  showExportMenu, onToggleExportMenu,
  onSave, onExportPNG, onExportJSON,
  connectMode, onToggleConnectMode,
  simulateFlow, onToggleSimulateFlow,
  onOpenInvite,
}) {
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
        <ToolbarRow>
          {hasSelection && (
            <ContextCard>
              <ContextLabel>{selectionKind || 'Selection'}</ContextLabel>
              <ContextValue>{selectionLabel}</ContextValue>
            </ContextCard>
          )}

          <ActionGroup>
            <ActionButton
              $active={connectMode}
              onClick={onToggleConnectMode}
              style={{ background: connectMode ? '#fff' : '#000', color: connectMode ? '#000' : '#fff', border: 'none', height: '32px' }}
            >
              CONNECT_MODE
            </ActionButton>
            <ActionButton
              $active={simulateFlow}
              onClick={onToggleSimulateFlow}
              style={{ background: simulateFlow ? '#fff' : '#000', color: simulateFlow ? '#000' : '#fff', border: 'none', height: '32px' }}
            >
              LIVE_FLOW
            </ActionButton>
          </ActionGroup>
        </ToolbarRow>

        <SecondaryGroup>
          {hasSelection && (
            <>
              <ActionButton $active={detailsOpen} onClick={onOpenSpecs}>DETAILS</ActionButton>
              <ActionButton onClick={onDeleteSelection} style={{ borderColor: '#ff4444', color: '#ff4444' }}>REMOVE</ActionButton>
            </>
          )}
          <ActionButton $active={rightPanelOpen} onClick={onToggleRightPanel}>
            TECH_LIBRARY
          </ActionButton>
          <ActionButton $active={reviewPanelOpen} onClick={onToggleReviewPanel}>
            ARCH_REVIEW
          </ActionButton>
          <ActionButton $active={historyPanelOpen} onClick={onToggleHistoryPanel}>
            HISTORY
          </ActionButton>
        </SecondaryGroup>
      </CenterStack>
      <HeaderRight>
        <ExportWrapper>
          <ExportTrigger onClick={onToggleExportMenu} $open={showExportMenu}>
            MORE_ACTIONS {showExportMenu ? '↑' : '↓'}
          </ExportTrigger>
          <AnimatePresence>
            {showExportMenu && (
              <ExportDropdownShell>
                <ExportDropdown
                  initial={{ opacity: 0, y: -10, scaleY: 0.96 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -8, scaleY: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: 'top center' }}
                >
                  {[
                    { label: '💾 SAVE_CHANGES', onClick: () => onSave(true) },
                    { label: '🤝 INVITE_COLLABORATOR', onClick: onOpenInvite },
                    { label: '🖼️ EXPORT_PNG', onClick: onExportPNG },
                    { label: '📄 EXPORT_JSON', onClick: onExportJSON },
                    { divider: true },
                    { label: '🚪 RETURN_TO_DASHBOARD', onClick: () => window.location.href = '/dashboard' }
                  ].map((item, idx) => item.divider ? (
                    <Divider key={idx} />
                  ) : (
                    <ExportItem
                      key={idx}
                      onClick={() => { item.onClick(); onToggleExportMenu(); }}
                    >
                      {item.label}
                    </ExportItem>
                  ))}
                </ExportDropdown>
              </ExportDropdownShell>
            )}
          </AnimatePresence>
        </ExportWrapper>
      </HeaderRight>
    </Header>
  );
}
