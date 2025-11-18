import React, { useState, useEffect } from 'react';
import Dice from './Dice';
import { DiceIcon } from './icons/DiceIcon';
import { EndTurnIcon } from './icons/EndTurnIcon';
import { Player } from '../types';

interface DiceTrayProps {
  dice: [number, number] | null;
  turn: Player | null;
  playerColor: Player | null;
  onRollDice: () => void;
  onEndTurn: () => void;
}

const DiceTray: React.FC<DiceTrayProps> = ({ dice, turn, playerColor, onRollDice, onEndTurn }) => {
  const [isRolling, setIsRolling] = useState(false);
  const isMyTurn = turn === playerColor;
  const canRoll = isMyTurn && !dice;

  useEffect(() => {
    if (dice) {
      setIsRolling(false);
    }
  }, [dice]);

  const handleRollClick = () => {
    if (!canRoll) return;
    setIsRolling(true);
    setTimeout(onRollDice, 100); 
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6 bg-gray-900/50 rounded-lg shadow-inner w-full h-full md:w-full md:h-auto">
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
      <div className="w-full">
        {canRoll ? (
          <button
            onClick={handleRollClick}
            disabled={isRolling}
            className="flex items-center justify-center w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
            aria-label="Roll the dice"
          >
            <DiceIcon className="w-6 h-6 mr-2" />
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </button>
        ) : isMyTurn && dice ? (
          <button
            onClick={onEndTurn}
            className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all transform hover:scale-105"
            aria-label="End your turn"
          >
            <EndTurnIcon className="w-6 h-6 mr-2" />
            End Turn
          </button>
        ) : (
           <button
            disabled
            className="flex items-center justify-center w-full bg-gray-700 text-gray-400 font-bold py-3 px-6 rounded-lg text-lg cursor-not-allowed"
          >
            {turn ? `Waiting for ${turn}` : 'Waiting...'}
          </button>
        )}
      </div>
    </div>
  );
};

export default DiceTray;