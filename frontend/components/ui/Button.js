import styled, { css } from 'styled-components';

const variantStyles = {
  primary: css`
    background: #000000;
    color: #ffffff;
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background: #1a1a1a;
      transform: translateY(-1px);
      box-shadow: none;
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  secondary: css`
    background: #ffffff;
    color: #000000;
    border: 1px solid rgba(0, 0, 0, 0.1);

    &:hover:not(:disabled) {
      background: #f9f9f9;
      border-color: rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
      box-shadow: none;
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  ghost: css`
    background: transparent;
    color: #000000;
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.03);
    }
  `,
  danger: css`
    background: #ffffff;
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);

    &:hover:not(:disabled) {
      background: #fff5f5;
      border-color: #ef4444;
      transform: translateY(-1px);
    }
  `,
  accent: css`
    background: rgba(0, 0, 0, 0.03);
    color: #000000;
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.05);
    }
  `
};

const sizeStyles = {
  sm: css`
    height: 36px;
    padding: 0 14px;
    font-size: 13px;
    border-radius: 8px;
  `,
  md: css`
    height: 44px;
    padding: 0 20px;
    font-size: 14px;
    border-radius: 10px;
  `,
  lg: css`
    height: 52px;
    padding: 0 28px;
    font-size: 15px;
    border-radius: 12px;
  `
};

export const Button = styled.button.attrs(props => ({
  type: props.type || 'button'
}))`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  white-space: nowrap;

  ${props => sizeStyles[props.$size || 'md']}
  ${props => variantStyles[props.$variant || 'secondary']}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    box-shadow: none;
    transform: none !important;
  }
`;

export const ButtonIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export default Button;
