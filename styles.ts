// --- Design System Tokens ---

// Achromatic Color System with a single, vibrant accent
export const colors = {
  background: '#0a0a0a',
  surface: 'rgba(16, 16, 16, 0.7)',
  surfaceGlow: 'rgba(26, 26, 26, 0.9)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#f0f0f0',
  textSecondary: '#a0a0a0',
  textPlaceholder: '#666666',
  accent: '#0099FF',
  accentHover: '#33B2FF',
  accentActive: '#0077CC',
  accentGlow: 'rgba(0, 153, 255, 0.3)',
};

// 4pt Baseline Grid System
export const spacing = {
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

// Rounded Shape System
export const radii = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  full: '9999px',
};

// Fluid Motion System
export const transitions = {
  fast: 'all 150ms ease-in-out',
  medium: 'all 300ms ease-in-out',
};

// Subtle Effect System
export const shadows = {
  soft: '0 8px 32px rgba(0, 0, 0, 0.4)',
  glow: `0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.accent}`,
};

// Typography System
export const typography = {
  fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
  h1: { fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 },
  h2: { fontSize: '20px', fontWeight: 500, margin: 0 },
  body: { fontSize: '14px', fontWeight: 400, margin: 0 },
  label: { fontSize: '13px', fontWeight: 500, color: colors.textSecondary },
  mono: { fontFamily: 'monospace', fontSize: '13px' },
};
