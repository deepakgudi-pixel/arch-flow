'use client';

import styled from 'styled-components';

const ZoneContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0px, rgba(0, 0, 0, 0.02) 72px, rgba(0, 0, 0, 0.015) 100%),
    repeating-linear-gradient(
      180deg,
      transparent 0px,
      transparent 38px,
      rgba(0, 0, 0, 0.035) 38px,
      rgba(0, 0, 0, 0.035) 39px
    );
  border: 2px dashed rgba(0, 0, 0, 0.18);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 14px 16px;
  pointer-events: none;
`;

const ZoneHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

const ZoneLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.78);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(0, 0, 0, 0.2);
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
`;

const ZoneMeta = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

export function ZoneNode({ data }) {
  return (
    <ZoneContainer>
      <ZoneHeader>
        <ZoneLabel>{data.label}_ZONE</ZoneLabel>
        <ZoneMeta>{data.count || 0}_TECH</ZoneMeta>
      </ZoneHeader>
    </ZoneContainer>
  );
}
