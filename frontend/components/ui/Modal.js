'use client';

import { useEffect } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1400;
`;

const Dialog = styled.div`
  width: min(600px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: #ffffff;
  border: 3px solid #000000;
  box-shadow: none;
  padding: 40px;
  border-radius: 0;
`;

export const ModalHeader = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 32px;
  border-bottom: 2px solid #eee;
  padding-bottom: 24px;
`;

export const ModalTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 900;
  color: #000;
  text-transform: uppercase;
  font-family: var(--font-mono);
  line-height: 1;
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
