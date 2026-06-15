import styled from 'styled-components';
import { motion } from 'framer-motion';

export const PromptBarPositioner = styled.div`
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: min(900px, 90vw);
  z-index: 100;
`;

export const GenerateButton = styled(motion.button)`
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

  @media (max-width: 760px) {
    flex: 1;
    justify-content: center;
  }
`;

export const IconWrapper = styled.div`
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

export const PromptActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 760px) {
    width: 100%;
  }
`;

export const TemplateSelectWrap = styled.div`
  position: relative;

  @media (max-width: 760px) {
    flex: 1.2;
    min-width: 0;
  }
`;

export const ButtonContent = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SpinnerWrap = styled(motion.div)`
  display: flex;
`;
