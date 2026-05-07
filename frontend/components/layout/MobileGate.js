'use client';

import styled from 'styled-components';

const BlockerContainer = styled.div`
  display: none;
  position: fixed;
  inset: 0;
  background: #ffffff;
  z-index: 99999;
  padding: 40px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const BlockerIcon = styled.div`
  font-size: 80px;
  margin-bottom: 32px;
  animation: pulse 2s infinite ease-in-out;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const BlockerTitle = styled.h1`
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 900;
  color: #000000;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const BlockerText = styled.p`
  font-family: var(--font-mono);
  font-size: 0.9rem;
  line-height: 1.6;
  color: #666;
  max-width: 320px;
  text-transform: uppercase;
`;

const BlockerStatus = styled.div`
  margin-top: 48px;
  padding: 12px 24px;
  border: 3px solid #000000;
  background: #000000;
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.2em;
`;

export default function MobileGate() {
  return (
    <BlockerContainer>
      <BlockerIcon>📟</BlockerIcon>
      <BlockerTitle>HARDWARE_RESTRICTION_ACTIVE</BlockerTitle>
      <BlockerText>
        System architecture synthesis requires high-precision input and a wide-field display. 
        Your current terminal is insufficiently equipped for the Archflow Mainframe.
        <br /><br />
        <strong>PLEASE VIEW THIS APP ON A DESKTOP OR PC FOR THE FULL EXPERIENCE.</strong>
      </BlockerText>
      <BlockerStatus>[!] AWAITING_DESKTOP_SYNCHRONIZATION...</BlockerStatus>
    </BlockerContainer>
  );
}
