'use client';

import styled from 'styled-components';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card, CardEyebrow, CardHeader, CardMeta, CardText, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Modal, { ModalFooter, ModalHeader, ModalText, ModalTitle } from '@/components/ui/Modal';
import { Field, Input, Label } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { templateOptions } from '@/lib/templates';
import { architectureExamples } from '@/lib/architectureExamples';

const Stack = styled.div`
  display: grid;
  gap: var(--spacing-lg);
`;

const UserChip = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 14px 6px 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  border-radius: 999px;
  box-shadow: none;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(0, 0, 0, 0.15);
    box-shadow: none;
  }
`;

const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.05);
  object-fit: cover;
`;

const UserCopy = styled.div`
  display: grid;
  gap: 2px;
`;

const UserName = styled.strong`
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  color: #000;
  line-height: 1;
`;

const UserMeta = styled.span`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  color: #999;
  line-height: 1;
`;

const Overview = styled(Card)`
  display: grid;
  grid-template-columns: 1.4fr 0.6fr;
  gap: 48px;
  padding: 48px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const OverviewCopy = styled.div`
  display: grid;
  gap: 24px;
`;

const OverviewTitle = styled.h2`
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 0.9;
  font-weight: 900;
  color: var(--color-ink);
  text-transform: uppercase;
`;

const OverviewText = styled.p`
  font-size: 1.15rem;
  color: var(--color-ink-muted);
  line-height: 1.5;
  max-width: 720px;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
`;

const StatCard = styled(Card)`
  padding: 24px;
  background: var(--color-canvas-alt);
`;

const StatValue = styled.div`
  font-family: var(--font-mono);
  font-size: 3rem;
  line-height: 1;
  font-weight: 900;
  color: var(--color-ink);
  letter-spacing: -0.06em;
  margin: 12px 0;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  border-bottom: 3px solid #000000;
  margin-bottom: 32px;
`;

const DiagramGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 32px;
`;

const ShowcaseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ShowcaseCard = styled.button`
  text-align: left;
  border: 2px solid #000000;
  background: #ffffff;
  padding: 18px;
  display: grid;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;

  &:hover {
    background: #f7f7f7;
    transform: translateY(-2px);
  }
`;

const ShowcaseTitle = styled.div`
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 900;
  color: #000000;
  text-transform: uppercase;
`;

const ShowcaseText = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: #444444;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const JoinTerminal = styled(Card)`
  padding: 16px 24px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: -16px;
  position: relative;
  z-index: 5;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TerminalPrompt = styled.div`
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 1.2rem;
  color: #000;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '_';
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    50% { opacity: 0; }
  }
`;

const TerminalInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 2px solid #eee;
  color: #000;
  font-family: var(--font-mono);
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  padding: 4px 0;
  flex: 1;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-bottom-color: #000;
    letter-spacing: 0.4em;
  }

  &::placeholder {
    color: #ccc;
    letter-spacing: normal;
    font-size: 0.9rem;
    font-weight: 500;
  }
`;

const TemplateCard = styled.button`
  text-align: left;
  width: 100%;
  border: 2px solid ${props => props.$active ? '#000000' : '#e5e5e5'};
  background: ${props => props.$active ? '#f5f5f5' : '#ffffff'};
  padding: 18px;
  display: grid;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #000000;
  }
`;

const TemplateName = styled.div`
  font-weight: 800;
  color: var(--color-ink);
  text-transform: uppercase;
  font-family: var(--font-mono);
