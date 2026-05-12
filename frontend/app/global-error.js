'use client';

import styled from 'styled-components';

const Wrap = styled.html`
  background: var(--color-canvas, #f4efe4);
`;

const Body = styled.body`
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const Card = styled.section`
  width: min(720px, 100%);
  padding: 36px;
  border: 3px solid #000000;
  background: #ffffff;
  box-shadow: none;
  display: grid;
  gap: 18px;
`;

const Eyebrow = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.2rem, 7vw, 4rem);
  line-height: 0.92;
  letter-spacing: -0.05em;
  text-transform: uppercase;
`;

const Copy = styled.p`
  margin: 0;
  line-height: 1.7;
  color: #2b2b2b;
`;

const ActionButton = styled.button`
  min-height: 52px;
  width: fit-content;
  padding: 0 24px;
  border: 3px solid #000000;
  background: #000000;
  color: #ffffff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.92rem;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
`;

export default function GlobalError({ reset }) {
  return (
    <Wrap>
      <Body>
        <Card>
          <Eyebrow>System Recovery</Eyebrow>
          <Title>Archflow failed to boot cleanly.</Title>
          <Copy>
            The app stopped before rendering normally. Retry first. If this keeps happening,
            check the environment configuration or restart the local services.
          </Copy>
          <ActionButton onClick={reset}>Retry boot</ActionButton>
        </Card>
      </Body>
    </Wrap>
  );
}
