'use client';

import { ZoneContainer, ZoneHeader, ZoneLabel, ZoneMeta } from './ZoneNode.styles';

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
