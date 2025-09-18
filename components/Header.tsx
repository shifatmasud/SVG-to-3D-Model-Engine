import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="app-header__content">
        <div className="app-header__logo-group">
           <svg className="app-header__logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="app-header__title">
            SVG to 3D Engine
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;