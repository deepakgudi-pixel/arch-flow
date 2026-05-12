'use client';

import styled from 'styled-components';
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
import { BottomBar, PromptInput, TemplateSelect } from './editorStyles';

const PromptBarPositioner = styled.div`
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: min(900px, 90vw);
  z-index: 100;
`;

const GenerateButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none;

  &:hover {
    background: #1a1a1a;
    transform: translateY(-1px);
    box-shadow: none;
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #444;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.05);
  color: #666;
  flex-shrink: 0;
  margin-left: 4px;
`;

export default function PromptBar({
  prompt, onPromptChange,
  template, onTemplateChange,
  loading, onGenerate
}) {
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
          placeholder="e.g. Instagram, YouTube, Uber, or describe any system..."
          value={prompt}
          onChange={e => onPromptChange(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && onGenerate()}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <TemplateSelect value={template} onChange={e => onTemplateChange(e.target.value)}>
              <option value="blank">Blank Canvas</option>
              <option value="saas">SaaS Platform</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="mobile">Mobile Backend</option>
              <option value="realtime">Realtime System</option>
              <option value="microservices">Microservices</option>
            </TemplateSelect>
          </div>

          <GenerateButton onClick={onGenerate} disabled={loading || !prompt.trim()}>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'flex' }}
                  >
                    <Loader2 size={16} />
                  </motion.div>
                  <span>Synthesizing</span>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Sparkles size={16} />
                  <span>Synthesize</span>
                </motion.div>
              )}
            </AnimatePresence>
          </GenerateButton>
        </div>
      </BottomBar>
    </PromptBarPositioner>
  );
}
