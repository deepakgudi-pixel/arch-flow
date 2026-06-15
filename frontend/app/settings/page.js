'use client';

import styled from 'styled-components';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle } from 'lucide-react';
import api from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardEyebrow, CardText, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Field, Hint, Label, Select } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { templateOptions } from '@/lib/templates';

const Stack = styled.div`
  display: grid;
  gap: 22px;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
  gap: 22px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const SectionStack = styled.div`
  display: grid;
  gap: 18px;
`;

const OptionGrid = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 8px;
`;

const OptionCard = styled.button`
  width: 100%;
  text-align: left;
  border-radius: var(--radius-md);
  border: ${props => props.$active ? '2px solid #000000' : '1px solid rgba(0, 0, 0, 0.12)'};
  background: ${props => props.$active ? '#ffffff' : 'rgba(246, 249, 252, 0.94)'};
  padding: ${props => props.$active ? '17px' : '18px'};
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease;

  &:hover {
    border-color: #000000;
    background: ${props => props.$active ? '#ffffff' : '#f7f7f7'};
  }

  &:focus-visible {
    outline: 3px solid rgba(0, 0, 0, 0.18);
    outline-offset: 3px;
  }
`;

const OptionIndicator = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: ${props => props.$active ? '#000000' : '#9ca3af'};
`;

const OptionBody = styled.span`
  display: grid;
  gap: 8px;
`;

const OptionTitle = styled.div`
  font-weight: 800;
  color: var(--color-ink);
  letter-spacing: 0;
`;

const OptionText = styled.p`
  color: var(--color-ink-muted);
  line-height: 1.6;
  font-size: 0.92rem;
`;

const OptionStatus = styled.span`
  align-self: start;
  border: 1px solid ${props => props.$active ? '#000000' : 'rgba(0, 0, 0, 0.12)'};
  border-radius: 999px;
  padding: 5px 9px;
  color: ${props => props.$active ? '#ffffff' : '#666666'};
  background: ${props => props.$active ? '#000000' : '#ffffff'};
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 800;

  @media (max-width: 640px) {
    grid-column: 2 / -1;
    justify-self: start;
  }
`;

const InfoStack = styled.div`
  display: grid;
  gap: 12px;
`;

const InfoRow = styled.div`
  padding-top: 12px;
  border-top: 1px solid var(--color-line);
  display: grid;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0;
  font-weight: 800;
  color: var(--color-ink-soft);
`;

const InfoValue = styled.span`
  color: var(--color-ink);
  font-weight: 700;