`;

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function DashboardContent() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTemplate, setNewTemplate] = useState('blank');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState({ totalNodes: 0, totalEdges: 0, topTech: [] });
  const searchParams = useSearchParams();
  const [joining, setJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [diagramToDelete, setDiagramToDelete] = useState(null);
  const [launchingExampleId, setLaunchingExampleId] = useState(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadDiagrams();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const visibleDiagrams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return diagrams.filter(diagram => !query || diagram.name.toLowerCase().includes(query));
  }, [diagrams, searchQuery]);

  const resetCreateState = () => {
    setNewName('');
    setNewTemplate('blank');
    setCreating(false);
  };

  const loadDiagrams = async () => {
    try {
      const data = await api.getDiagrams();
      setDiagrams(data.diagrams);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load diagrams:', error);
      setToast({ message: 'We could not load your diagrams.', tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = template => {
    if (template) {
      setNewTemplate(template);
    }
    setShowModal(true);
  };

  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode && isLoaded && isSignedIn) {
      handleJoin(joinCode);
    }
  }, [searchParams, isLoaded, isSignedIn]);

  const handleJoin = async (code) => {
    setJoining(true);
    try {
      const res = await api.joinDiagram(code);
      setToast({ message: 'JOINED_SUCCESSFULLY', tone: 'success' });
      router.push(`/diagram/${res.id}`);
    } catch (err) {
      setToast({ message: 'INVALID_OR_EXPIRED_INVITE', tone: 'error' });
    } finally {
      setJoining(false);
    }
  };

  const submitJoin = () => {
    if (joinCode.trim()) {
      handleJoin(joinCode.trim());
    }
  };

  const createDiagram = async () => {
    if (!newName.trim()) {
      setToast({ message: 'Add a name before creating the diagram.', tone: 'warning' });
      return;
    }

    setCreating(true);

    try {
      const diagram = await api.createDiagram({ name: newName.trim(), template: newTemplate });
      resetCreateState();
      setShowModal(false);
      router.push(`/diagram/${diagram.id}`);
    } catch (error) {
      console.error('Failed to create diagram:', error);
      setToast({ message: 'Diagram creation failed. Try again.', tone: 'error' });
      setCreating(false);
    }
  };

  const launchShowcaseExample = async (example) => {
    setLaunchingExampleId(example.id);

    try {
      const diagram = await api.createDiagram({
        name: `${example.name} Architecture Demo`,
        template: 'blank'
      });

      window.localStorage.setItem(
        `archflow-example-prompt:${diagram.id}`,
        example.prompt
      );
      window.localStorage.setItem(
        `archflow-example-meta:${diagram.id}`,
        JSON.stringify({
          id: example.id,
          name: example.name,
          audience: example.audience
        })
      );
      router.push(`/diagram/${diagram.id}`);
    } catch (error) {
      console.error('Failed to launch showcase example:', error);
      setToast({ message: 'Showcase example failed to launch. Try again.', tone: 'error' });
      setLaunchingExampleId(null);
    }
  };

  const deleteDiagram = async (id, event) => {
    if (event) event.stopPropagation();
    setDiagramToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!diagramToDelete) return;
    
    try {
      await api.deleteDiagram(diagramToDelete);
      setDiagrams(diagrams.filter(d => d.id !== diagramToDelete));
      setToast({ message: 'SYSTEM_DELETED_SUCCESSFULLY', tone: 'success' });
    } catch (err) {
      setToast({ message: 'DELETION_FAILED', tone: 'error' });
    } finally {
      setShowDeleteModal(false);
      setDiagramToDelete(null);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <AppShell
      navItems={[
        { href: '/dashboard', label: 'Workspace', active: true },
        { href: '/settings', label: 'Settings', active: false }
      ]}
      actions={
        <>
          <SignOutButton>
            <Button $variant="ghost">Sign out</Button>
          </SignOutButton>
        </>
      }
      userSlot={
        <UserChip>
          <UserAvatar src={user?.imageUrl} alt={user?.fullName || 'User avatar'} />
          <UserCopy>
            <UserName>{user?.firstName || user?.fullName || 'Workspace owner'}</UserName>
            <UserMeta>{user?.primaryEmailAddress?.emailAddress}</UserMeta>
          </UserCopy>
        </UserChip>
      }
    >
      <Stack>
        <Overview $elevated>
          <OverviewCopy>
            <Badge $tone="brand">STATUS: ACTIVE_WORKSPACE</Badge>
            <OverviewTitle>The Blueprint For Your Next Build.</OverviewTitle>
            <OverviewText>
              Move from vague ideas to production-ready architecture decisions in a high-fidelity workspace designed for system thinking. Start from a blank canvas or pick a template to begin.
            </OverviewText>
            <ActionRow>
              <Button $variant="primary" onClick={() => openCreateModal('blank')}>Create Scratch</Button>
              <Button $variant="secondary" onClick={() => openCreateModal('saas')}>Browse Templates</Button>
            </ActionRow>
          </OverviewCopy>
          <StatsGrid>
            <StatCard>
              <CardEyebrow>ACTIVE_UNITS</CardEyebrow>
              <StatValue>{diagrams.length}</StatValue>
            </StatCard>
            <StatCard>
              <CardEyebrow>TOTAL_NODES</CardEyebrow>
              <StatValue>{stats.totalNodes}</StatValue>
            </StatCard>
            <StatCard>
              <CardEyebrow>CONNECTIONS</CardEyebrow>
              <StatValue>{stats.totalEdges}</StatValue>
            </StatCard>
            <StatCard style={{ background: '#000', color: '#fff' }}>
              <CardEyebrow style={{ color: '#999' }}>TOP_TECH_STACK</CardEyebrow>
              <div style={{ marginTop: '12px' }}>
                {stats.topTech.length > 0 ? stats.topTech.map(([name, count]) => (
                  <div key={name} style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{name.toUpperCase()}</span>
                    <span style={{ color: '#00ff00' }}>x{count}</span>
                  </div>
                )) : <div style={{ fontSize: '10px', color: '#666' }}>NO_DATA_SYNCED</div>}
              </div>
            </StatCard>
          </StatsGrid>
        </Overview>

        <JoinTerminal $elevated>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <TerminalPrompt>CONNECT_TO_WORKFLOW</TerminalPrompt>
            <TerminalInput 
              placeholder="ENTER_COLLABORATION_CODE"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && submitJoin()}
            />
          </div>
          <Button 
            onClick={submitJoin} 
            disabled={joining || !joinCode}
            $variant="primary"
            $size="sm"
            style={{ height: '40px', padding: '0 24px' }}
          >
            {joining ? 'SYNCING...' : 'ESTABLISH_CONNECTION'}
          </Button>
        </JoinTerminal>

        <section>
          <Toolbar>
            <div style={{ display: 'grid', gap: '8px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase' }}>Showcase Examples</h2>
              <CardText>Launch a recognizable system so recruiters can understand Archflow in seconds.</CardText>
            </div>
            <Badge $tone="brand">AI_READY_DEMOS</Badge>
          </Toolbar>

          <ShowcaseGrid>
            {architectureExamples.map(example => (
              <ShowcaseCard
                key={example.id}
                type="button"
                onClick={() => launchShowcaseExample(example)}
                disabled={Boolean(launchingExampleId)}
              >
                <Badge $tone="neutral">{example.audience}</Badge>
                <ShowcaseTitle>{example.name}</ShowcaseTitle>
                <ShowcaseText>{example.prompt}</ShowcaseText>
                <Button as="span" $variant="accent" $size="sm">
                  {launchingExampleId === example.id ? 'LAUNCHING...' : 'OPEN_DEMO_PROMPT'}
                </Button>
              </ShowcaseCard>
            ))}
          </ShowcaseGrid>
        </section>

        <section>
          <Toolbar>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase' }}>Recent Work</h2>
              <Badge $tone="neutral">{visibleDiagrams.length} UNITS</Badge>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Input
                placeholder="SEARCH_SYSTEM_ID"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                style={{ width: '300px' }}
              />
              <Button $variant="primary" onClick={() => openCreateModal('blank')}>New System</Button>
            </div>
          </Toolbar>

          {loading ? (
             <Card style={{ textAlign: 'center', padding: '64px' }}>
                <CardTitle>SYNCHRONIZING...</CardTitle>
             </Card>
          ) : visibleDiagrams.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '64px' }}>
              <CardTitle>NO SYSTEMS DETECTED</CardTitle>
              <CardText>Start a new architectural draft to populate the grid.</CardText>
              <div style={{ marginTop: '32px' }}>
                <Button $variant="primary" onClick={() => openCreateModal('blank')}>Initiate First Build</Button>
              </div>
            </Card>
          ) : (
            <DiagramGrid>
              {visibleDiagrams.map(diagram => (
                <Card
                  key={diagram.id}
                  $interactive
                  onClick={() => router.push(`/diagram/${diagram.id}`)}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), 
                                url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h1v1H0V0zm10 10h1v1h-1v-1z' fill='%23000' fill-opacity='0.05'/%3E%3C/svg%3E")`
                  }}
                >
                  <CardHeader style={{ position: 'relative', zIndex: 1 }}>
                    <CardEyebrow>
                      LAST_MOD: {formatDate(diagram.updatedAt)} 
                      <span style={{ marginLeft: '8px', color: diagram.isOwner ? '#00c853' : '#2979ff' }}>
                        {diagram.isOwner ? '[OWNER]' : '[COLLABORATOR]'}
                      </span>
                    </CardEyebrow>
                    <CardTitle $size="1.4rem">{diagram.name}</CardTitle>
                  </CardHeader>
                  <CardMeta style={{ position: 'relative', zIndex: 1 }}>
                    <span>{diagram.nodeCount || 0} NODES</span>
                    <span>{diagram.edgeCount || 0} EDGES</span>
                  </CardMeta>
                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <Button $variant="accent" $size="sm">OPEN_WORKSPACE</Button>
                    <Button $variant="ghost" $size="sm" onClick={event => deleteDiagram(diagram.id, event)}>DELETE</Button>
                  </div>
                </Card>
              ))}
            </DiagramGrid>
          )}
        </section>
      </Stack>

      <Modal open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDiagramToDelete(null); }}>
        <ModalHeader>
          <ModalTitle style={{ color: '#ff4444' }}>[WARNING] DESTRUCTIVE_ACTION</ModalTitle>
          <ModalText>You are about to permanently purge this system architecture from the mainframe.</ModalText>
        </ModalHeader>

        <div style={{ 
          padding: '24px', 
          background: '#fff5f5', 
          border: '2px solid #ff4444',
          margin: '24px 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#ff4444', 
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            wordBreak: 'break-word',
            lineHeight: '1.4'
          }}>
            THIS_ACTION_CANNOT_BE_REVERSED.
            <br />
            ALL_NODES_AND_PROTOCOLS_WILL_BE_LOST.
          </div>
        </div>

        <ModalFooter style={{ justifyContent: 'stretch' }}>
          <Button $variant="secondary" onClick={() => setShowDeleteModal(false)} style={{ flex: 1 }}>CANCEL</Button>
          <Button 
            onClick={confirmDelete}
            style={{ 
              flex: 1,
              background: '#ff4444', 
              color: '#fff'
            }}
          >
            CONFIRM_PURGE
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={showModal} onClose={() => { setShowModal(false); resetCreateState(); }}>
        <ModalHeader>
          <ModalTitle>INITIATE_NEW_WORKSPACE</ModalTitle>
          <ModalText>Configure the system parameters below to begin architectural synthesis.</ModalText>
        </ModalHeader>

        <Field>
          <Label htmlFor="diagram-name">SYSTEM_NAME</Label>
          <Input
            id="diagram-name"
            placeholder="Ex: GLOBAL_PAYMENTS_V1"
            value={newName}
            onChange={event => setNewName(event.target.value)}
          />
        </Field>

        {newTemplate !== 'blank' && (
          <>
            <div style={{ height: '32px' }} />
            <Field>
              <Label>TEMPLATE_SELECT</Label>
              <TemplateGrid>
                {templateOptions.map(template => (
                  <TemplateCard
                    key={template.id}
                    type="button"
                    $active={newTemplate === template.id}
                    onClick={() => setNewTemplate(template.id)}
                  >
                    <Badge $tone="neutral">{template.eyebrow}</Badge>
                    <TemplateName>{template.name}</TemplateName>
                  </TemplateCard>
                ))}
              </TemplateGrid>
            </Field>
          </>
        )}

        <ModalFooter>
          <Button $variant="ghost" onClick={() => { setShowModal(false); resetCreateState(); }}>ABORT</Button>
          <Button $variant="primary" onClick={createDiagram} disabled={creating}>
            {creating ? 'PROCESSING...' : 'INITIALIZE'}
          </Button>
        </ModalFooter>
      </Modal>

      {toast ? <Toast $tone={toast.tone}>{toast.message}</Toast> : null}
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
