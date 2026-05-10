'use client';

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
  border-bottom: 3px solid #000000;
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
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
`;

const IntroCard = styled.div`
  border: 3px solid #000000;
  background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
  padding: 16px;
  display: grid;
  gap: 10px;
`;

const IntroTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
`;

const PromptRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PromptChip = styled.button`
  border: 2px solid #000000;
  background: #ffffff;
  padding: 8px 10px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    transform: translate(-1px, -1px);
    background: #f5f5f5;
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

const EmptyConversation = styled.div`
  border: 2px dashed #000000;
  background: rgba(255, 255, 255, 0.92);
  padding: 18px;
  font-size: 12px;
  line-height: 1.6;
  color: #444444;
`;

const MessageCard = styled.div`
  align-self: ${props => props.$role === 'user' ? 'flex-end' : 'flex-start'};
  max-width: 92%;
  border: 3px solid #000000;
  background: ${props => props.$role === 'user' ? '#000000' : '#ffffff'};
  color: ${props => props.$role === 'user' ? '#ffffff' : '#000000'};
  padding: 14px 16px;
  display: grid;
  gap: 10px;
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
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  opacity: 0.82;
`;

const MessageText = styled.div`
  white-space: pre-wrap;
  font-size: 12px;
  line-height: 1.65;
`;

const Composer = styled.div`
  padding: 18px;
  border-top: 3px solid #000000;
  display: grid;
  gap: 12px;
  background: #ffffff;
`;

const ComposerBox = styled.div`
  border: 3px solid #000000;
  background: #f8f8f8;
  padding: 12px;
  display: grid;
  gap: 10px;
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

      <MessageList>
        {messages.length === 0 ? (
          <EmptyConversation>
            The assistant will answer against the current diagram, not just the text prompt. That lets it spot missing layers like backend, auth, storage, queues, or observability based on what is already on the canvas.
          </EmptyConversation>
        ) : (
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