`;

const CONNECTION_MODE_OPTIONS = [
  {
    value: 'strict',
    title: 'Strict',
    description: 'Only allow connections that follow the intended architectural rules.'
  },
  {
    value: 'guided',
    title: 'Guided',
    description: 'Flag unusual patterns but keep the workspace flexible enough for iteration.'
  },
  {
    value: 'sandbox',
    title: 'Sandbox',
    description: 'Remove warnings entirely when you want total freedom to sketch without constraints.'
  }
];

export default function SettingsPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [settings, setSettings] = useState({
    connection_mode: 'guided',
    default_template: 'blank',
    autosave_interval: 30,
    theme: 'light'
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadSettings();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setToast({ message: 'Could not load your settings.', tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);

    try {
      await api.updateSettings({ [key]: value });
      setToast({ message: 'Preferences saved.', tone: 'success' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setToast({ message: 'Save failed. Please retry.', tone: 'error' });
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <AppShell
      navItems={[
        { href: '/dashboard', label: 'Workspace', active: false },
        { href: '/settings', label: 'Settings', active: true }
      ]}
      actions={
        <>
          <Link href="/dashboard">
            <Button $variant="secondary">Back to workspace</Button>
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
        <PageHeader
          eyebrow="Preferences"
          title="Shape how the workspace behaves while you design."
          subtitle="These settings control validation strictness, starting templates, and save behavior so the product fits your workflow."
          actions={loading ? <Badge $tone="warning">Loading…</Badge> : <Badge $tone="brand">Live preferences</Badge>}
        />

        <Grid>
          <SectionStack>
            <Card>
              <CardEyebrow>Connection rules</CardEyebrow>
              <CardTitle>Choose how much architectural guidance you want.</CardTitle>
              <CardText>
                Use strict rules when you want strong boundaries, or relax the system when you are exploring an idea.
              </CardText>
              <OptionGrid>
                {CONNECTION_MODE_OPTIONS.map(option => {
                  const active = settings.connection_mode === option.value;
                  const IndicatorIcon = active ? CheckCircle2 : Circle;

                  return (
                    <OptionCard
                      key={option.value}
                      type="button"
                      $active={active}
                      aria-pressed={active}
                      onClick={() => updateSetting('connection_mode', option.value)}
                    >
                      <OptionIndicator $active={active}>
                        <IndicatorIcon size={18} strokeWidth={active ? 2.8 : 2.2} />
                      </OptionIndicator>
                      <OptionBody>
                        <OptionTitle>{option.title}</OptionTitle>
                        <OptionText>{option.description}</OptionText>
                      </OptionBody>
                      <OptionStatus $active={active}>{active ? 'Selected' : 'Choose'}</OptionStatus>
                    </OptionCard>
                  );
                })}
              </OptionGrid>
            </Card>

            <Card>
              <CardEyebrow>Workspace defaults</CardEyebrow>
              <CardTitle>Set the starting shape for new diagrams.</CardTitle>
              <CardText>
                These defaults help you move faster whenever you create a new architecture workspace.
              </CardText>
              <div style={{ display: 'grid', gap: '18px', marginTop: '18px' }}>
                <Field>
                  <Label htmlFor="default-template">Default template</Label>
                  <Select
                    id="default-template"
                    value={settings.default_template}
                    onChange={event => updateSetting('default_template', event.target.value)}
                  >
                    {templateOptions.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </Select>
                  <Hint>New diagrams can start blank or with a reusable architecture baseline.</Hint>
                </Field>

                <Field>
                  <Label htmlFor="autosave-interval">Auto-save interval</Label>
                  <Select
                    id="autosave-interval"
                    value={String(settings.autosave_interval)}
                    onChange={event => updateSetting('autosave_interval', parseInt(event.target.value, 10))}
                  >
                    <option value="10">Every 10 seconds</option>
                    <option value="30">Every 30 seconds</option>
                    <option value="60">Every minute</option>
                    <option value="120">Every 2 minutes</option>
                    <option value="0">Manual only</option>
                  </Select>
                  <Hint>Choose between fast persistence and lower save frequency while you edit.</Hint>
                </Field>
              </div>
            </Card>
          </SectionStack>

          <SectionStack>
            <Card $muted>
              <CardEyebrow>Account</CardEyebrow>
              <CardTitle>Your workspace identity</CardTitle>
              <CardText>
                Archflow uses this account for saved diagrams, editor preferences, and session continuity.
              </CardText>
              <InfoStack style={{ marginTop: '18px' }}>
                <InfoRow>
                  <InfoLabel>Name</InfoLabel>
                  <InfoValue>{user?.fullName}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{user?.primaryEmailAddress?.emailAddress}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Primary workspace flow</InfoLabel>
                  <InfoValue>Dashboard → editor → save and iterate</InfoValue>
                </InfoRow>
              </InfoStack>
            </Card>

            <Card>
              <CardEyebrow>Recommended setup</CardEyebrow>
              <CardTitle>Balanced defaults for most product teams</CardTitle>
              <CardText>
                If you are not sure what to choose, `Guided` mode, a reusable template, and 30 second auto-save
                creates a good balance between confidence and speed.
              </CardText>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
                <Badge $tone="brand">Guided mode</Badge>
                <Badge $tone="accent">Template defaults</Badge>
                <Badge $tone="warning">30 second autosave</Badge>
              </div>
            </Card>
          </SectionStack>
        </Grid>
      </Stack>

      {toast ? <Toast $tone={toast.tone}>{toast.message}</Toast> : null}
    </AppShell>
  );
}
