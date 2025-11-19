import React, { useState } from 'react';
import { CopyIcon } from './icons/CopyIcon';

interface HeaderProps {
  gameId: string;
  onShowAbout: () => void;
  onShowConfig: () => void;
  onShowConnect: () => void;
}

const Header: React.FC<HeaderProps> = ({ gameId, onShowAbout, onShowConfig, onShowConnect }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!navigator.clipboard || !gameId) return;
    navigator.clipboard.writeText(gameId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header className="w-full bg-gray-900 shadow-lg p-3">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left: Title (Logo moved to main body) */}
        <div className="flex items-center justify-start min-w-0">
          <a 
            href="/"
            className="flex items-center cursor-pointer"
            aria-label="Go to homepage"
          >
            <span className="text-2xl font-bold font-sans text-white tracking-wide hover:text-cyan-400 transition-colors whitespace-nowrap hidden sm:block">mcoBG</span>
          </a>
        </div>

        {/* Center: Game ID */}
        <div className="flex items-center justify-center px-2">
          {gameId && (
            <div className="flex items-center bg-gray-800 rounded-md p-2 border border-gray-700 shadow-sm">
              <span className="text-sm font-medium text-gray-400 mr-2 whitespace-nowrap">Game ID:</span>
              <span className="text-white font-mono tracking-widest text-sm select-all">{gameId}</span>
              <button onClick={handleCopy} className="ml-3 text-gray-400 hover:text-white transition-colors" aria-label="Copy Game ID">
                {copied ? <span className="text-xs text-green-400 font-bold">Copied!</span> : <CopyIcon className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>

        {/* Right: Navigation Buttons */}
        <div className="flex items-center justify-end">
          <nav className="flex items-center space-x-0.5 sm:space-x-3">
            <button 
              onClick={onShowConnect} 
              className="px-1 sm:px-2.5 py-2 text-[17px] font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
               Connect
            </button>
            <button 
              onClick={onShowConfig} 
              className="px-1 sm:px-2.5 py-2 text-[17px] font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              Config
            </button>
            <button 
              onClick={onShowAbout} 
              className="px-1 sm:px-2.5 py-2 text-[17px] font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              This App
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;