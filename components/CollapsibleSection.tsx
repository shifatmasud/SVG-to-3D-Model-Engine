import React, { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  isOpenDefault?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  isOpenDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  const containerClasses = `collapsible-section ${isOpen ? 'is-open' : ''}`;

  return (
    <div className={containerClasses}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="collapsible-section__toggle"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="collapsible-section__icon"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div className="collapsible-section__content-wrapper">
        <div className="collapsible-section__content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;