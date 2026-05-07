'use client';

import styled from 'styled-components';
import { Trash2 } from 'lucide-react';
import { Label, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Modal, { ModalFooter, ModalHeader, ModalTitle, ModalText } from '@/components/ui/Modal';

const ModalBody = styled.div`
  padding: 24px 0;
`;

const InviteRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const InviteInput = styled(Input)`
  flex: 1;
  font-size: 18px;
  text-align: center;
  letter-spacing: 4px;
  font-weight: 900;
`;

const HintText = styled.p`
  margin-top: 16px;
  font-size: 11px;
  color: #666;
  font-family: var(--font-mono);
  line-height: 1.4;
`;

const CollaboratorsSection = styled.div`
  margin-top: 24px;
`;

const CollaboratorsGrid = styled.div`
  margin-top: 8px;
  display: grid;
  gap: 8px;
`;

const CollaboratorRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f8f8;
  border: 1px solid #ddd;
  font-size: 12px;
`;

const CollaboratorEmail = styled.span`
  font-family: var(--font-mono);
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
`;

export default function InviteModal({
  open, onClose,
  inviteCode, isCopying, onCopyInvite,
  collaborators, onRemoveCollaborator
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>COLLABORATE_ACCESS</ModalTitle>
        <ModalText>Invite others to synthesize and edit this system architecture with you.</ModalText>
      </ModalHeader>
      <ModalBody>
        <Label>INVITE_CODE</Label>
        <InviteRow>
          <InviteInput
            readOnly
            value={inviteCode || 'GENERATING...'}
          />
          <Button $variant="primary" onClick={onCopyInvite} disabled={!inviteCode}>
            {isCopying ? 'COPIED' : 'COPY'}
          </Button>
        </InviteRow>
        <HintText>
          SHARE_THIS_CODE_WITH_COLLABORATORS. THEY CAN USE THE "JOIN_SYSTEM" BUTTON ON THEIR DASHBOARD.
        </HintText>

        {collaborators.length > 0 && (
          <CollaboratorsSection>
            <Label>ACTIVE_COLLABORATORS ({collaborators.length})</Label>
            <CollaboratorsGrid>
              {collaborators.map(colab => (
                <CollaboratorRow key={colab.id}>
                  <CollaboratorEmail>{colab.email}</CollaboratorEmail>
                  <RemoveBtn
                    onClick={() => onRemoveCollaborator(colab.id)}
                    title="REMOVE_ACCESS"
                  >
                    <Trash2 size={14} color="#ff4444" />
                  </RemoveBtn>
                </CollaboratorRow>
              ))}
            </CollaboratorsGrid>
          </CollaboratorsSection>
        )}
      </ModalBody>
      <ModalFooter>
        <Button $variant="secondary" onClick={onClose}>CLOSE</Button>
      </ModalFooter>
    </Modal>
  );
}
