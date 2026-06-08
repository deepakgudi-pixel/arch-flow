import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';

export function useDiagramCollaboration({ diagramId, setToast }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [collaborators, setCollaborators] = useState([]);

  const fetchInviteCode = useCallback(async () => {
    try {
      const data = await api.getInviteCode(diagramId);
      setInviteCode(data.inviteCode);

      const colabs = await api.getCollaborators(diagramId);
      setCollaborators(colabs);
    } catch (err) {
      console.error('Failed to load collaboration data:', err);
    }
  }, [diagramId]);

  const handleRemoveCollaborator = useCallback(async (userId) => {
    try {
      await api.removeCollaborator(diagramId, userId);
      setCollaborators(prev => prev.filter(c => c.id !== userId));
      setToast({ message: 'COLLABORATOR_REMOVED', error: false });
    } catch (err) {
      console.error('Failed to remove collaborator:', err);
      setToast({ message: 'REMOVE_FAILED', error: true });
    }
  }, [diagramId, setToast]);

  useEffect(() => {
    if (showInviteModal && !inviteCode) {
      fetchInviteCode();
    }
  }, [fetchInviteCode, inviteCode, showInviteModal]);

  const copyInvite = useCallback(() => {
    try {
      navigator.clipboard.writeText(inviteCode);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    } catch {
      setToast({ message: 'Failed to copy - browser denied clipboard access', error: true });
      setTimeout(() => setToast(null), 3000);
    }
  }, [inviteCode, setToast]);

  return {
    showInviteModal,
    setShowInviteModal,
    inviteCode,
    isCopying,
    copyInvite,
    collaborators,
    handleRemoveCollaborator
  };
}
