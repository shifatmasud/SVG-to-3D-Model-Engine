import React from 'react';
import Toggle from './Toggle';
import * as styles from '../styles';

interface EffectToggleProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
}

const EffectToggle: React.FC<EffectToggleProps> = ({ id, icon, title, description, isEnabled, onToggle }) => {
  return (
    <div style={containerStyle}>
      <div style={iconContainerStyle}>
        {icon}
      </div>
      <div style={textContainerStyle}>
        <label htmlFor={id} style={{ ...styles.typography.label, color: styles.colors.textPrimary, cursor: 'pointer', fontWeight: 500 }}>
          {title}
        </label>
        <p style={{ ...styles.typography.body, fontSize: '13px', color: styles.colors.textSecondary, marginTop: '2px' }}>
          {description}
        </p>
      </div>
      <Toggle id={id} isEnabled={isEnabled} onToggle={onToggle} />
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: styles.spacing.md,
  padding: `${styles.spacing.sm} 0`,
  borderBottom: `1px solid ${styles.colors.glassBorder}`,
};

const iconContainerStyle: React.CSSProperties = {
  color: styles.colors.accent,
  flexShrink: 0,
  width: '24px',
  height: '24px',
};

const textContainerStyle: React.CSSProperties = {
  flexGrow: 1,
};

export default EffectToggle;
