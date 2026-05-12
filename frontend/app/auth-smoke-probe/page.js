import styled from 'styled-components';

const ProbeWrap = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f4efe4;
  color: #000000;
  padding: 32px;
`;

const ProbeCard = styled.section`
  width: min(560px, 100%);
  border: 3px solid #000000;
  background: #ffffff;
  padding: 32px;
  display: grid;
  gap: 16px;
  box-shadow: none;
`;

const ProbeEyebrow = styled.div`
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const ProbeTitle = styled.h1`
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 900;
  line-height: 0.92;
  text-transform: uppercase;
`;

const ProbeText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #222222;
`;

export default function AuthSmokeProbePage() {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <ProbeWrap>
      <ProbeCard>
        <ProbeEyebrow>Auth Smoke Probe</ProbeEyebrow>
        <ProbeTitle>ARCHFLOW_AUTH_SMOKE_OK</ProbeTitle>
        <ProbeText>
          This development-only page confirms that a protected route can render when the
          local auth smoke bypass is active during local verification checks.
        </ProbeText>
      </ProbeCard>
    </ProbeWrap>
  );
}
