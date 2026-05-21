'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import EditorHeader from '@/components/diagram/EditorHeader';
import DiagramAssistantPanel from '@/components/diagram/DiagramAssistantPanel';
import ReviewPanel from '@/components/diagram/ReviewPanel';
import HistoryPanel from '@/components/diagram/HistoryPanel';
import TechInventoryPanel from '@/components/diagram/TechInventoryPanel';
import PromptBar from '@/components/diagram/PromptBar';
import {
  Container,
  MainArea,
  CanvasWrapper,
  EmptyCanvas,
  EmptyIcon,
  EmptyText,
} from '@/components/diagram/editorStyles';

const PanelHost = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  border-left: 4px solid #000000;
  background: #ffffff;
`;

const CanvasNote = styled.div`
  position: absolute;
  top: 24px;
  left: 24px;
  padding: 12px 14px;
  border: 2px solid #000000;
  background: #ffffff;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
`;

function buildMockVersion(id, promptText, createdAt, nodes, edges) {
  return { id, prompt_text: promptText, created_at: createdAt, nodes, edges };
}

export default function EditorSmokeProbePage() {
  const [hydrated, setHydrated] = useState(false);
  const [diagramName, setDiagramName] = useState('Smoke Probe Diagram');
  const [assistantPanelOpen, setAssistantPanelOpen] = useState(false);
  const [reviewPanelOpen, setReviewPanelOpen] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [libraryPanelOpen, setLibraryPanelOpen] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantMessages, setAssistantMessages] = useState([
    {
      id: 'm1',
      role: 'assistant',
      content: 'I staged Redis and S3 in Architectural Review so you can inspect them safely before adding them.',
      suggestionsCount: 2,
    },
  ]);
  const [reviewSuggestions, setReviewSuggestions] = useState([
    {
      id: 's1',
      name: 'Redis Cache',
      category: 'queue',
      reason: 'Adds a fast shared cache for read-heavy traffic.',
      role: 'Absorbs bursty reads and session lookups for the backend tier.',
      connections: [
        { source: '__NEW__', target: 'api', label: 'REDIS', reason: 'Supports backend cache reads and writes.' },
      ],
    },
    {
      id: 's2',
      name: 'Object Storage',
      category: 'storage',
      reason: 'Provides durable media storage for uploaded assets.',
      role: 'Stores files outside the application and database path.',
      connections: [
        { source: 'api', target: '__NEW__', label: 'S3', reason: 'Backend issues signed upload and fetch requests.' },
      ],
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customTechPrompt, setCustomTechPrompt] = useState('');

  const nodes = useMemo(
    () => [
      { id: 'web', name: 'Web App', category: 'frontend' },
      { id: 'api', name: 'API', category: 'backend' },
      { id: 'db', name: 'Postgres', category: 'database' },
    ],
    [],
  );
  const edges = useMemo(
    () => [
      { id: 'e1', source: 'web', target: 'api', label: 'REST' },
      { id: 'e2', source: 'api', target: 'db', label: 'SQL' },
    ],
    [],
  );
  const findings = useMemo(
    () => [
      {
        id: 'f1',
        severity: 'warning',
        title: 'Missing object storage',
        detail: 'Uploads and generated assets should live outside the main database path.',
      },
    ],
    [],
  );
  const versions = useMemo(
    () => [
      buildMockVersion('v1', 'AI_SYNTHESIS: blog platform', new Date().toISOString(), nodes, edges),
      buildMockVersion('v2', 'Added cache layer', new Date(Date.now() - 1000 * 60 * 30).toISOString(), nodes, edges),
    ],
    [nodes, edges],
  );

  const inventory = useMemo(
    () => ({
      builtIn: {
        backend: [{ name: 'Node.js' }],
        database: [{ name: 'PostgreSQL' }],
        auth: [{ name: 'Clerk' }],
      },
      community: [{ id: 'c1', name: 'Redis', category: 'queue', isOwner: true }],
      custom: [],
    }),
    [],
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  const closeUtilityPanels = () => {
    setAssistantPanelOpen(false);
    setReviewPanelOpen(false);
    setHistoryPanelOpen(false);
    setShowActions(false);
  };

  const activeUtilityPanel = assistantPanelOpen
    ? (
        <DiagramAssistantPanel
          messages={assistantMessages}
          prompt={assistantPrompt}
          onPromptChange={setAssistantPrompt}
          onSend={message => {
            setAssistantMessages(current => [
              ...current,
              { id: `m_${current.length + 1}`, role: 'user', content: message, suggestionsCount: 0 },
            ]);
            setAssistantPrompt('');
          }}
          loading={false}
          pendingSuggestionCount={reviewSuggestions.length}
          onClose={() => setAssistantPanelOpen(false)}
        />
      )
    : reviewPanelOpen
      ? (
          <ReviewPanel
            findings={findings}
            suggestions={reviewSuggestions}
            nodes={nodes}
            edges={edges}
            connectionMode="guided"
            nodeCount={nodes.length}
            edgeCount={edges.length}
            onFocusFinding={() => {}}
            onAcceptSuggestion={suggestion => {
              setReviewSuggestions(current => current.filter(item => item.id !== suggestion.id));
            }}
            onDeclineSuggestion={suggestion => {
              setReviewSuggestions(current => current.filter(item => item.id !== suggestion.id));
            }}
            onClose={() => setReviewPanelOpen(false)}
          />
        )
      : historyPanelOpen
        ? (
            <HistoryPanel
              versions={versions}
              currentNodes={nodes}
              currentEdges={edges}
              onSelectVersion={() => {}}
              onClearHistory={() => {}}
              onClose={() => setHistoryPanelOpen(false)}
            />
          )
        : null;

  return (
    <Container>
      <EditorHeader
        diagramName={diagramName}
        onDiagramNameChange={event => setDiagramName(event.target.value)}
        onDiagramNameBlur={() => {}}
        hasSelection={false}
        selectionKind=""
        selectionLabel=""
        onDeleteSelection={() => {}}
        rightPanelOpen={libraryPanelOpen}
        onToggleRightPanel={() => {
          closeUtilityPanels();
          setLibraryPanelOpen(current => !current);
        }}
        assistantPanelOpen={assistantPanelOpen}
        onToggleAssistantPanel={() => {
          setReviewPanelOpen(false);
          setHistoryPanelOpen(false);
          setShowActions(false);
          setAssistantPanelOpen(current => !current);
        }}
        reviewPanelOpen={reviewPanelOpen}
        onToggleReviewPanel={() => {
          setAssistantPanelOpen(false);
          setHistoryPanelOpen(false);
          setShowActions(false);
          setReviewPanelOpen(current => !current);
        }}
        reviewSuggestionCount={reviewSuggestions.length}
        historyPanelOpen={historyPanelOpen}
        onToggleHistoryPanel={() => {
          setAssistantPanelOpen(false);
          setReviewPanelOpen(false);
          setShowActions(false);
          setHistoryPanelOpen(current => !current);
        }}
        showExportMenu={showActions}
        onToggleExportMenu={() => setShowActions(current => !current)}
        onSave={() => {}}
        onExportPNG={() => {}}
        onExportJSON={() => {}}
        connectMode={false}
        onToggleConnectMode={() => {}}
        simulateFlow={false}
        onToggleSimulateFlow={() => {}}
        onOpenInvite={() => {}}
      />
      <MainArea>
        <CanvasWrapper>
          <CanvasNote>Editor Smoke Probe</CanvasNote>
          <EmptyCanvas>
            <EmptyIcon>⬡</EmptyIcon>
            <EmptyText>
              {hydrated ? 'INTERACTIVE_EDITOR_SHELL_HYDRATED' : 'INTERACTIVE_EDITOR_SHELL_READY'}
            </EmptyText>
          </EmptyCanvas>
          {activeUtilityPanel ? <PanelHost>{activeUtilityPanel}</PanelHost> : null}
        </CanvasWrapper>
        <TechInventoryPanel
          open={libraryPanelOpen}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          inventory={inventory}
          customTechPrompt={customTechPrompt}
          onCustomTechPromptChange={setCustomTechPrompt}
          generatingTech={false}
          onGenerateTech={() => {}}
          onDragStart={() => {}}
          onDeleteFromInventory={() => {}}
          onClose={() => setLibraryPanelOpen(false)}
        />
      </MainArea>
      <PromptBar
        prompt={assistantPrompt}
        onPromptChange={setAssistantPrompt}
        template="blank"
        onTemplateChange={() => {}}
        loading={false}
        onGenerate={() => {}}
      />
    </Container>
  );
}
