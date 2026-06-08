'use client';

import { Database, Eye, Network, ShieldCheck } from 'lucide-react';
import { DIAGRAM_VIEW_MODES } from '@/lib/diagramViewModes';
import { ViewButton, ViewControlsShell } from './DiagramViewControls.styles';

const icons = {
  full: Eye,
  simplify: Network,
  data: Database,
  reliability: ShieldCheck
};

export default function DiagramViewControls({ value, onChange }) {
  return (
    <ViewControlsShell aria-label="Diagram view mode">
      {DIAGRAM_VIEW_MODES.map(mode => {
        const Icon = icons[mode.id] || Eye;
        return (
          <ViewButton
            key={mode.id}
            type="button"
            $active={value === mode.id}
            onClick={() => onChange(mode.id)}
            title={mode.label}
            aria-pressed={value === mode.id}
          >
            <Icon size={13} />
            <span>{mode.label}</span>
          </ViewButton>
        );
      })}
    </ViewControlsShell>
  );
}
