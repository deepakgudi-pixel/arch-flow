'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Command, 
  ArrowRight, 
  Layout, 
  Plus,
  Loader2,
  Cpu
} from 'lucide-react';
import { BottomBar, PromptInput, TemplateSelect } from '../editorStyles';
import { architectureExamples, getArchitectureExamplePrompt } from '@/lib/architectureExamples';
import {
  PromptBarPositioner, GenerateButton, IconWrapper, PromptActions, TemplateSelectWrap,
  ButtonContent, SpinnerWrap
} from './PromptBar.styles';

export default function PromptBar({
  prompt, onPromptChange,
  template, onTemplateChange,
  loading, onGenerate,
  activeExample = null
}) {
  const handleTemplateChange = (event) => {
    const nextTemplate = event.target.value;
    onTemplateChange(nextTemplate);

    if (nextTemplate.startsWith('example:')) {
      const examplePrompt = getArchitectureExamplePrompt(nextTemplate.replace('example:', ''));
      if (examplePrompt) {
        onPromptChange(examplePrompt);
      }
    }
  };

  return (
    <PromptBarPositioner>
      <BottomBar
        as={motion.div}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        <IconWrapper>
          <Cpu size={18} />
        </IconWrapper>
        
        <PromptInput
          placeholder="Describe any system..."
          value={prompt}
          onChange={e => onPromptChange(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && onGenerate()}
        />

        <PromptActions>
          <TemplateSelectWrap>
            <TemplateSelect value={template} onChange={handleTemplateChange} aria-label="Architecture template">
              {activeExample && (
                <optgroup label="Current demo">
                  <option value={`example:${activeExample.id}`}>
                    {activeExample.name} system design
                  </option>
                </optgroup>
              )}
              <optgroup label="Starter systems">
                <option value="blank">Blank Canvas</option>
                <option value="saas">SaaS Platform</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="mobile">Mobile Backend</option>
                <option value="realtime">Realtime System</option>
                <option value="microservices">Microservices</option>
              </optgroup>
              {!activeExample && (
                <optgroup label="Recruiter-ready examples">
                  {architectureExamples.map(example => (
                    <option key={example.id} value={`example:${example.id}`}>
                      {example.name} · {example.audience}
                    </option>
                  ))}
                </optgroup>
              )}
            </TemplateSelect>
          </TemplateSelectWrap>

          <GenerateButton onClick={onGenerate} disabled={loading || !prompt.trim()}>
            <AnimatePresence mode="wait">
              {loading ? (
                <ButtonContent
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <SpinnerWrap
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 size={16} />
                  </SpinnerWrap>
                  <span>Synthesizing</span>
                </ButtonContent>
              ) : (
                <ButtonContent
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Sparkles size={16} />
                  <span>Synthesize</span>
                </ButtonContent>
              )}
            </AnimatePresence>
          </GenerateButton>
        </PromptActions>
      </BottomBar>
    </PromptBarPositioner>
  );
}
