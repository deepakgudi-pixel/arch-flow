'use client';

import { Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Modal, { ModalFooter, ModalHeader, ModalTitle, ModalText } from '@/components/ui/Modal';
import {
  ModalBody, InviteRow, InviteInput, HintText, CollaboratorsSection, CollaboratorsGrid,
  CollaboratorRow, CollaboratorEmail, RemoveBtn
} from './InviteModal.styles';

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
            value={inviteCode || ''}
            placeholder={inviteCode ? '' : 'Click GENERATE to create invite code'}
          />
          <Button $variant="primary" onClick={onCopyInvite} disabled={!inviteCode}>
            {inviteCode ? (isCopying ? 'COPIED' : 'COPY') : 'GENERATE'}
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
