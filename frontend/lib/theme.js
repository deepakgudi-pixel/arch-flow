export const theme = {
  colors: {
    ink: '#000000',
    inkMuted: '#404040',
    inkSoft: '#737373',
    canvas: '#F2F2F2',
    canvasAlt: '#E5E5E5',
    panel: '#FFFFFF',
    panelMuted: '#FAFAFA',
    panelStrong: '#D4D4D4',
    line: '#000000',
    lineStrong: '#000000',
    brand: '#000000',
    brandHover: '#262626',
    brandSoft: '#E5E5E5',
    accent: '#000000',
    accentSoft: '#F5F5F5',
    signal: '#FF3D00',
    signalSoft: '#FFEFEE',
    success: '#00C853',
    successSoft: '#E8F5E9',
    warning: '#FFAB00',
    warningSoft: '#FFF8E1',
    error: '#D50000',
    errorSoft: '#FFEBEE'
  },
  gradients: {
    hero: 'none',
    shell: 'none',
    cardGlow: 'none'
  },
  shadows: {
    sm: '4px 4px 0px #000000',
    md: '8px 8px 0px #000000',
    lg: '12px 12px 0px #000000'
  },
  radii: {
    sm: '0px',
    md: '0px',
    lg: '0px',
    pill: '999px'
  },
  spacing: {
    xs: '12px',
    sm: '20px',
    md: '32px',
    lg: '48px',
    xl: '72px',
    xxl: '96px'
  },
  layout: {
    pageWidth: '1600px',
    textWidth: '960px'
  },
  fonts: {
    sans: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
    display: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Menlo', monospace"
  },
  borders: {
    thin: '1px solid #000000',
    medium: '2px solid #000000',
    thick: '4px solid #000000'
  }
};

export const categoryColors = {
  frontend: '#000000',
  backend: '#000000',
  database: '#000000',
  queue: '#000000',
  auth: '#000000',
  storage: '#000000',
  external: '#000000',
  devops: '#000000'
};

export const clerkAppearance = {
  variables: {
    colorPrimary: '#000000',
    colorText: '#000000',
    colorTextSecondary: '#404040',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#FFFFFF',
    colorInputText: '#000000',
    borderRadius: '0px'
  },
  elements: {
    rootBox: {
      width: '100%'
    },
    card: {
      boxShadow: '8px 8px 0px #000000',
      border: '3px solid #000000',
      borderRadius: '0px',
      background: '#FFFFFF'
    },
    headerTitle: {
      fontFamily: theme.fonts.display,
      fontSize: '1.8rem',
      fontWeight: 800,
      letterSpacing: '-0.04em',
      color: '#000000'
    },
    headerSubtitle: {
      fontFamily: theme.fonts.mono,
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      color: '#404040'
    },
    socialButtonsBlockButton: {
      borderRadius: '0px',
      border: '2px solid #000000',
      boxShadow: '2px 2px 0px #000000',
      '&:hover': {
        backgroundColor: '#F5F5F5',
        transform: 'translate(-1px, -1px)',
        boxShadow: '3px 3px 0px #000000'
      }
    },
    formButtonPrimary: {
      background: '#000000',
      borderRadius: '0px',
      border: '2px solid #000000',
      boxShadow: '4px 4px 0px #000000',
      fontSize: '0.9rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      '&:hover': {
        background: '#262626',
        transform: 'translate(-2px, -2px)',
        boxShadow: '6px 6px 0px #000000'
      }
    },
    formFieldInput: {
      borderRadius: '0px',
      border: '2px solid #000000',
      padding: '12px',
      '&:focus': {
        border: '2px solid #000000',
        boxShadow: '4px 4px 0px #000000'
      }
    },
    footerActionLink: {
      color: '#000000',
      fontWeight: 700,
      textDecoration: 'underline'
    }
  }
};

export default theme;
