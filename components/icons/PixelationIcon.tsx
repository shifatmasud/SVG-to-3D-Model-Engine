import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const PixelationIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5h3v3h-3v-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 4.5h3v3h-3v-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5h3v3h-3v-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.5h3v3h-3v-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.5h9v9h-9v-9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 16.5h3v3h-3v-3z" />
  </svg>
);

export default PixelationIcon;