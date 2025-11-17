import React, { useState } from 'react';
import Checker from './Checker';
import { getCheckerStyle, POINT_POSITIONS } from '../constants';
import { PointState, Player } from '../types';

type DraggedItem = {
  fromPointIndex: number;
  totalCheckersAtSource: number;
  player: Player;
}

interface BackgammonBoardProps {
  boardState: PointState[];
  turn: Player | null;
  playerColor: Player | null;
  onMovePiece: (fromPointIndex: number, toPointIndex: number) => void;
}

const BackgammonBoard: React.FC<BackgammonBoardProps> = ({ boardState, turn, playerColor, onMovePiece }) => {
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, fromPointIndex: number, player: Player, totalCheckersAtSource: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ fromPointIndex, player }));
    
    setTimeout(() => {
        setDraggedItem({ fromPointIndex, totalCheckersAtSource, player });
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = (e: React.DragEvent, toPointIndex: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    const { fromPointIndex } = JSON.parse(data) as { fromPointIndex: number; player: Player };

    if (fromPointIndex === toPointIndex) return;

    onMovePiece(fromPointIndex, toPointIndex);
  };

  return (
    <div 
      className="relative w-full max-w-4xl bg-gray-900 shadow-2xl rounded-lg overflow-hidden" 
      style={{ aspectRatio: '1200 / 1000' }}
    >
      <img
        src="https://mco.dev/img/backgammon.jpg"
        alt="Backgammon board"
        className="absolute top-0 left-0 w-full h-full object-fill"
      />
      
      <div className="absolute top-0 left-0 w-full h-full">
        {POINT_POSITIONS.map((pos, index) => {
          const pointWidth = 6.8;
          const style: React.CSSProperties = {
            position: 'absolute',
            width: `${pointWidth}%`,
            height: '50%',
            left: `calc(${pos.left} - ${pointWidth / 2}%)`,
          };
          if (pos.top) {
            style.top = '0';
          } else {
            style.bottom = '0';
          }
          return (
            <div
              key={`dropzone-${index}`}
              style={style}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="z-10"
            />
          );
        })}
      </div>

      <div className="absolute top-0 left-0 w-full h-full">
        {boardState.flatMap((point, pointIndex) => {
          const isDragSource = !!(draggedItem && draggedItem.fromPointIndex === pointIndex);
          
          const checkersToRender = isDragSource ? draggedItem!.totalCheckersAtSource : point.checkers;
          const playerToRender = isDragSource ? draggedItem!.player : point.player;

          if (checkersToRender === 0 || !playerToRender) {
            return [];
          }

          return Array.from({ length: checkersToRender }).map((_, stackIndex) => {
            const isBeingDragged = isDragSource && stackIndex === checkersToRender - 1;
            
            const checkerStyle = getCheckerStyle(pointIndex, stackIndex, checkersToRender);
            if (isBeingDragged) {
              checkerStyle.opacity = 0;
            }

            const isMyTurn = turn === playerColor;
            const isMyChecker = point.player === playerColor;
            const isTopCheckerOnBoard = point.player !== null && stackIndex === point.checkers - 1;
            const isDraggable = isMyTurn && isMyChecker && isTopCheckerOnBoard;

            return (
              <Checker
                key={`checker-${pointIndex}-${stackIndex}`}
                player={playerToRender}
                style={checkerStyle}
                isDraggable={isDraggable}
                onDragStart={isDraggable ? (e) => handleDragStart(e, pointIndex, point.player!, point.checkers) : undefined}
                onDragEnd={isDraggable ? handleDragEnd : undefined}
              />
            );
          });
        })}
      </div>
    </div>
  );
};

export default BackgammonBoard;