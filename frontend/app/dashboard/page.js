'use client';

import styled from 'styled-components';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardEyebrow, CardHeader, CardMeta, CardText, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Modal, { ModalFooter, ModalHeader, ModalText, ModalTitle } from '@/components/ui/Modal';
import { Field, Hint, Input, Label } from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { Toast } from '@/components/ui/Toast';
import { templateOptions } from '@/lib/templates';

const Stack = styled.div`
  display: grid;
  gap: var(--spacing-lg);
`;

const UserChip = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border: 3px solid #000000;
  background: #ffffff;
  box-shadow: 4px 4px 0px #000000;
`;

const UserAvatar = styled.img`
  width: 44px;
  height: 44px;
  border: 2px solid #000000;
  object-fit: cover;
`;

const UserCopy = styled.div`
  display: grid;
  gap: 2px;
`;

const UserName = styled.strong`
  font-size: 1rem;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--color-ink);
`;

const UserMeta = styled.span`
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-ink-soft);
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

const QuickStartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const DiagramGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 32px;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
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

export default function DashboardPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTemplate, setNewTemplate] = useState('blank');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyTemplates, setShowOnlyTemplates] = useState(false);
  const [toast, setToast] = useState(null);
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState({ totalNodes: 0, totalEdges: 0, topTech: [] });

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

    return diagrams.filter(diagram => {
      const matchesQuery = !query || diagram.name.toLowerCase().includes(query);
      const matchesFilter = !showOnlyTemplates || diagram.nodeCount > 0;
      return matchesQuery && matchesFilter;
    });
  }, [diagrams, searchQuery, showOnlyTemplates]);

  const totalNodes = useMemo(
    () => diagrams.reduce((sum, diagram) => sum + (diagram.nodeCount || 0), 0),
    [diagrams]
  );

  const totalConnections = useMemo(
    () => diagrams.reduce((sum, diagram) => sum + (diagram.edgeCount || 0), 0),
    [diagrams]
  );

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

  const deleteDiagram = async (id, event) => {
    event.stopPropagation();

    if (!confirm('Delete this diagram?')) {
      return;
    }

    try {
      await api.deleteDiagram(id);
      setDiagrams(current => current.filter(diagram => diagram.id !== id));
      setToast({ message: 'Diagram deleted.', tone: 'success' });
    } catch (error) {
      console.error('Failed to delete diagram:', error);
      setToast({ message: 'Delete failed. Please retry.', tone: 'error' });
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
          <Link href="/settings">
            <Button $variant="secondary">Preferences</Button>
          </Link>
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
                    <CardEyebrow>LAST_MOD: {formatDate(diagram.updatedAt)}</CardEyebrow>
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
