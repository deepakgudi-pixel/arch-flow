import styled from 'styled-components';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export const Stack = styled.div`
  display: grid;
  gap: var(--spacing-lg);
`;

export const UserChip = styled.div`
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

export const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.05);
  object-fit: cover;
`;

export const UserCopy = styled.div`
  display: grid;
  gap: 2px;
`;

export const UserName = styled.strong`
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  color: #000;
  line-height: 1;
`;

export const UserMeta = styled.span`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  color: #999;
  line-height: 1;
`;

export const Overview = styled(Card)`
  display: grid;
  grid-template-columns: 1.4fr 0.6fr;
  gap: 48px;
  padding: 48px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

export const OverviewCopy = styled.div`
  display: grid;
  gap: 24px;
`;

export const OverviewTitle = styled.h2`
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 0.9;
  font-weight: 900;
  color: var(--color-ink);
  text-transform: uppercase;
`;

export const OverviewText = styled.p`
  font-size: 1.15rem;
  color: var(--color-ink-muted);
  line-height: 1.5;
  max-width: 720px;
`;

export const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
`;

export const StatCard = styled(Card)`
  padding: 24px;
  background: var(--color-canvas-alt);
`;

export const StatValue = styled.div`
  font-family: var(--font-mono);
  font-size: 3rem;
  line-height: 1;
  font-weight: 900;
  color: var(--color-ink);
  letter-spacing: -0.06em;
  margin: 12px 0;
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  border-bottom: 3px solid #000000;
  margin-bottom: 32px;
`;

export const DiagramGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 32px;
`;

export const ShowcaseLauncher = styled.div`
  border: 3px solid #000000;
  background: #ffffff;
`;

export const ShowcaseHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
  padding: 28px 32px;
  border-bottom: 3px solid #000000;
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
    linear-gradient(180deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
    #f7f7f7;
  background-size: 18px 18px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    align-items: start;
  }
`;

export const ShowcaseKicker = styled.div`
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 900;
  color: #555555;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const ShowcaseHeading = styled.h2`
  margin: 8px 0 10px;
  font-family: var(--font-sans);
  font-size: clamp(1.8rem, 4vw, 3.35rem);
  line-height: 0.95;
  font-weight: 900;
  color: #000000;
  text-transform: uppercase;
  max-width: 760px;
`;

export const ShowcaseIntro = styled.p`
  max-width: 760px;
  color: #3f3f3f;
  font-size: 0.98rem;
  line-height: 1.55;
`;

export const ShowcaseCount = styled.div`
  display: grid;
  gap: 4px;
  justify-items: end;
  font-family: var(--font-mono);
  text-transform: uppercase;
  color: #000000;

  strong {
    font-size: 2.6rem;
    line-height: 1;
  }

  span {
    font-size: 0.7rem;
    font-weight: 900;
    color: #666666;
  }

  @media (max-width: 760px) {
    justify-items: start;
  }
`;

export const ShowcaseAccordionToggle = styled.button`
  width: 100%;
  border: 0;
  border-bottom: 1px solid #d8d8d8;
  background: #ffffff;
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 24px;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;

  &:hover {
    background: #000000;
    color: #ffffff;
  }

  strong {
    font-size: 0.72rem;
    color: currentColor;
  }

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const ShowcaseList = styled.div`
  display: grid;
  grid-template-rows: ${props => props.$open ? '1fr' : '0fr'};
  opacity: ${props => props.$open ? 1 : 0};
  overflow: hidden;
  transform: translateY(${props => props.$open ? '0' : '-6px'});
  pointer-events: ${props => props.$open ? 'auto' : 'none'};
  transition:
    grid-template-rows 0.52s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.38s ease,
    transform 0.44s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: grid-template-rows, opacity, transform;
`;

export const ShowcaseListInner = styled.div`
  min-height: 0;
  overflow: hidden;
  display: grid;
`;

export const ShowcaseRow = styled.button`
  width: 100%;
  text-align: left;
  border: 0;
  border-bottom: 1px solid #d8d8d8;
  background: #ffffff;
  display: grid;
  grid-template-columns: 56px minmax(140px, 0.25fr) minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: 18px 24px;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;

  &:hover {
    background: #000000;
    color: #ffffff;
  }

  &:hover p,
  &:hover ${Badge} {
    color: #ffffff;
  }

  &:last-child {
    border-bottom: 0;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  @media (max-width: 900px) {
    grid-template-columns: 44px minmax(0, 1fr) auto;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 20px;
  }
`;

export const ShowcaseIndex = styled.div`
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 900;
  color: currentColor;
  opacity: 0.6;
`;

export const ShowcaseTitle = styled.div`
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 900;
  color: currentColor;
  text-transform: uppercase;
`;

export const ShowcaseText = styled.p`
  font-size: 13px;
  line-height: 1.45;
  color: #444444;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 900px) {
    grid-column: 2 / -1;
  }

  @media (max-width: 640px) {
    grid-column: auto;
  }
`;

export const ShowcaseAction = styled.span`
  justify-self: end;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 900;
  color: currentColor;
  text-transform: uppercase;
  white-space: nowrap;

  @media (max-width: 640px) {
    justify-self: start;
  }
`;

export const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const JoinTerminal = styled(Card)`
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

export const TerminalPrompt = styled.div`
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

export const TerminalInput = styled.input`
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

export const TemplateCard = styled.button`
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

export const TemplateName = styled.div`
  font-weight: 800;
  color: var(--color-ink);
  text-transform: uppercase;
  font-family: var(--font-mono);
`;
