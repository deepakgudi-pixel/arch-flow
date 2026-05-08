'use client';
import styled from 'styled-components';
import { AlertTriangle, X } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  width: 400px;
  background: #ffffff;
  border: 4px solid #000000;
  box-shadow: 12px 12px 0px #000000;
  padding: 32px;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const WarningIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #ff4444;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #000000;
`;

const Title = styled.h2`
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 18px;
  text-transform: uppercase;
`;

const Message = styled.p`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.6;
  margin-bottom: 32px;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px;
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 12px;
  text-transform: uppercase;
  border: 3px solid #000000;
  cursor: pointer;
  transition: all 0.1s;
  background: ${props => props.$primary ? '#000' : '#fff'};
  color: ${props => props.$primary ? '#fff' : '#000'};
  box-shadow: 4px 4px 0px #000000;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #000000;
    background: ${props => props.$primary ? '#ff4444' : '#f0f0f0'};
    color: ${props => props.$primary ? '#fff' : '#000'};
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: none;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  &:hover { color: #ff4444; }
`;

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <Overlay>
      <Modal>
        <CloseButton onClick={onCancel}>
          <X size={20} strokeWidth={3} />
        </CloseButton>
        
        <Header>
          <WarningIcon>
            <AlertTriangle color="white" size={24} />
          </WarningIcon>
          <Title>{title || 'CONFIRM_ACTION'}</Title>
        </Header>

        <Message>{message || 'ARE_YOU_SURE_YOU_WANT_TO_PROCEED?'}</Message>

        <ButtonGroup>
          <Button onClick={onCancel}>ABORT_COMMAND</Button>
          <Button $primary onClick={onConfirm}>INITIATE_PURGE</Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}
