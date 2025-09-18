import React from 'react';
import * as styles from '../styles';
import CubeIcon from './icons/CubeIcon';

const Loader: React.FC = () => {
  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 4px ${styles.colors.accentGlow});
          }
          50% {
            opacity: 0.7;
            transform: scale(0.95);
            filter: drop-shadow(0 0 12px ${styles.colors.accentGlow});
          }
        }
      `}</style>
      <div style={loaderStyle}>
        <CubeIcon style={spinnerStyle} />
        <p style={textStyle}>Generating 3D Model...</p>
      </div>
    </>
  );
};

const loaderStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: styles.spacing.lg,
};

const spinnerStyle: React.CSSProperties = {
  height: '64px',
  width: '64px',
  color: styles.colors.accent,
  animation: 'pulse-glow 2s ease-in-out infinite',
};

const textStyle: React.CSSProperties = {
  ...styles.typography.h2,
  fontWeight: 400,
  color: styles.colors.textPrimary,
};

export default Loader;
