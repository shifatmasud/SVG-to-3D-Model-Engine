import React from 'react';
import CubeIcon from './icons/CubeIcon';
import * as styles from '../styles';

const Header: React.FC = () => {
  return (
    <header style={headerStyle}>
      <div style={contentStyle}>
        <div style={logoGroupStyle}>
           <CubeIcon style={logoStyle} />
          <h1 style={titleStyle}>
            SVG to 3D
          </h1>
        </div>
      </div>
    </header>
  );
};

const headerStyle: React.CSSProperties = {
  position: 'absolute',
  top: styles.spacing.md,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10,
  width: 'fit-content',
};

const contentStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '56px',
  padding: `${styles.spacing.sm} ${styles.spacing.lg}`,
  backgroundColor: styles.colors.surface,
  borderRadius: styles.radii.lg,
  border: `1px solid ${styles.colors.glassBorder}`,
  boxShadow: styles.shadows.soft,
  backdropFilter: 'blur(10px)',
};

const logoGroupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: styles.spacing.sm,
};

const logoStyle: React.CSSProperties = {
  height: '28px',
  width: 'auto',
  color: styles.colors.accent,
};

const titleStyle: React.CSSProperties = {
  ...styles.typography.h2,
  background: `linear-gradient(to right, ${styles.colors.textPrimary}, ${styles.colors.textSecondary})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  margin: 0,
};


export default Header;
