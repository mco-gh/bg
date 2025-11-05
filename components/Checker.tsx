import React from 'react';
import { CheckerProps } from '../types';

const Checker: React.FC<CheckerProps> = ({ player, style, isDraggable, onDragStart, onDragEnd }) => {
  const baseClasses = "absolute rounded-full w-[6.15%] aspect-square transition-all duration-300 ease-in-out shadow-lg border-2 z-20";
  const cursorClass = isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default';

  const playerClasses = {
    white: 'bg-stone-200 border-stone-400',
    black: 'bg-stone-800 border-stone-900',
  };

  return (
    <div
      className={`${baseClasses} ${playerClasses[player]} ${cursorClass}`}
      style={style}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
       <div className="absolute inset-0.5 rounded-full" style={{background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)'}}></div>
    </div>
  );
};

export default Checker;