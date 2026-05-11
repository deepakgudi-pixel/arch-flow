'use client';

import styled, { createGlobalStyle } from 'styled-components';
import { usePathname } from 'next/navigation';

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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  z-index: 999999;
  padding: 20px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
  overscroll-behavior: none;
  touch-action: none;

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const BlockerIcon = styled.div`
  font-size: clamp(40px, 15vw, 80px);
  margin-bottom: 24px;
  animation: pulse 2s infinite ease-in-out;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const BlockerTitle = styled.h1`
  font-family: var(--font-mono);
  font-size: clamp(1rem, 5vw, 1.5rem);
  font-weight: 900;
  color: #000000;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0 10px;
`;

const BlockerText = styled.p`
  font-family: var(--font-mono);
  font-size: clamp(0.7rem, 3.5vw, 0.9rem);
  line-height: 1.6;
  color: #666;
  max-width: 90%;
  width: 320px;
  text-transform: uppercase;
  margin: 0 auto;
`;

const BlockerStatus = styled.div`
  margin-top: clamp(24px, 8vh, 48px);
  padding: 10px 20px;
  border: 3px solid #000000;
  background: #000000;
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: clamp(0.6rem, 3vw, 0.8rem);
  font-weight: 900;
  letter-spacing: 0.15em;
  max-width: 90%;
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
        <BlockerIcon>📟</BlockerIcon>
        <BlockerTitle>HARDWARE_RESTRICTION_ACTIVE</BlockerTitle>
        <BlockerText>
          System architecture synthesis requires high-precision input and a wide-field display. 
          Your current terminal is insufficiently equipped for the Archflow Mainframe.
          <br /><br />
          <strong style={{ color: '#000' }}>PLEASE VIEW THIS APP ON A DESKTOP OR PC FOR THE FULL EXPERIENCE.</strong>
        </BlockerText>
        <BlockerStatus>[!] AWAITING_DESKTOP_SYNCHRONIZATION...</BlockerStatus>
      </BlockerContainer>
    </>
  );
}
