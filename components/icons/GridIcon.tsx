import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const GridIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18M15 3.75V21m-6-17.25V21m-6-17.25v17.25M3 12h18M3 7.5h18M3 16.5h18" />
  </svg>
);

export default GridIcon;