import React, { useState, useMemo } from 'react';
import { GameState } from '../types';

interface LandingPageProps {
  onStartGame: (state: GameState) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartGame }) => {
  const [gameUrl, setGameUrl] = useState('');

  const isUrlValid = useMemo(() => {
    if (!gameUrl) return false;
    try {
      const url = new URL(gameUrl);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }, [gameUrl]);

  return (
    <div className="text-center bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
      <h2 className="text-4xl font-bold mb-8 text-cyan-300">Welcome</h2>
      <div className="space-y-6">
        <div>
          <button
            onClick={() => onStartGame(GameState.Hosting)}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
          >
            Host a New Game
          </button>
          <p className="text-gray-400 mt-2 text-sm">Start a game and invite a friend.</p>
        </div>
        
        <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="gameUrl" className="block text-left text-gray-300 font-medium mb-2">
              Game URL
            </label>
            <input
              type="text"
              id="gameUrl"
              value={gameUrl}
              onChange={(e) => setGameUrl(e.target.value)}
              placeholder="Enter game URL to connect"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <button
            onClick={() => onStartGame(GameState.Connected)}
            disabled={!isUrlValid}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
          >
            Connect to Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;