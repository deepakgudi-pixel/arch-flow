'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, MessageSquareText, Send, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { CloseBtn } from '../editorStyles';
import {
  Panel, PanelHeader, TitleRow, TitleCluster, Title, IntroCard, IntroTitle, PromptRow,
  PromptChip, MessageList, ThinkingCard, ThinkingDot, MessageCard, MessageMeta, MessageRole,
  MessageText, Composer, ComposerBox, ComposerInput, ComposerFooter, HelperText, SendButton,
  BadgeRow
} from './DiagramAssistantPanel.styles';

const QUICK_PROMPTS = [
  'How is my diagram?',
  'Walk me through the request flow',
  'Explain this like I am learning system design',
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

        <BadgeRow>
          <Badge $tone="brand">Context aware</Badge>
          <Badge $tone={pendingSuggestionCount > 0 ? 'warning' : 'neutral'}>
            {pendingSuggestionCount} staged
          </Badge>
        </BadgeRow>

        <IntroCard>
          <IntroTitle>
            <Sparkles size={14} />
            Ask about flows, tradeoffs, or missing tech
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
            <Bot size={12} opacity={0.4} />
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
