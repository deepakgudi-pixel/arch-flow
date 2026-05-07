'use client';

import Link from 'next/link';
import styled from 'styled-components';
import {
  Header, HeaderLeft, Logo, LogoIcon, DiagramNameWrap, DiagramName,
  HeaderCenter, HeaderRight
} from './editorStyles';
import { ActionButton } from './editorStyles';

const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
  background: #000;
  padding: 4px;
`;

const ActionGroupRight = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 16px;
`;

const ExportWrapper = styled.div`
  position: relative;
`;

const ExportDropdown = styled.div`
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background: #ffffff;
  border: 3px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  z-index: 1000;
  width: 200px;
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
  gap: 8px;
  &:hover {
    background: #f0f0f0;
  }
`;

const Divider = styled.div`
  height: 2px;
  background: #000;
`;

const IdLabel = styled.span`
  font-size: 10px;
  font-weight: 900;
  color: #999;
`;

export default function EditorHeader({
  diagramName, onDiagramNameChange, onDiagramNameBlur,
  selectedNode, onOpenSpecs, onDeleteNode,
  rightPanelOpen, onToggleRightPanel,
  showExportMenu, onToggleExportMenu,
  onSave, onSynthesizeProtocols, onExportPNG, onExportJSON,
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
          <IdLabel>ID:</IdLabel>
          <DiagramName value={diagramName} onChange={onDiagramNameChange} onBlur={onDiagramNameBlur} />
        </DiagramNameWrap>
      </HeaderLeft>
      <HeaderCenter>
        <ActionGroup>
          <ActionButton
            $active={connectMode}
            onClick={onToggleConnectMode}
            style={{ background: connectMode ? '#fff' : '#000', color: connectMode ? '#000' : '#fff', border: 'none', height: '32px' }}
          >
            CONNECT
          </ActionButton>
          <ActionButton
            $active={simulateFlow}
            onClick={onToggleSimulateFlow}
            style={{ background: simulateFlow ? '#fff' : '#000', color: simulateFlow ? '#000' : '#fff', border: 'none', height: '32px' }}
          >
            LIVE_FLOW
          </ActionButton>
          <ActionButton
            onClick={onSynthesizeProtocols}
            style={{ background: '#000', color: '#fff', border: 'none', height: '32px' }}
          >
            SYNTH_ALL
          </ActionButton>
        </ActionGroup>

        <ActionGroupRight>
          {selectedNode && (
            <>
              <ActionButton onClick={onOpenSpecs}>SPECS</ActionButton>
              <ActionButton onClick={onDeleteNode} style={{ borderColor: '#ff4444', color: '#ff4444' }}>DELETE</ActionButton>
            </>
          )}
          <ActionButton onClick={onToggleRightPanel}>
            {rightPanelOpen ? 'CLOSE_MODS' : 'VIEW_MODS'}
          </ActionButton>
        </ActionGroupRight>
      </HeaderCenter>
      <HeaderRight>
        <ExportWrapper>
          <ActionButton onClick={onToggleExportMenu}>
            SYSTEM_MENU {showExportMenu ? '↑' : '↓'}
          </ActionButton>
          {showExportMenu && (
            <ExportDropdown>
              {[
                { label: '💾 SAVE_CHANGES', onClick: () => onSave(true) },
                { label: '🤝 INVITE_COLLABORATOR', onClick: onOpenInvite },
                { label: '🪄 REPAIR_PROTOCOLS', onClick: onSynthesizeProtocols },
                { divider: true },
                { label: '🖼️ EXPORT_PNG', onClick: onExportPNG },
                { label: '📄 EXPORT_JSON', onClick: onExportJSON },
                { divider: true },
                { label: '🚪 EXIT_SESSION', onClick: () => window.location.href = '/dashboard' }
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
          )}
        </ExportWrapper>
      </HeaderRight>
    </Header>
  );
}
