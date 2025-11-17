import React, { useState, useEffect } from 'react';
import Dice from './Dice';
import { DiceIcon } from './icons/DiceIcon';
import { Player } from '../types';

interface DiceTrayProps {
  dice: [number, number] | null;
  turn: Player | null;
  playerColor: Player | null;
  onRollDice: () => void;
}

const DiceTray: React.FC<DiceTrayProps> = ({ dice, turn, playerColor, onRollDice }) => {
  const [isRolling, setIsRolling] = useState(false);
  const isMyTurn = turn === playerColor;
  const canRoll = isMyTurn && !dice;

  useEffect(() => {
    // When the dice prop is updated from the server, stop the rolling animation.
    if (dice) {
      setIsRolling(false);
    }
  }, [dice]);

  const handleRollClick = () => {
    if (!canRoll) return;
    setIsRolling(true);
    // The timeout is to allow the "Rolling..." state to be visible briefly before the server responds.
    setTimeout(onRollDice, 100); 
  };

  const getButtonText = () => {
    if (isRolling) return 'Rolling...';
    if (isMyTurn) {
      return dice ? 'Your Move' : 'Roll Dice';
    }
    return turn ? `Waiting for ${turn}`: 'Waiting for opponent';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6 bg-gray-900/50 rounded-lg shadow-inner w-full md:w-auto md:min-w-[200px]">
      <div className="h-24 flex items-center justify-center space-x-4">
        {dice && !isRolling && (
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
            <div className="text-gray-400">{isMyTurn ? "Roll the dice" : "Waiting..."}</div>
        )}
      </div>
      <button
        onClick={handleRollClick}
        disabled={!canRoll || isRolling}
        className="flex items-center justify-center w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
        aria-label="Roll the dice"
      >
        <DiceIcon className="w-6 h-6 mr-2" />
        {getButtonText()}
      </button>
    </div>
  );
};

export default DiceTray;