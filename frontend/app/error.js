'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const Wrap = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background: var(--color-canvas);
`;

const Card = styled.section`
  width: min(680px, 100%);
  display: grid;
  gap: 20px;
  padding: 36px;
  border: 3px solid #000000;
  background: #ffffff;
  box-shadow: 10px 10px 0 #000000;
`;

const Eyebrow = styled.div`
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  font-size: clamp(2.2rem, 7vw, 4.2rem);
  line-height: 0.92;
  letter-spacing: -0.05em;
  text-transform: uppercase;
`;

const Copy = styled.p`
  font-size: 1rem;
  line-height: 1.7;
  color: #2b2b2b;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
`;

const ActionButton = styled.button`
  min-height: 52px;
  padding: 0 24px;
  border: 3px solid #000000;
  background: #000000;
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: 0.92rem;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
`;

const SecondaryLink = styled(Link)`
  min-height: 52px;
  padding: 0 24px;
  border: 3px solid #000000;
  background: #ffffff;
  color: #000000;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.92rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const ErrorMeta = styled.pre`
  overflow: auto;
  padding: 16px;
  border: 2px solid #000000;
  background: #f7f4ed;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  white-space: pre-wrap;
  word-break: break-word;
`;

export default function GlobalErrorPage({ error, reset }) {
  useEffect(() => {
    console.error('Route error boundary caught an error:', error);
  }, [error]);

  return (
    <Wrap>
      <Card>
        <Eyebrow>System Recovery</Eyebrow>
        <Title>We hit a route failure.</Title>
        <Copy>
          Archflow caught the crash before it turned into a blank screen. You can retry this view,
          go back to the dashboard, or reload the page and continue from the last saved state.
        </Copy>
        <Actions>
          <ActionButton onClick={reset}>Retry view</ActionButton>
          <SecondaryLink href="/dashboard">Open dashboard</SecondaryLink>
        </Actions>
        {error?.message ? <ErrorMeta>{error.message}</ErrorMeta> : null}
      </Card>
    </Wrap>
  );
}
