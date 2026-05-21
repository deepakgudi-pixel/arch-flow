import styled from 'styled-components';
import { ActionButton } from '../editorStyles';

export const Panel = styled.div`
  width: 390px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const PanelHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: grid;
  gap: 16px;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const TitleCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Title = styled.h3`
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 700;
  color: #000;
`;

export const IntroCard = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
  padding: 16px;
  display: grid;
  gap: 10px;
`;

export const IntroTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  color: #0369a1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const PromptRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const PromptChip = styled.button`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: #ffffff;
  padding: 6px 10px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  color: #444;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(0, 0, 0, 0.15);
    background: #f9f9f9;
    transform: translateY(-1px);
  }
`;

export const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px) 0 0 / 100% 38px,
    #fafafa;
`;

export const ThinkingCard = styled.div`
  align-self: flex-start;
  max-width: 92%;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: #ffffff;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: none;
`;

export const ThinkingDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #aaa;
  display: inline-block;
  animation: thinking-pulse 1.2s ease-in-out infinite;
  animation-delay: ${props => props.$delay || '0s'};

  @keyframes thinking-pulse {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
    40% { opacity: 1; transform: scale(1.1); }
  }
`;

export const MessageCard = styled.div`
  align-self: ${props => props.$role === 'user' ? 'flex-end' : 'flex-start'};
  max-width: 92%;
  border-radius: 16px;
  border: 1px solid ${props => props.$role === 'user' ? 'transparent' : 'rgba(0, 0, 0, 0.05)'};
  background: ${props => props.$role === 'user' ? '#000000' : '#ffffff'};
  color: ${props => props.$role === 'user' ? '#ffffff' : '#000000'};
  padding: 14px 16px;
  display: grid;
  gap: 10px;
  box-shadow: none;
`;

export const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const MessageRole = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  opacity: 0.6;
`;

export const MessageText = styled.div`
  white-space: pre-wrap;
  font-size: 12px;
  line-height: 1.65;
`;

export const Composer = styled.div`
  padding: 18px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: grid;
  gap: 12px;
  background: #ffffff;
`;

export const ComposerBox = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background: #fcfcfc;
  padding: 12px;
  display: grid;
  gap: 10px;
  transition: all 0.2s;

  &:focus-within {
    border-color: #000;
    background: #fff;
    box-shadow: none;
  }
`;

export const ComposerInput = styled.textarea`
  width: 100%;
  min-height: 110px;
  resize: vertical;
  border: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.6;

  &:focus {
    outline: none;
  }
`;

export const ComposerFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const HelperText = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: #666666;
  text-transform: uppercase;
`;

export const SendButton = styled(ActionButton)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
