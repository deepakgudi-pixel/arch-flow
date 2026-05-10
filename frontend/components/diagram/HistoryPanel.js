'use client';

import styled from 'styled-components';
import { History, Clock, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { buildVersionDiff } from '@/lib/diagramIntelligence';
import { CloseBtn } from './editorStyles';

const Panel = styled.div`
  width: 320px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PanelHeader = styled.div`
  padding: 24px;
  border-bottom: 3px solid #000000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const TitleCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h3`
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 14px;
  text-transform: uppercase;
`;

const VersionList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VersionCard = styled.div`
  padding: 16px;
  border: 3px solid #000000;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.1s;
  
  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #000000;
  }
  
  &:active {
    transform: translate(0, 0);
    box-shadow: none;
  }
`;

const VersionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const VersionPrompt = styled.div`
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const VersionDiff = styled.div`
  margin-top: 10px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: #666;
  text-transform: uppercase;
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
`;

const Footer = styled.div`
  padding: 16px;
  border-top: 3px solid #000000;
`;

const ClearButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #ff4444;
  color: #fff;
  border: 3px solid #000000;
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 11px;
  cursor: pointer;
  box-shadow: 4px 4px 0px #000000;
  transition: all 0.1s;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #000000;
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: none;
  }
`;

export default function HistoryPanel({ versions, currentNodes, currentEdges, onSelectVersion, onClearHistory, onClose }) {
  return (
    <Panel>
      <PanelHeader>
        <TitleCluster>
          <History size={18} />
          <Title>SYSTEM_HISTORY</Title>
        </TitleCluster>
        <CloseBtn type="button" onClick={onClose} aria-label="Close history">
          ×
        </CloseBtn>
      </PanelHeader>
      <VersionList>
        {versions.length === 0 ? (
          <EmptyState>NO_SNAPSHOTS_FOUND</EmptyState>
        ) : (
          versions.map((v) => (
            <VersionCard key={v.id} onClick={() => onSelectVersion(v)}>
              <VersionMeta>
                <Clock size={10} />
                {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
              </VersionMeta>
              <VersionPrompt>
                {v.prompt_text || 'GENERATE_REQUEST'}
              </VersionPrompt>
              {(() => {
                const diff = buildVersionDiff(currentNodes, currentEdges, v.nodes || [], v.edges || []);
                return (
                  <VersionDiff>
                    Δ NODES +{diff.addedNodes} / -{diff.removedNodes} · Δ EDGES +{diff.addedEdges} / -{diff.removedEdges}
                  </VersionDiff>
                );
              })()}
            </VersionCard>
          ))
        )}
      </VersionList>
      {versions.length > 0 && (
        <Footer>
          <ClearButton onClick={onClearHistory}>
            CLEAR_ALL_HISTORY
          </ClearButton>
        </Footer>
      )}
    </Panel>
  );
}
