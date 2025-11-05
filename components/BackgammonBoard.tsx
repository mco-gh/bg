import React, { useState } from 'react';
import Checker from './Checker';
import { INITIAL_BOARD_STATE, getCheckerStyle, POINT_POSITIONS } from '../constants';
import { PointState, Player } from '../types';

type DraggedItem = {
  fromPointIndex: number;
  totalCheckersAtSource: number;
  player: Player;
}

const BackgammonBoard: React.FC = () => {
  const [boardState, setBoardState] = useState<PointState[]>(INITIAL_BOARD_STATE);
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, fromPointIndex: number, player: Player, totalCheckersAtSource: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ fromPointIndex, player }));
    
    // Use a zero-delay timeout. This allows the browser's drag-and-drop API
    // to initialize and create its own default drag preview before React
    // re-renders and hides the original element.
    setTimeout(() => {
        setDraggedItem({ fromPointIndex, totalCheckersAtSource, player });
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // This is necessary to allow dropping
  };

  const handleDragEnd = () => {
    // Reset the drag state, which makes the original checker visible again if the drop was invalid.
    setDraggedItem(null);
  };

  const handleDrop = (e: React.DragEvent, toPointIndex: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    const { fromPointIndex, player } = JSON.parse(data) as { fromPointIndex: number; player: Player };

    if (fromPointIndex === toPointIndex) return;

    setBoardState(prevState => {
      const newState = JSON.parse(JSON.stringify(prevState)) as PointState[];
      const fromPoint = newState[fromPointIndex];
      const toPoint = newState[toPointIndex];

      // Basic backgammon rule: cannot move to a point with 2 or more opponent checkers
      if (toPoint.player && toPoint.player !== player && toPoint.checkers >= 2) {
        return prevState; // Invalid move, abort state change
      }

      // Decrement source point
      fromPoint.checkers -= 1;
      if (fromPoint.checkers === 0) {
        fromPoint.player = null;
      }

      // Increment destination point
      // Hitting a blot
      if (toPoint.player && toPoint.player !== player && toPoint.checkers === 1) {
        // In a real game, this piece would go to the bar.
        // For now, we just take over the point.
        toPoint.checkers = 1;
      } else {
        toPoint.checkers += 1;
      }
      toPoint.player = player;

      return newState;
    });
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
      
      {/* Layer for Drop Zones */}
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

      {/* Layer for Checkers */}
      <div className="absolute top-0 left-0 w-full h-full">
        {boardState.flatMap((point, pointIndex) => {
          const isDragSource = !!(draggedItem && draggedItem.fromPointIndex === pointIndex);
          
          // To prevent the "auto-delete" bug, if we are dragging from this point,
          // render the number of checkers that were here when the drag started.
          const checkersToRender = isDragSource ? draggedItem!.totalCheckersAtSource : point.checkers;
          const playerToRender = isDragSource ? draggedItem!.player : point.player;

          if (checkersToRender === 0 || !playerToRender) {
            return [];
          }

          return Array.from({ length: checkersToRender }).map((_, stackIndex) => {
            // The checker being dragged is the one at the top of the stack *at the moment the drag started*.
            const isBeingDragged = isDragSource && stackIndex === checkersToRender - 1;
            
            const checkerStyle = getCheckerStyle(pointIndex, stackIndex, checkersToRender);
            if (isBeingDragged) {
              checkerStyle.opacity = 0; // Hide the original checker during the drag.
            }

            // A checker is interactive if it's at the top of its stack based on the current, true board state.
            const isTopCheckerOnBoard = point.player !== null && stackIndex === point.checkers - 1;

            return (
              <Checker
                key={`checker-${pointIndex}-${stackIndex}`}
                player={playerToRender}
                style={checkerStyle}
                isDraggable={isTopCheckerOnBoard}
                onDragStart={isTopCheckerOnBoard ? (e) => handleDragStart(e, pointIndex, point.player!, point.checkers) : undefined}
                onDragEnd={isTopCheckerOnBoard ? handleDragEnd : undefined}
              />
            );
          });
        })}
      </div>
    </div>
  );
};

export default BackgammonBoard;