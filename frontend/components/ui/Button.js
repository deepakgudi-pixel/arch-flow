import styled, { css } from 'styled-components';

const variantStyles = {
  primary: css`
    background: #000000;
    color: #ffffff;
    border: 3px solid #000000;
    box-shadow: 4px 4px 0px #000000;

    &:hover:not(:disabled) {
      background: #262626;
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0px #000000;
    }

    &:active:not(:disabled) {
      transform: translate(0, 0);
      box-shadow: 2px 2px 0px #000000;
    }
  `,
  secondary: css`
    background: #ffffff;
    color: #000000;
    border: 3px solid #000000;
    box-shadow: 4px 4px 0px #000000;

    &:hover:not(:disabled) {
      background: #F2F2F2;
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0px #000000;
    }

    &:active:not(:disabled) {
      transform: translate(0, 0);
      box-shadow: 2px 2px 0px #000000;
    }
  `,
  ghost: css`
    background: transparent;
    color: #000000;
    border: 3px solid transparent;

    &:hover:not(:disabled) {
      background: #F2F2F2;
      border-color: #000000;
    }
  `,
  danger: css`
    background: #FFEFEE;
    color: #D50000;
    border: 3px solid #000000;
    box-shadow: 4px 4px 0px #000000;

    &:hover:not(:disabled) {
      background: #FFDEDC;
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0px #000000;
    }
  `,
  accent: css`
    background: #F2F2F2;
    color: #000000;
    border: 3px solid #000000;
    box-shadow: 4px 4px 0px #000000;

    &:hover:not(:disabled) {
      background: #E5E5E5;
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0px #000000;
    }
  `
};

const sizeStyles = {
  sm: css`
    height: 40px;
    padding: 0 16px;
    font-size: 0.85rem;
  `,
  md: css`
    height: 52px;
    padding: 0 24px;
    font-size: 0.92rem;
  `,
  lg: css`
    height: 64px;
    padding: 0 32px;
    font-size: 1rem;
  `
};

export const Button = styled.button.attrs(props => ({
  type: props.type || 'button'
}))`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: var(--font-mono);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  border-radius: 0;

  ${props => sizeStyles[props.$size || 'md']}
  ${props => variantStyles[props.$variant || 'secondary']}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    box-shadow: none;
    transform: none;
  }
`;

export const ButtonIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export default Button;
