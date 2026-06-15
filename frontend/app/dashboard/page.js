'use client';

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
import {
  ActionRow,
  DiagramGrid,
  JoinTerminal,
  Overview,
  OverviewCopy,
  OverviewText,
  OverviewTitle,
  ShowcaseCount,
  ShowcaseHeader,
  ShowcaseHeading,
  ShowcaseAccordionToggle,
  ShowcaseAction,
  ShowcaseIndex,
  ShowcaseIntro,
  ShowcaseKicker,
  ShowcaseLauncher,
  ShowcaseList,
  ShowcaseListInner,
  ShowcaseRow,
  ShowcaseText,
  ShowcaseTitle,
  Stack,
  StatCard,
  StatsGrid,
  StatValue,
  TemplateCard,
  TemplateGrid,
  TemplateName,
  TerminalInput,
  TerminalPrompt,
  Toolbar,
  UserAvatar,
  UserChip,
  UserCopy,
  UserMeta,
  UserName
} from './Dashboard.styles';

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
  const [showcaseOpen, setShowcaseOpen] = useState(false);

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
            <Badge $tone="brand">Active workspace</Badge>
            <OverviewTitle>Design systems without the noise.</OverviewTitle>
            <OverviewText>
              Turn an idea into a reliable architecture diagram, then review the system layer by layer when you need the deeper reasoning.
            </OverviewText>
            <ActionRow>
              <Button $variant="primary" onClick={() => openCreateModal('blank')}>Blank diagram</Button>
              <Button $variant="secondary" onClick={() => openCreateModal('saas')}>Templates</Button>
            </ActionRow>
          </OverviewCopy>
          <StatsGrid>
            <StatCard>
              <CardEyebrow>Diagrams</CardEyebrow>
              <StatValue>{diagrams.length}</StatValue>
            </StatCard>
            <StatCard>
              <CardEyebrow>Components</CardEyebrow>
              <StatValue>{stats.totalNodes}</StatValue>
            </StatCard>
            <StatCard>
              <CardEyebrow>Connections</CardEyebrow>
              <StatValue>{stats.totalEdges}</StatValue>
            </StatCard>
            <StatCard style={{ background: '#000', color: '#fff' }}>
              <CardEyebrow style={{ color: '#999' }}>Top tech</CardEyebrow>
              <div style={{ marginTop: '12px' }}>
                {stats.topTech.length > 0 ? stats.topTech.map(([name, count]) => (
                  <div key={name} style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{name.toUpperCase()}</span>
                    <span style={{ color: '#00ff00' }}>x{count}</span>
                  </div>
                )) : <div style={{ fontSize: '10px', color: '#666' }}>No data yet</div>}
              </div>
            </StatCard>
          </StatsGrid>
        </Overview>

        <JoinTerminal $elevated>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <TerminalPrompt>Join collaboration</TerminalPrompt>
            <TerminalInput 
              placeholder="Invite code"
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
            {joining ? 'Joining...' : 'Join'}
          </Button>
        </JoinTerminal>

        <section>
          <ShowcaseLauncher>
            <ShowcaseHeader>
              <div>
                <ShowcaseKicker>Examples</ShowcaseKicker>
                <ShowcaseHeading>Start with a familiar product.</ShowcaseHeading>
                <ShowcaseIntro>
                  Open Netflix, Uber, WhatsApp, Stripe, YouTube, or Slack as a ready-to-synthesize system design.
                </ShowcaseIntro>
              </div>
              <ShowcaseCount>
                <strong>{architectureExamples.length}</strong>
                <span>examples</span>
              </ShowcaseCount>
            </ShowcaseHeader>

            <ShowcaseAccordionToggle
              type="button"
              onClick={() => setShowcaseOpen(open => !open)}
              aria-expanded={showcaseOpen}
              aria-controls="showcase-demo-list"
            >
              <span>{showcaseOpen ? 'Hide examples' : 'Show examples'}</span>
              <strong>{showcaseOpen ? 'Collapse' : `${architectureExamples.length} ready`}</strong>
            </ShowcaseAccordionToggle>

            <ShowcaseList id="showcase-demo-list" $open={showcaseOpen} aria-hidden={!showcaseOpen}>
              <ShowcaseListInner>
                {architectureExamples.map((example, index) => (
                  <ShowcaseRow
                    key={example.id}
                    type="button"
                    onClick={() => launchShowcaseExample(example)}
                    disabled={!showcaseOpen || Boolean(launchingExampleId)}
                    tabIndex={showcaseOpen ? 0 : -1}
                  >
                    <ShowcaseIndex>{String(index + 1).padStart(2, '0')}</ShowcaseIndex>
                    <div>
                      <Badge $tone="neutral">{example.audience}</Badge>
                      <ShowcaseTitle style={{ marginTop: '8px' }}>{example.name}</ShowcaseTitle>
                    </div>
                    <ShowcaseText>{example.prompt}</ShowcaseText>
                    <ShowcaseAction>
                      {launchingExampleId === example.id ? 'Launching...' : 'Open'}
                    </ShowcaseAction>
                  </ShowcaseRow>
                ))}
              </ShowcaseListInner>
            </ShowcaseList>
          </ShowcaseLauncher>
        </section>

        <section>
          <Toolbar>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase' }}>Recent diagrams</h2>
              <Badge $tone="neutral">{visibleDiagrams.length} diagrams</Badge>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Input
                placeholder="Search diagrams"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                style={{ width: '300px' }}
              />
              <Button $variant="primary" onClick={() => openCreateModal('blank')}>New diagram</Button>
            </div>
          </Toolbar>

          {loading ? (
             <Card style={{ textAlign: 'center', padding: '64px' }}>
                <CardTitle>Loading diagrams...</CardTitle>
             </Card>
          ) : visibleDiagrams.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '64px' }}>
              <CardTitle>No diagrams yet</CardTitle>
              <CardText>Create your first system diagram to populate the workspace.</CardText>
              <div style={{ marginTop: '32px' }}>
                <Button $variant="primary" onClick={() => openCreateModal('blank')}>Create first diagram</Button>
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
                        {diagram.isOwner ? 'Owner' : 'Collaborator'}
                      </span>
                    </CardEyebrow>
                    <CardTitle $size="1.4rem">{diagram.name}</CardTitle>
                  </CardHeader>
                  <CardMeta style={{ position: 'relative', zIndex: 1 }}>
                    <span>{diagram.nodeCount || 0} NODES</span>
                    <span>{diagram.edgeCount || 0} EDGES</span>
                  </CardMeta>
                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <Button $variant="accent" $size="sm">Open</Button>
                    <Button $variant="ghost" $size="sm" onClick={event => deleteDiagram(diagram.id, event)}>Delete</Button>
                  </div>
                </Card>
              ))}
            </DiagramGrid>
          )}
        </section>
      </Stack>

      <Modal open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDiagramToDelete(null); }}>
        <ModalHeader>
          <ModalTitle style={{ color: '#ff4444' }}>Delete diagram?</ModalTitle>
          <ModalText>This permanently removes the diagram and its saved architecture state.</ModalText>
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
            This action cannot be reversed.
            <br />
            Components, connections, and saved history will be removed.
          </div>
        </div>

        <ModalFooter style={{ justifyContent: 'stretch' }}>
          <Button $variant="secondary" onClick={() => setShowDeleteModal(false)} style={{ flex: 1 }}>Cancel</Button>
          <Button 
            onClick={confirmDelete}
            style={{ 
              flex: 1,
              background: '#ff4444', 
              color: '#fff'
            }}
          >
            Delete diagram
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={showModal} onClose={() => { setShowModal(false); resetCreateState(); }}>
        <ModalHeader>
          <ModalTitle>Create diagram</ModalTitle>
          <ModalText>Name the workspace and choose a starter template if you want one.</ModalText>
        </ModalHeader>

        <Field>
          <Label htmlFor="diagram-name">Diagram name</Label>
          <Input
            id="diagram-name"
            placeholder="Ex: Global payments"
            value={newName}
            onChange={event => setNewName(event.target.value)}
          />
        </Field>

        {newTemplate !== 'blank' && (
          <>
            <div style={{ height: '32px' }} />
            <Field>
              <Label>Template</Label>
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
          <Button $variant="ghost" onClick={() => { setShowModal(false); resetCreateState(); }}>Cancel</Button>
          <Button $variant="primary" onClick={createDiagram} disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
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
