import { Card, CardText, CardTitle } from '@/components/ui/Card';
import styled from 'styled-components';

const Wrap = styled(Card)`
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 14px;
  padding: 42px 34px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(246, 249, 252, 0.96) 100%);
`;

const Icon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  background: var(--gradient-card-glow);
  color: var(--color-brand);
  font-size: 1.8rem;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
`;

export default function EmptyState({ icon, title, description, actions }) {
  return (
    <Wrap $elevated>
      {icon ? <Icon>{icon}</Icon> : null}
      <CardTitle as="h3" $size="1.35rem">{title}</CardTitle>
      {description ? <CardText>{description}</CardText> : null}
      {actions ? <Actions>{actions}</Actions> : null}
    </Wrap>
  );
}
