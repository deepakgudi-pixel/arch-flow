'use client';

import styled, { createGlobalStyle } from 'styled-components';
import { usePathname } from 'next/navigation';
import { MonitorUp } from 'lucide-react';

const MobileLockStyle = createGlobalStyle`
  @media (max-width: 1024px) {
    body, html {
      overflow: hidden !important;
      position: fixed;
      width: 100%;
      height: 100%;
    }
  }
`;

const BlockerContainer = styled.div`
  display: none;
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  z-index: 999999;
  padding: 28px;
  box-sizing: border-box;
  overscroll-behavior: none;
  touch-action: none;

  @media (max-width: 1024px) {
    display: grid;
    place-items: center;
  }
`;

const BlockerContent = styled.div`
  width: min(100%, 360px);
  display: grid;
  justify-items: center;
  gap: 18px;
  text-align: center;
`;

const BlockerIcon = styled.div`
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border: 2px solid #000000;
  background: #000000;
  color: #ffffff;
`;

const BlockerTitle = styled.h1`
  font-family: var(--font-sans);
  font-size: clamp(1.65rem, 7vw, 2.25rem);
  line-height: 1.05;
  font-weight: 900;
  color: #000000;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0;
`;

const BlockerText = styled.p`
  font-family: var(--font-sans);
  font-size: 0.95rem;
  line-height: 1.55;
  color: #5f5f5f;
  margin: 0;
`;

export default function MobileGate() {
  const pathname = usePathname();
  const bypassGate = pathname === '/auth-smoke-probe' || pathname === '/editor-smoke-probe';

  if (bypassGate) {
    return null;
  }

  return (
    <>
      <MobileLockStyle />
      <BlockerContainer>
        <BlockerContent>
          <BlockerIcon aria-hidden="true">
            <MonitorUp size={24} strokeWidth={2.5} />
          </BlockerIcon>
          <BlockerTitle>Open Archflow on desktop.</BlockerTitle>
          <BlockerText>
            Architecture diagrams need a wider canvas. Continue on a laptop or desktop.
          </BlockerText>
        </BlockerContent>
      </BlockerContainer>
    </>
  );
}
