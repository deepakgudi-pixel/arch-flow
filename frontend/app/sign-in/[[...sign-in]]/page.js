'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { clerkAppearance } from '@/lib/theme';
import ScrambleText from '@/components/ui/ScrambleText';
import { ArrowRight, Terminal, Shield, Activity, Fingerprint } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  background-color: var(--color-canvas);
  position: relative;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.section`
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 4px solid var(--color-ink);
  position: relative;
  overflow: hidden;

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 4px solid var(--color-ink);
    padding: 40px 24px;
  }
`;

const MainContent = styled.section`
  padding: 64px;
  display: grid;
  place-items: center;
  background-color: #ffffff;
  position: relative;

  @media (max-width: 1024px) {
    padding: 40px 24px;
  }
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-weight: 800;
  font-size: 1.2rem;
  text-transform: uppercase;
  color: var(--color-ink);
  padding: 8px 16px;
  border: 3px solid var(--color-ink);
  background: #ffffff;
  box-shadow: 4px 4px 0px var(--color-ink);
  width: fit-content;
  margin-bottom: 48px;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px var(--color-ink);
    text-decoration: none;
  }
`;

const Hero = styled.div`
  max-width: 640px;
`;

const Title = styled.h1`
  font-size: clamp(2.4rem, 6vw, 4.2rem);
  line-height: 0.9;
  margin-bottom: 24px;
  color: var(--color-ink);
  word-break: break-all;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 64px;
  font-family: var(--font-mono);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MetaItem = styled(motion.div)`
  padding: 20px;
  border: 2px solid var(--color-ink);
  background: var(--color-canvas-alt);
  
  h3 {
    font-size: 0.7rem;
    color: var(--color-ink-muted);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  p {
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
  }
`;

const DecorativeLine = styled.div`
  position: absolute;
  height: 100%;
  width: 1px;
  background: var(--color-ink);
  opacity: 0.1;
  left: 32px;
  top: 0;
`;

const StatusTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--color-ink);
  color: white;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 16px;
`;

export default function SignInPage() {
  return (
    <Container>
      <DecorativeLine style={{ left: '32px' }} />
      <DecorativeLine style={{ left: 'auto', right: '32px' }} />
      
      <Sidebar>
        <div>
          <Brand href="/">
            <Activity size={20} />
            Archflow
          </Brand>
          
          <Hero>
            <StatusTag>
              <div style={{ width: 8, height: 8, background: '#00C853', borderRadius: '50%' }} />
              System Online // Protocol 1.0
            </StatusTag>
            <Title>
              <ScrambleText text="AUTHENTICATE" delay={200} />
              <br />
              <ScrambleText text="ACCESS_KEY" delay={800} />
            </Title>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              style={{ fontSize: '1.1rem', color: 'var(--color-ink-muted)', lineHeight: 1.5, maxWidth: '480px' }}
            >
              Re-establish your connection to the design grid. Verify credentials to resume architectural synthesis and system modeling.
            </motion.p>
          </Hero>

          <MetaGrid>
            {[
              { icon: <Terminal size={14} />, label: 'Session_ID', value: 'ARCH-882-QX' },
              { icon: <Shield size={14} />, label: 'Encryption', value: 'AES-256-GCM' },
              { icon: <Fingerprint size={14} />, label: 'Auth_Method', value: 'CLERK_CLOUD' },
              { icon: <ArrowRight size={14} />, label: 'Redirect', value: '/DASHBOARD' },
            ].map((item, i) => (
              <MetaItem
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 + (i * 0.1) }}
              >
                <h3>{item.icon} {item.label}</h3>
                <p>{item.value}</p>
              </MetaItem>
            ))}
          </MetaGrid>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2 }}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-ink-muted)' }}
        >
          © 2026 ARCHFLOW SYSTEMS. ALL RIGHTS RESERVED. [BUILD_001]
        </motion.div>
      </Sidebar>

      <MainContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          style={{ width: '100%', maxWidth: '440px' }}
        >
          <SignIn
            appearance={clerkAppearance}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/dashboard"
          />
        </motion.div>
      </MainContent>
    </Container>
  );
}
