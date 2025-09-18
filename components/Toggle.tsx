import React, { useState } from 'react';
import * as styles from '../styles';

interface ToggleProps {
  id: string;
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ id, isEnabled, onToggle }) => {
  const [isFocused, setIsFocused] = useState(false);

  // Define component dimensions for easier calculation
  const thumbSize = 20;
  const trackHeight = 24;
  const trackWidth = 44;
  const trackPadding = (trackHeight - thumbSize) / 2; // Should be 2px

  // Correctly calculate the thumb's horizontal position
  const translateX = isEnabled ? trackWidth - thumbSize - trackPadding : trackPadding;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    height: `${trackHeight}px`,
    width: `${trackWidth}px`,
    flexShrink: 0,
    cursor: 'pointer',
    borderRadius: styles.radii.full,
    transition: 'background-color 200ms ease-in-out, box-shadow 150ms ease-in-out',
    backgroundColor: isEnabled ? styles.colors.accent : 'rgba(255, 255, 255, 0.1)',
    border: 'none', // Use box-shadow for a cleaner border on rounded shapes
    outline: 'none',
  };

  // Dynamically build the box-shadow for different states
  const shadowParts = [
    'inset 0 1px 2px rgba(0,0,0,0.2)',        // Inner shadow for depth
    `0 0 0 1px ${styles.colors.glassBorder}` // Outer border effect to fix aliasing
  ];

  if (isEnabled) {
    shadowParts.push(`0 0 6px ${styles.colors.accentGlow}`); // Glow when enabled
  }

  if (isFocused) {
    shadowParts.push(styles.shadows.glow); // Focus ring for accessibility
  }

  containerStyle.boxShadow = shadowParts.join(', ');

  const thumbStyle: React.CSSProperties = {
    pointerEvents: 'none',
    display: 'inline-block',
    height: `${thumbSize}px`,
    width: `${thumbSize}px`,
    transform: `translateX(${translateX}px)`,
    borderRadius: styles.radii.full,
    backgroundColor: 'white',
    // A more refined shadow to lift the thumb off the track
    boxShadow: '0 1px 3px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.1)',
    // A slightly bouncy transition for a fluid feel, aligning with the design system
    transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    position: 'absolute',
    top: `${trackPadding}px`, // Center the thumb vertically
    left: '0px'
  };

  return (
    <button
      type="button"
      id={id}
      onClick={() => onToggle(!isEnabled)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={containerStyle}
      role="switch"
      aria-checked={isEnabled}
    >
      <span aria-hidden="true" style={thumbStyle} />
    </button>
  );
};

export default Toggle;
