import React, { useState } from 'react';
import Dice from './Dice';
import { DiceIcon } from './icons/DiceIcon';

const DiceTray: React.FC = () => {
  const [dice, setDice] = useState<[number, number] | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setDice(null); // Clear previous dice for the animation

    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setDice([d1, d2]);
      setIsRolling(false);
    }, 700); // Duration should match the animation in index.html
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6 bg-gray-900/50 rounded-lg shadow-inner w-full md:w-auto md:min-w-[200px]">
      <div className="h-24 flex items-center justify-center space-x-4">
        {dice && (
          <>
            <div className="animate-roll-in">
              <Dice value={dice[0]} />
            </div>
            <div className="animate-roll-in" style={{ animationDelay: '100ms' }}>
              <Dice value={dice[1]} />
            </div>
          </>
        )}
        {isRolling && (
            <div className="text-gray-400 text-lg animate-pulse">Rolling...</div>
        )}
        {!isRolling && !dice && (
            <div className="text-gray-400">Click to roll the dice</div>
        )}
      </div>
      <button
        onClick={rollDice}
        disabled={isRolling}
        className="flex items-center justify-center w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
        aria-label="Roll the dice"
      >
        <DiceIcon className="w-6 h-6 mr-2" />
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
};

export default DiceTray;
