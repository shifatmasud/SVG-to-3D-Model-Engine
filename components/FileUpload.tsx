import React, { useCallback, useState } from 'react';
import UploadIcon from './icons/UploadIcon';
import * as styles from '../styles';

interface FileUploadProps {
  onFileLoad: (svgContent: string) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File | null) => {
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          onFileLoad(e.target.result);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid SVG file.");
    }
  }, [onFileLoad]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [disabled, handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };
  
  const baseStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: `${styles.spacing.lg}`,
    border: `2px dashed ${styles.colors.glassBorder}`,
    borderRadius: styles.radii.lg,
    transition: styles.transitions.medium,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: 'rgba(0,0,0,0.2)',
    minHeight: '180px'
  };

  const draggingStyle: React.CSSProperties = {
    borderColor: styles.colors.accent,
    borderStyle: 'solid',
    backgroundColor: 'rgba(0, 153, 255, 0.1)',
    boxShadow: `0 0 24px ${styles.colors.accentGlow}`,
    transform: 'scale(1.02)'
  };

  const finalStyle = isDragging ? { ...baseStyle, ...draggingStyle } : baseStyle;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      style={finalStyle}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
        <UploadIcon style={{ margin: '0 auto', height: '48px', width: '48px', color: styles.colors.textPlaceholder }} />
        <div style={{ ...styles.typography.body, color: styles.colors.textSecondary, marginTop: styles.spacing.sm }}>
          <span style={{ cursor: 'pointer', fontWeight: 500, color: styles.colors.accent }}>
            Upload a file
            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".svg" onChange={handleChange} disabled={disabled} />
          </span>
          <p style={{ margin: 0 }}>or drag and drop</p>
        </div>
        <p style={{fontSize: '12px', color: styles.colors.textPlaceholder, marginTop: '4px'}}>SVG files only</p>
      </div>
    </div>
  );
};

export default FileUpload;
