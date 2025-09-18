import React, { useCallback, useState } from 'react';

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

  const containerClasses = `file-upload ${isDragging ? 'is-dragging' : ''} ${disabled ? 'is-disabled' : ''}`;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={containerClasses}
    >
      <div className="file-upload__inner">
        <svg
          className="file-upload__icon"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="file-upload__text">
          <label
            htmlFor="file-upload"
            className="file-upload__label"
          >
            <span>Upload a file</span>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".svg" onChange={handleChange} disabled={disabled} />
          </label>
          <p>or drag and drop</p>
        </div>
        <p style={{fontSize: '0.75rem', color: 'var(--color-text-placeholder)', marginTop: '4px'}}>SVG files only</p>
      </div>
    </div>
  );
};

export default FileUpload;