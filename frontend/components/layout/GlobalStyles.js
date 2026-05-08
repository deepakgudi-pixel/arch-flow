'use client';

import { createGlobalStyle } from 'styled-components';
import { theme } from '@/lib/theme';

const GlobalStyleSheet = createGlobalStyle`
  :root {
    color-scheme: light;
    --color-ink: ${theme.colors.ink};
    --color-ink-muted: ${theme.colors.inkMuted};
    --color-ink-soft: ${theme.colors.inkSoft};
    --color-canvas: ${theme.colors.canvas};
    --color-canvas-alt: ${theme.colors.canvasAlt};
    --color-panel: ${theme.colors.panel};
    --color-panel-muted: ${theme.colors.panelMuted};
    --color-panel-strong: ${theme.colors.panelStrong};
    --color-line: ${theme.colors.line};
    --color-line-strong: ${theme.colors.lineStrong};
    --color-brand: ${theme.colors.brand};
    --color-brand-hover: ${theme.colors.brandHover};
    --color-brand-soft: ${theme.colors.brandSoft};
    --color-accent: ${theme.colors.accent};
    --color-accent-soft: ${theme.colors.accentSoft};
    --color-signal: ${theme.colors.signal};
    --color-signal-soft: ${theme.colors.signalSoft};
    --color-success: ${theme.colors.success};
    --color-success-soft: ${theme.colors.successSoft};
    --color-warning: ${theme.colors.warning};
    --color-warning-soft: ${theme.colors.warningSoft};
    --color-error: ${theme.colors.error};
    --color-error-soft: ${theme.colors.errorSoft};
    --shadow-sm: ${theme.shadows.sm};
    --shadow-md: ${theme.shadows.md};
    --shadow-lg: ${theme.shadows.lg};
    --radius-sm: ${theme.radii.sm};
    --radius-md: ${theme.radii.md};
    --radius-lg: ${theme.radii.lg};
    --radius-pill: ${theme.radii.pill};
    --page-width: ${theme.layout.pageWidth};
    --text-width: ${theme.layout.textWidth};
    --spacing-xs: ${theme.spacing.xs};
    --spacing-sm: ${theme.spacing.sm};
    --spacing-md: ${theme.spacing.md};
    --spacing-lg: ${theme.spacing.lg};
    --spacing-xl: ${theme.spacing.xl};
    --spacing-xxl: ${theme.spacing.xxl};
    --font-sans: ${theme.fonts.sans};
    --font-display: ${theme.fonts.display};
    --font-mono: ${theme.fonts.mono};
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    cursor: crosshair;
  }

  html {
    scroll-behavior: smooth;
    background-color: var(--color-canvas);
  }

  body {
    font-family: ${theme.fonts.sans};
    background: var(--color-canvas);
    color: var(--color-ink);
    min-height: 100vh;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    position: relative;
    overflow-x: hidden;
  }

  body::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.05;
    z-index: 9999;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: ${theme.fonts.display};
    letter-spacing: -0.04em;
    font-weight: 800;
    text-transform: uppercase;
  }

  a {
    color: inherit;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  a:hover {
    text-decoration: underline;
    text-decoration-thickness: 2px;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  img {
    max-width: 100%;
    display: block;
    filter: grayscale(100%);
    transition: filter 0.3s ease;
  }

  img:hover {
    filter: grayscale(0%);
  }

  ::selection {
    background: var(--color-ink);
    color: var(--color-canvas);
  }

  /* 🧼 Clerk Branding Purge */
  .cl-internal-1dauvpw, 
  .cl-internal-pe6vm4,
  .cl-footer,
  .cl-internal-1fpq5at {
    display: none !important;
  }
`;

export default function GlobalStyles() {
  return <GlobalStyleSheet />;
}
