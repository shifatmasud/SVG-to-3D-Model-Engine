import React, { useId } from 'react';
import * as styles from '../styles';

interface SliderProps {
  label: string;
  id?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  decimals?: number;
}

const Slider: React.FC<SliderProps> = ({
  label,
  id,
  min,
  max,
  step,
  value,
  onChange,
  unit = '',
  decimals = 0,
}) => {
  const generatedId = useId();
  const controlId = id || generatedId;

  const progress = ((value - min) / (max - min)) * 100;
  const rangeStyle = { '--value-percent': `${progress}%` } as React.CSSProperties;

  return (
    <div style={controlGroupStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label htmlFor={controlId} style={styles.typography.label}>
          {label}
        </label>
        <span style={sliderValueStyle}>
          {value.toFixed(decimals)}{unit}
        </span>
      </div>
      <input
        id={controlId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={rangeStyle}
      />
    </div>
  );
};

const controlGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: styles.spacing.xs,
};

const sliderValueStyle: React.CSSProperties = {
  ...styles.typography.mono,
  color: styles.colors.textSecondary,
  backgroundColor: 'rgba(0,0,0,0.2)',
  padding: `2px ${styles.spacing.xs}`,
  borderRadius: styles.radii.sm,
};

export default Slider;
