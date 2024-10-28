import React from 'react';

interface LogoProps {
  logoUrl: string;
}

const Logo: React.FC<LogoProps> = ({ logoUrl }) => {
  return (
    <div className="w-12 h-12 rounded-lg p-1 overflow-hidden rouned-lg border-2">
      <img src={logoUrl} alt="Drill Logo" className="w-full h-full object-cover" />
    </div>
  );
};

export default Logo;
