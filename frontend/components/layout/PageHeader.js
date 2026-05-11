import styled from 'styled-components';

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-end;
  margin-bottom: 28px;
`;

const Copy = styled.div`
  max-width: 720px;
  display: grid;
  gap: 10px;
`;

const Eyebrow = styled.span`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-ink-soft);
`;

const Title = styled.h1`
  font-family: var(--font-sans);
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 0.98;
  font-weight: 800;
  color: var(--color-ink);
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--color-ink-muted);
  line-height: 1.7;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
`;

export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <Wrap>
      <Copy>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Title>{title}</Title>
        {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
      </Copy>
      {actions ? <Actions>{actions}</Actions> : null}
    </Wrap>
  );
}
