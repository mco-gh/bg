import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface HeaderProps {
  onShowAbout: () => void;
  onShowConfig: () => void;
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowAbout, onShowConfig, onLogoClick }) => {
  return (
    <header className="w-full bg-gray-900 shadow-lg p-3">
      <div className="container mx-auto flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={onLogoClick}
          aria-label="Go to homepage"
        >
          <LogoIcon className="h-10 w-10 text-cyan-400" />
          <span className="hidden sm:block text-2xl font-bold tracking-wider text-white">Online Backgammon</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white absolute left-1/2 -translate-x-1/2">
          Backgammon
        </h1>
        <nav className="flex items-center space-x-4">
          <button 
            onClick={onShowAbout} 
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            About
          </button>
          <button 
            onClick={onShowConfig} 
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            Config
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
