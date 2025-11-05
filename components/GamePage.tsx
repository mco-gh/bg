import React from 'react';
import BackgammonBoard from './BackgammonBoard';

const GamePage: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <p className="mb-4 text-lg text-gray-300">Game in progress...</p>
      <BackgammonBoard />
    </div>
  );
};

export default GamePage;