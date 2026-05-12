'use client';

import styled, { createGlobalStyle } from 'styled-components';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardEyebrow, CardText, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import ArchitectureDiagramSvg from '@/components/diagram/ArchitectureDiagramSvg';

const Page = styled.div`
  min-height: 100vh;
  position: relative;
  background-color: var(--color-canvas);
`;

const DiagramAnimationStyles = createGlobalStyle`
  @keyframes af-node-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes af-edge-draw {
    from { stroke-dashoffset: 300; }
    to   { stroke-dashoffset: 0; }
  }
  .af-node {
    opacity: 0;
    animation: af-node-in 0.45s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  .af-edge {
    stroke-dasharray: 300;
    stroke-dashoffset: 300;
    animation: af-edge-draw 0.8s cubic-bezier(0.16,1,0.3,1) forwards;
  }
`;

const Nav = styled.header`
  position: relative;
  max-width: var(--page-width);
  margin: 0 auto;
  padding: 32px var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 16px;
  color: #000;
  
  &:hover {
    text-decoration: none;
  }
`;

const BrandMark = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
  color: white;
  box-shadow: none;
  font-size: 1.1rem;
  font-weight: 800;
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const NavLink = styled.a`
  padding: 8px 16px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 700;
  color: #666;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: #000;
    background: rgba(0, 0, 0, 0.04);
    text-decoration: none;
    transform: translateY(-1px);
  }
`;

const Hero = styled.section`
  position: relative;
  max-width: var(--page-width);
  margin: 0 auto;
  padding: var(--spacing-xxl) var(--spacing-xl);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 48px;
  }
`;

const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
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
  margin-top: auto;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-lg);
  
  a {
    display: inline-block;
    width: 200px;
  }
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
  padding: var(--spacing-xxl) var(--spacing-xl);
`;

const SectionHeader = styled.div`
  max-width: 900px;
  display: grid;
  gap: var(--spacing-md);
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
  gap: var(--spacing-md);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(Card)`
  grid-column: span ${props => props.$span || 4};
  display: grid;
  gap: var(--spacing-md);

  @media (max-width: 1024px) {
    grid-column: span 1;
  }
`;

const DesktopSection = styled.section`
  max-width: var(--page-width);
  margin: 64px auto;
  padding: var(--spacing-xxl) var(--spacing-xl);
  background: #000;
  color: #fff;
  border: 8px solid #000;
  display: grid;
  grid-template-columns: minmax(0, 600px) minmax(0, 600px);
  justify-content: center;
  gap: var(--spacing-xl);
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
  gap: var(--spacing-md);
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
    box-shadow: none;
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

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
};

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
    if (typeof window !== 'undefined' && (window.archflowDesktopStorage || window.navigator.userAgent.includes('ArchflowDesktop'))) {
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
      <DiagramAnimationStyles />
      <Nav>
        <Brand href="/">
          <BrandMark>⬡</BrandMark>
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#000' }}>Archflow</span>
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
        <HeroCopy as={motion.div} {...fadeUp}>
          <HeroTitle>
            Architecture
            <span>That Ships.</span>
          </HeroTitle>
          <HeroText>
            Move from vague ideas to production-ready architecture decisions in a high-fidelity workspace designed for system thinking.
          </HeroText>
          <HeroActions>
            <Link href={isSignedIn ? '/dashboard' : '/sign-up'}>
              <Button $variant="primary" $size="lg" $fullWidth>Start workspace</Button>
            </Link>
          </HeroActions>
        </HeroCopy>
        <Preview as={motion.div} $elevated {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '11px' }}>E-COMMERCE_PLATFORM_V2</span>
            </div>
            <Badge $tone="accent">AI REVIEW PASS</Badge>
          </div>
          <div style={{
            padding: '35px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <ArchitectureDiagramSvg />
          </div>
        </Preview>
      </Hero>

      <Section id="product">
        <SplitSectionHeader as={motion.div} {...fadeUp}>
          <SectionTitle>Engineered for the messy middle of design.</SectionTitle>
          <SectionBodyText>
            Archflow bridges the gap between rough sketches and implementation specs with a workspace that carries engineering context into every node, every connection, and every AI-assisted review step.
          </SectionBodyText>
        </SplitSectionHeader>

        <FeatureGrid>
          <FeatureCard as={motion.div} $span={6} $elevated style={{ overflow: 'hidden' }} {...fadeUp}>
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
          
          <FeatureCard as={motion.div} $span={6} $elevated style={{ overflow: 'hidden' }} {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
            {tracing && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${progress2}%`,
                background: 'linear-gradient(90deg, #67E8F9 0%, #22D3EE 100%)',
                opacity: 0.15,
                transition: 'width 0.2s ease-out',
                zIndex: 0
              }} />
            )}
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
                  {tracing ? 'STAGING...' : 'Accept & Connect'}
                </Button>
                {tracing && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 900 }}>
                    {Math.round(progress2)}% STAGED
                  </span>
                )}
              </div>
            </div>
          </FeatureCard>

          <FeatureCard as={motion.div} $span={12} $elevated {...fadeUp}>
            <div style={{ display: 'grid', gap: '18px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <Badge $tone="neutral">MODULE_03</Badge>
              </div>
              <CardTitle>Built for iterative architecture work, not one-shot generation.</CardTitle>
              <CardText>
                Pending AI chat and staged review items survive refreshes, accepted suggestions connect into the diagram, and the review layer uses rule-aware checks so users can grow complex systems without losing clarity or control.
              </CardText>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
                <Card style={{ background: '#F8F8F8', padding: '20px', boxShadow: 'none', borderRadius: '12px' }}>
                  <CardEyebrow>FLOW_01</CardEyebrow>
                  <CardTitle $size="1.1rem">Ask AI</CardTitle>
                  <CardText>Question the diagram in context.</CardText>
                </Card>
                <Card style={{ background: '#F8F8F8', padding: '20px', boxShadow: 'none', borderRadius: '12px' }}>
                  <CardEyebrow>FLOW_02</CardEyebrow>
                  <CardTitle $size="1.1rem">Review</CardTitle>
                  <CardText>Stage additions before they change the architecture.</CardText>
                </Card>
                <Card style={{ background: '#F8F8F8', padding: '20px', boxShadow: 'none', borderRadius: '12px' }}>
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
        <DesktopCopy as={motion.div} {...fadeUp}>
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
        <DesktopPreview as={motion.div} {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
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
