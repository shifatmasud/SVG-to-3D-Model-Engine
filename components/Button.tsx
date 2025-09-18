import React, { useState } from 'react';
import * as styles from '../styles';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', style, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${styles.spacing.xs} ${styles.spacing.md}`,
    border: '1px solid',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: styles.radii.md,
    cursor: 'pointer',
    transition: styles.transitions.fast,
    width: '100%',
    outline: 'none',
  };

  const variantStyles = {
    primary: {
      backgroundColor: styles.colors.accent,
      color: 'white',
      borderColor: styles.colors.accent,
    },
    secondary: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: styles.colors.textPrimary,
      borderColor: styles.colors.glassBorder,
    },
  };

  const hoverStyles = {
    primary: {
      backgroundColor: styles.colors.accentHover,
      borderColor: styles.colors.accentHover,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    },
    secondary: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
  };

  const activeStyles = {
    primary: {
      backgroundColor: styles.colors.accentActive,
      transform: 'translateY(0)',
      boxShadow: 'none',
    },
    secondary: {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      transform: 'scale(0.98)',
    },
  };
  
  const disabledStyle: React.CSSProperties = {
      opacity: 0.5,
      cursor: 'not-allowed',
  };

  let combinedStyle = { ...baseStyle, ...variantStyles[variant] };
  if (props.disabled) {
    combinedStyle = { ...combinedStyle, ...disabledStyle };
  } else {
    if (isHovered) combinedStyle = { ...combinedStyle, ...hoverStyles[variant] };
    if (isActive) combinedStyle = { ...combinedStyle, ...activeStyles[variant] };
  }
  
  combinedStyle = { ...combinedStyle, ...style };

  return (
    <button
      {...props}
      style={combinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      {children}
    </button>
  );
};

export default Button;
