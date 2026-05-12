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
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 15px;
  color: #000;
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
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-1px);
    border-color: rgba(0, 0, 0, 0.15);
    background: #fcfcfc;
    box-shadow: none;
  }
`;

const VersionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  color: #999;
  margin-bottom: 8px;
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
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  color: #bbb;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
`;

const Footer = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

const ClearButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #ffffff;
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fff5f5;
    border-color: #ef4444;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default function HistoryPanel({ versions, currentNodes, currentEdges, onSelectVersion, onClearHistory, onClose, loading }) {
  return (
    <Panel>
      <PanelHeader>
        <TitleCluster>
          <History size={18} />
          <Title>System History</Title>
        </TitleCluster>
        <CloseBtn type="button" onClick={onClose} aria-label="Close history">
          ×
        </CloseBtn>
      </PanelHeader>
      <VersionList>
        {loading && versions.length === 0 ? (
          <EmptyState>Loading snapshots...</EmptyState>
        ) : versions.length === 0 ? (
          <EmptyState>No snapshots yet — save your diagram to create one</EmptyState>
        ) : (
          versions.map((v) => (
            <VersionCard key={v.id} onClick={() => onSelectVersion(v)}>
              <VersionMeta>
                <Clock size={10} />
                {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
              </VersionMeta>
              <VersionPrompt>
                {v.prompt_text || 'Synthesized Architecture'}
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
            Clear All History
          </ClearButton>
        </Footer>
      )}
    </Panel>
  );
}
