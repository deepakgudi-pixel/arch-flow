'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitBranch, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardEyebrow, CardText, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const Page = styled.div`
  min-height: 100vh;
  position: relative;
  background-color: var(--color-canvas);
`;

const Nav = styled.header`
  position: relative;
  max-width: var(--page-width);
  margin: 0 auto;
  padding: 32px var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 1.5rem;
  text-transform: uppercase;
  color: var(--color-ink);
  
  &:hover {
    text-decoration: none;
  }
`;

const BrandMark = styled.span`
  width: 52px;
  height: 52px;
  border: 4px solid #000000;
  display: grid;
  place-items: center;
  background: #000000;
  color: white;
  box-shadow: 6px 6px 0px #000000;
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const NavLink = styled.a`
  padding: 12px 20px;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-ink);
  border: 3px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    border-color: #000000;
    text-decoration: none;
  }
`;

const Hero = styled.section`
  position: relative;
  max-width: var(--page-width);
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 48px;
  }
`;

const HeroCopy = styled.div`
  display: grid;
  gap: 32px;
`;

const HeroTitle = styled.h1`
  font-size: clamp(3.5rem, 8vw, 7rem);
  line-height: 0.85;
  font-weight: 900;
  color: var(--color-ink);
  text-transform: uppercase;

  span {
    display: block;
    color: #000000;
    -webkit-text-fill-color: initial;
    background: none;
  }
`;

const HeroText = styled.p`
  font-size: 1.25rem;
  line-height: 1.5;
  color: var(--color-ink-muted);
  max-width: 600px;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const Preview = styled(Card)`
  padding: 0;
  background: #ffffff;
  min-height: 500px;
`;

const Section = styled.section`
  position: relative;
  max-width: var(--page-width);
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
  border-top: 4px solid #000000;
`;

const SectionHeader = styled.div`
  max-width: 900px;
  display: grid;
  gap: 24px;
  margin-bottom: 64px;
`;

const SplitSectionHeader = styled(SectionHeader)`
  max-width: 100%;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  align-items: start;
  gap: 28px 40px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SectionBodyText = styled(HeroText)`
  max-width: none;
  margin: 0;
`;

const SectionTitle = styled.h2`
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  line-height: 0.9;
  font-weight: 900;
  color: var(--color-ink);
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(Card)`
  grid-column: span ${props => props.$span || 4};
  display: grid;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-column: span 1;
  }
`;

const DesktopSection = styled.section`
  max-width: var(--page-width);
  margin: 64px auto;
  padding: 80px var(--spacing-md);
  background: #000;
  color: #fff;
  border: 8px solid #000;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  position: relative;
  overflow: hidden;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding: 48px 24px;
  }
`;

const DesktopCopy = styled.div`
  display: grid;
  gap: 24px;
  position: relative;
  z-index: 2;
`;

const DesktopTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
`;

const DesktopPreview = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  
  img {
    max-width: 100%;
    height: auto;
    border: 4px solid #fff;
    box-shadow: 12px 12px 0px rgba(255, 255, 255, 0.2);
  }
`;

const TechLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  color: #4ADE80;
  letter-spacing: 2px;
  margin-bottom: 8px;
`;

