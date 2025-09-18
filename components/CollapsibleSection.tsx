import React, { ReactNode, useState } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';
import * as styles from '../styles';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, isOpen, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);

  const containerStyle: React.CSSProperties = {
    borderBottom: `1px solid ${styles.colors.glassBorder}`,
  };

  const toggleBaseStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${styles.spacing.sm} ${styles.spacing.xs}`,
    textAlign: 'left',
    fontSize: '1rem',
    fontWeight: 500,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: styles.transitions.fast,
    color: isOpen ? styles.colors.textPrimary : styles.colors.textSecondary,
  };

  const toggleHoverStyle: React.CSSProperties = {
    color: styles.colors.textPrimary,
    background: 'rgba(255, 255, 255, 0.03)',
  };

  const iconStyle: React.CSSProperties = {
    height: '24px',
    width: '24px',
    transition: styles.transitions.medium,
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    color: isOpen ? styles.colors.accent : 'currentColor',
  };

  const contentWrapperStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateRows: isOpen ? '1fr' : '0fr',
    transition: 'grid-template-rows 300ms ease-in-out',
  };

  const contentStyle: React.CSSProperties = {
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: `${styles.spacing.md} ${styles.spacing.lg}`,
    display: 'flex',
    flexDirection: 'column',
    gap: styles.spacing.md,
    position: 'relative',
    boxShadow: 'inset 0 6px 8px -8px rgba(0,0,0,0.7)',
  };

  return (
    <div style={containerStyle}>
      <button
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={isHovered ? { ...toggleBaseStyle, ...toggleHoverStyle } : toggleBaseStyle}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDownIcon style={iconStyle} />
      </button>
      <div style={contentWrapperStyle}>
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
