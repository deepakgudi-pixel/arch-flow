import styled from 'styled-components';
import { Input } from '@/components/ui/Input';

export const ModalBody = styled.div`
  padding: 24px 0;
`;

export const InviteRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

export const InviteInput = styled(Input)`
  flex: 1;
  font-size: 18px;
  text-align: center;
  letter-spacing: 4px;
  font-weight: 900;
`;

export const HintText = styled.p`
  margin-top: 16px;
  font-size: 11px;
  color: #666;
  font-family: var(--font-mono);
  line-height: 1.4;
`;

export const CollaboratorsSection = styled.div`
  margin-top: 24px;
`;

export const CollaboratorsGrid = styled.div`
  margin-top: 8px;
  display: grid;
  gap: 8px;
`;

export const CollaboratorRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f8f8;
  border: 1px solid #ddd;
  font-size: 12px;
`;

export const CollaboratorEmail = styled.span`
  font-family: var(--font-mono);
`;

export const RemoveBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
`;
