// FIX: Import React to provide type definitions for React.CSSProperties and React.DragEvent.
import React from 'react';

// FIX: Define and export the GameState enum as it is used in LandingPage.tsx.
export enum GameState {
  Hosting,
  Connected,
}

export type Player = 'white' | 'black';

export interface PointState {
  checkers: number;
  player: Player | null;
}

export interface CheckerProps {
  player: Player;
  style: React.CSSProperties;
  isDraggable: boolean;
  // FIX: Explicitly type the DragEvent with HTMLDivElement to match the underlying element in Checker.tsx.
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
}