export default function HomePage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [tracing, setTracing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);

  useEffect(() => {
    // Detect if running inside our Electron shell
    if (typeof window !== 'undefined' && window.navigator.userAgent.includes('ArchflowDesktop')) {
      setIsDesktop(true);
    }

    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  const startVerification = () => {
    if (verifying) return;
    setVerifying(true);
    setProgress1(0);
    
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 15;
      if (current >= 100) {
        current = 100;
        setProgress1(100);
        clearInterval(interval);
        setTimeout(() => {
          setVerifying(false);
          setProgress1(0);
        }, 1500);
      } else {
        setProgress1(current);
      }
    }, 150);
  };

  const startTracing = () => {
    if (tracing) return;
    setTracing(true);
    setProgress2(0);
    
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 12;
      if (current >= 100) {
        current = 100;
        setProgress2(100);
        clearInterval(interval);
        setTimeout(() => {
          setTracing(false);
          setProgress2(0);
        }, 1500);
      } else {
        setProgress2(current);
      }
    }, 180);
  };

  return (
    <Page>
      <Nav>
        <Brand href="/">
          <BrandMark>⬡</BrandMark>
          Archflow
        </Brand>
        <NavLinks>
          <NavLink href="#product">Product</NavLink>
          {isSignedIn ? (
            <Link href="/dashboard">
              <Button $variant="primary">Open workspace</Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button $variant="ghost">Sign in</Button>
              </Link>
              <Link href="/sign-up">
                <Button $variant="primary">Start designing</Button>
              </Link>
            </>
          )}
        </NavLinks>
      </Nav>

      <Hero>
        <HeroCopy>
          <Badge $tone="brand">SYSTEM_ID: ARCH-V1</Badge>
          <HeroTitle>
            Architecture
            <span>That Ships.</span>
          </HeroTitle>
          <HeroText>
            Move from vague ideas to production-ready architecture decisions in a high-fidelity workspace designed for system thinking.
          </HeroText>
          <HeroActions>
            <Link href={isSignedIn ? '/dashboard' : '/sign-up'}>
              <Button $variant="primary" $size="lg">Start workspace</Button>
            </Link>
            <Link href="#product">
              <Button $variant="secondary" $size="lg">System specs</Button>
            </Link>
          </HeroActions>
        </HeroCopy>

        <Preview $elevated>
          <div style={{ padding: '32px', borderBottom: '3px solid #000000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>WORKSPACE_PREVIEW_01</span>
            <Badge $tone="accent">LIVE_DRAFT</Badge>
          </div>
          <div style={{ padding: '32px', display: 'grid', gap: '32px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <Card style={{ background: '#F2F2F2' }}>
                   <CardEyebrow>FRONTEND_V3</CardEyebrow>
                   <CardTitle $size="1.2rem">React Dashboard</CardTitle>
                </Card>
                <Card style={{ background: '#F2F2F2' }}>
                   <CardEyebrow>BACKEND_V3</CardEyebrow>
                   <CardTitle $size="1.2rem">Go Microservice</CardTitle>
                </Card>
             </div>
             <Card style={{ background: '#F2F2F2' }}>
                <CardEyebrow>PERSISTENCE_LAYER</CardEyebrow>
                <CardTitle $size="1.2rem">Multi-Region RDS + ElasticCache</CardTitle>
             </Card>
          </div>
        </Preview>
      </Hero>

      <Section id="product">
        <SplitSectionHeader>
          <SectionTitle>Engineered for the messy middle of design.</SectionTitle>
          <SectionBodyText>
            Archflow bridges the gap between rough sketches and implementation specs with a workspace that carries engineering context into every node, every connection, and every AI-assisted review step.
          </SectionBodyText>
        </SplitSectionHeader>

        <FeatureGrid>
          <FeatureCard $span={6} $elevated style={{ overflow: 'hidden' }}>
            {verifying && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${progress1}%`,
                background: 'linear-gradient(90deg, #4ADE80 0%, #22C55E 100%)',
                opacity: 0.15,
                transition: 'width 0.2s ease-out',
                zIndex: 0
              }} />
            )}
            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <Badge $tone="neutral">MODULE_01</Badge>
              </div>
              <CardTitle>AI-Assisted Diagram Generation</CardTitle>
              <CardText>
                Generate architecture drafts from product requirements, then keep refining them instead of restarting from scratch. Archflow helps users move from blank canvas to working system model fast.
              </CardText>
              <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Button 
                  $variant="secondary" 
                  $size="sm" 
                  onClick={startVerification}
                  disabled={verifying}
                  style={{ minWidth: '160px' }}
                >
                  {verifying ? 'REVIEWING...' : 'Inspect Flow'}
                </Button>
                {verifying && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 900 }}>
                    {Math.round(progress1)}% COMPLETE
                  </span>
                )}
              </div>
            </div>
          </FeatureCard>
          
          <FeatureCard $span={6} $elevated>
            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <Badge $tone="neutral">MODULE_02</Badge>
              </div>
              <CardTitle>AI Assistant + Architectural Review</CardTitle>
              <CardText>
                Users can ask the AI assistant what is missing, why a technology belongs, or how strong the current diagram is. Missing tech gets staged into Architectural Review before it touches the live diagram.
              </CardText>
              <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Button
                  $variant="secondary"
                  $size="sm"
                  onClick={startTracing}
                  disabled={tracing}
                  style={{ minWidth: '180px' }}
                >
                  {tracing ? 'STAGING...' : 'Stage AI Suggestions'}
                </Button>
                {tracing && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 900 }}>
                    {Math.round(progress2)}% STAGED
                  </span>
                )}
              </div>
            </div>
          </FeatureCard>

          <FeatureCard $span={12} $elevated>
            <div style={{ display: 'grid', gap: '18px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <Badge $tone="neutral">MODULE_03</Badge>
                <Badge $tone="brand"><Sparkles size={12} /> REFRESH_SAFE_AI_DRAFTS</Badge>
                <Badge $tone="warning"><GitBranch size={12} /> ACCEPT_AND_CONNECT</Badge>
              </div>
              <CardTitle>Built for iterative architecture work, not one-shot generation.</CardTitle>
              <CardText>
                Pending AI chat and staged review items survive refreshes, accepted suggestions connect into the diagram, and the review layer uses rule-aware checks so users can grow complex systems without losing clarity or control.
              </CardText>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
                <Card style={{ background: '#F8F8F8', padding: '20px' }}>
                  <CardEyebrow>FLOW_01</CardEyebrow>
                  <CardTitle $size="1.1rem">Ask AI</CardTitle>
                  <CardText>Question the diagram in context.</CardText>
                </Card>
                <Card style={{ background: '#F8F8F8', padding: '20px' }}>
                  <CardEyebrow>FLOW_02</CardEyebrow>
                  <CardTitle $size="1.1rem">Review</CardTitle>
                  <CardText>Stage additions before they change the architecture.</CardText>
                </Card>
                <Card style={{ background: '#F8F8F8', padding: '20px' }}>
                  <CardEyebrow>FLOW_03</CardEyebrow>
                  <CardTitle $size="1.1rem">Connect</CardTitle>
                  <CardText>Accept and wire new tech into the diagram safely.</CardText>
                </Card>
              </div>
            </div>
          </FeatureCard>
        </FeatureGrid>
      </Section>

      <DesktopSection>
        <DesktopCopy>
          <TechLabel>SYSTEM_HARDWARE // MACOS_SILICON_READY</TechLabel>
          <DesktopTitle>The Elite <br/>Desktop Engine.</DesktopTitle>
          <HeroText style={{ color: '#aaa' }}>
            Experience Archflow as a dedicated industrial workstation. Native performance, distraction-free system design, and local draft persistence make the AI-assisted review workflow feel at home on desktop.
          </HeroText>
          {!isDesktop && (
            <div style={{ marginTop: '16px' }}>
              <a href="/downloads/Archflow.zip" download>
                <Button $variant="primary" $size="lg" style={{ background: '#fff', color: '#000' }}>
                  DOWNLOAD_FOR_MAC_V1.0
                </Button>
              </a>
            </div>
          )}
        </DesktopCopy>
        <DesktopPreview>
           <img 
             src="/images/processor.png" 
             alt="Archflow Engine"
             style={{ filter: 'invert(1)', maxWidth: '100%', height: 'auto' }}
           />
        </DesktopPreview>
      </DesktopSection>
    </Page>
  );
}
