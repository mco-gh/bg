import React from 'react';
import BackgammonBoard from './BackgammonBoard';
import DiceTray from './DiceTray';
import VideoFeed from './VideoFeed';
import { PointState, Player } from '../types';

interface GamePageProps {
  gameId: string;
  boardState: PointState[];
  dice: [number, number] | null;
  movesLeft: number[];
  turn: Player | null;
  playerColor: Player | null;
  onRollDice: () => void;
  onMovePiece: (from: number, to: number) => void;
  onEndTurn: () => void;
  gameActive: boolean;
}

const GamePage: React.FC<GamePageProps> = ({
  gameId,
  boardState,
  dice,
  movesLeft,
  turn,
  playerColor,
  onRollDice,
  onMovePiece,
  onEndTurn,
  gameActive,
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-center gap-8 px-4">
      <div className="w-full max-w-4xl flex-shrink">
        <BackgammonBoard
          boardState={boardState}
          turn={turn}
          playerColor={playerColor}
          onMovePiece={onMovePiece}
          movesLeft={movesLeft}
        />
      </div>
      <div className="w-full md:w-80 flex-shrink-0 flex flex-row md:flex-col gap-4 md:gap-6">
        <div className="flex-1 md:flex-none w-full">
          <VideoFeed gameId={gameId} playerColor={playerColor} gameActive={gameActive} />
        </div>
        <div className="flex-1 md:flex-none w-full">
          <DiceTray
            dice={dice}
            movesLeft={movesLeft}
            turn={turn}
            playerColor={playerColor}
            onRollDice={onRollDice}
            onEndTurn={onEndTurn}
          />
        </div>
      </div>
    </div>
  );
};

export default GamePage;