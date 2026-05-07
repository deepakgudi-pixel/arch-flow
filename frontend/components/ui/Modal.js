'use client';

import { useEffect } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(11, 19, 32, 0.56);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1400;
`;

const Dialog = styled.div`
  width: min(760px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(215, 225, 234, 0.8);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 28px;
`;

export const ModalHeader = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 22px;
`;

export const ModalTitle = styled.h2`
  font-size: 1.55rem;
  font-weight: 800;
  color: var(--color-ink);
`;

export const ModalText = styled.p`
  color: var(--color-ink-muted);
  line-height: 1.6;
`;

export const ModalFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={event => event.stopPropagation()}>
        {children}
      </Dialog>
    </Overlay>
  );
}
