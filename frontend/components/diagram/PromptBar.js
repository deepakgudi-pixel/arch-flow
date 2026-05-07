'use client';

import styled from 'styled-components';
import { BottomBar, PromptInput, TemplateSelect } from './editorStyles';

const GenerateButton = styled.button`
  padding: 16px 32px;
  font-size: 14px;
  font-family: var(--font-mono);
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  border: 3px solid #000000;
  background: #000000;
  color: #ffffff;
  transition: all 0.1s;
  &:hover {
    transform: translate(-1px, -1px);
  }
  &:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export default function PromptBar({
  prompt, onPromptChange,
  template, onTemplateChange,
  loading, onGenerate
}) {
  return (
    <BottomBar>
      <PromptInput
        placeholder="DESCRIBE_ARCHITECTURE_REQS_HERE..."
        value={prompt}
        onChange={e => onPromptChange(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && onGenerate()}
      />
      <TemplateSelect value={template} onChange={e => onTemplateChange(e.target.value)}>
        <option value="blank">BLANK_CANVAS</option>
        <option value="saas">SAAS_PLATFORM</option>
        <option value="ecommerce">E_COMMERCE_STACK</option>
        <option value="realtime">REALTIME_SYSTEM</option>
      </TemplateSelect>
      <GenerateButton onClick={onGenerate} disabled={loading}>
        {loading ? 'SYNTHESIZING...' : 'INITIATE_SYNTHESIS'}
      </GenerateButton>
    </BottomBar>
  );
}
