import React, { useState, useEffect } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { CopyIcon } from './icons/CopyIcon';

interface HeaderProps {
  onShowAbout: () => void;
  onShowConfig: () => void;
  onShowConnect: () => void;
  onLogoClick: () => void;
}

const generateGameId = () => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 2) result += '-';
    }
    return result;
}

const Header: React.FC<HeaderProps> = ({ onShowAbout, onShowConfig, onShowConnect, onLogoClick }) => {
  const [gameId, setGameId] = useState('');
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
      setGameId(generateGameId());
  }, []);

  const handleCopy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(gameId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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

        <nav className="flex items-center space-x-2 sm:space-x-4">
          {gameId && (
            <div className="flex items-center bg-gray-800 rounded-md p-2">
              <span className="text-sm font-medium text-gray-400 mr-2">Game ID:</span>
              <span className="text-white font-mono tracking-widest text-sm">{gameId}</span>
              <button onClick={handleCopy} className="ml-3 text-gray-400 hover:text-white transition-colors" aria-label="Copy Game ID">
                {copied ? <span className="text-xs text-green-400">Copied!</span> : <CopyIcon className="w-5 h-5" />}
              </button>
            </div>
          )}
          <button 
            onClick={onShowConnect} 
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
             Connect
          </button>
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