'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Bot, MessageSquareText, Send, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ActionButton, CloseBtn } from './editorStyles';

const Panel = styled.div`
  width: 390px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PanelHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: grid;
  gap: 16px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const TitleCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h3`
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 700;
  color: #000;
`;

const IntroCard = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
  padding: 16px;
  display: grid;
  gap: 10px;
`;

const IntroTitle = styled.div`
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

const PromptRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PromptChip = styled.button`
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

const MessageList = styled.div`
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

const ThinkingCard = styled.div`
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

const ThinkingDot = styled.span`
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

const MessageCard = styled.div`
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

const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const MessageRole = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  opacity: 0.6;
`;

const MessageText = styled.div`
  white-space: pre-wrap;
  font-size: 12px;
  line-height: 1.65;
`;

const Composer = styled.div`
  padding: 18px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: grid;
  gap: 12px;
  background: #ffffff;
`;

const ComposerBox = styled.div`
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

const ComposerInput = styled.textarea`
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

const ComposerFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const HelperText = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: #666666;
  text-transform: uppercase;
`;

const SendButton = styled(ActionButton)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const QUICK_PROMPTS = [
  'How is my diagram?',
  'What is missing for this architecture?'
];

export default function DiagramAssistantPanel({
  messages,
  prompt,
  onPromptChange,
  onSend,
  loading,
  pendingSuggestionCount = 0,
  onClose
}) {
  const messageListRef = useRef(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <Panel>
      <PanelHeader>
        <TitleRow>
          <TitleCluster>
            <Bot size={18} />
            <Title>AI Architecture Assistant</Title>
          </TitleCluster>
          <CloseBtn type="button" onClick={onClose} aria-label="Close AI architecture assistant">
            ×
          </CloseBtn>
        </TitleRow>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge $tone="brand">Context Aware</Badge>
          <Badge $tone={pendingSuggestionCount > 0 ? 'warning' : 'neutral'}>
            Review Queue: {pendingSuggestionCount}
          </Badge>
        </div>

        <IntroCard>
          <IntroTitle>
            <Sparkles size={14} />
            Ask About Gaps, Risks, Or Missing Tech
          </IntroTitle>
          <PromptRow>
            {QUICK_PROMPTS.map(example => (
              <PromptChip
                key={example}
                type="button"
                onClick={() => onSend(example)}
                disabled={loading}
              >
                {example}
              </PromptChip>
            ))}
          </PromptRow>
        </IntroCard>
      </PanelHeader>

      <MessageList ref={messageListRef} aria-live="polite" aria-label="AI assistant conversation">
        {messages.length > 0 && (
          messages.map(message => (
            <MessageCard key={message.id} $role={message.role}>
              <MessageMeta>
                <MessageRole>
                  {message.role === 'user' ? <MessageSquareText size={12} /> : <Bot size={12} />}
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </MessageRole>
                {message.role === 'assistant' && message.suggestionsCount > 0 && (
                  <Badge $tone="warning">
                    {message.suggestionsCount} staged
                  </Badge>
                )}
              </MessageMeta>
              <MessageText>{message.content}</MessageText>
            </MessageCard>
          ))
        )}
        {loading && (
          <ThinkingCard aria-label="AI is thinking">
            <Bot size={12} style={{ opacity: 0.4 }} />
            <ThinkingDot $delay="0s" />
            <ThinkingDot $delay="0.2s" />
            <ThinkingDot $delay="0.4s" />
          </ThinkingCard>
        )}
      </MessageList>

      <Composer>
        <ComposerBox>
          <ComposerInput
            placeholder="Ask about missing tech, diagram gaps, or why a layer should exist..."
            value={prompt}
            onChange={event => onPromptChange(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
          />
          <ComposerFooter>
            <HelperText>Enter to send. Shift + Enter for a new line.</HelperText>
            <SendButton type="button" onClick={() => onSend()} disabled={loading || !prompt.trim()}>
              <Send size={14} />
              {loading ? 'Thinking...' : 'Send'}
            </SendButton>
          </ComposerFooter>
        </ComposerBox>
      </Composer>
    </Panel>
  );
}
