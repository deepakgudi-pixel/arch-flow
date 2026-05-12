import styled from 'styled-components';

export const Field = styled.div`
  display: grid;
  gap: 10px;
`;

export const Label = styled.label`
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-ink);
  letter-spacing: -0.01em;
`;

export const Hint = styled.p`
  font-size: 0.86rem;
  color: var(--color-ink-muted);
  line-height: 1.55;
`;

const controlStyles = `
  width: 100%;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-line);
  background: rgba(255, 255, 255, 0.86);
  color: var(--color-ink);
  min-height: 48px;
  padding: 0 16px;
  transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;

  &:focus {
    outline: none;
    border-color: rgba(37, 99, 235, 0.45);
    box-shadow: none;
    background: white;
  }

  &::placeholder {
    color: var(--color-ink-soft);
  }
`;

export const Input = styled.input`
  ${controlStyles}
`;

export const Textarea = styled.textarea`
  ${controlStyles}
  min-height: 120px;
  padding: 14px 16px;
  resize: vertical;
`;

export const Select = styled.select`
  ${controlStyles}
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--color-ink-soft) 50%), linear-gradient(135deg, var(--color-ink-soft) 50%, transparent 50%);
  background-position: calc(100% - 20px) calc(50% - 2px), calc(100% - 14px) calc(50% - 2px);
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
  padding-right: 38px;
`;

export default Input;
