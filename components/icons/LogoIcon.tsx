import React from 'react';

export const LogoIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className = '', ...props }) => (
  <img
    src="https://mco.dev/img/bg_logo.png"
    alt=""
    className={`object-contain ${className}`}
    {...props}
  />
);