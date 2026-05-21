'use client';

import { History, Clock, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { buildVersionDiff } from '@/lib/diagramIntelligence';
import { CloseBtn } from '../editorStyles';
import {
  Panel, PanelHeader, TitleCluster, Title, VersionList, VersionCard, VersionMeta,
  VersionPrompt, VersionDiff, EmptyState, Footer, ClearButton
} from './HistoryPanel.styles';

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
