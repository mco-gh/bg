export enum GameState {
  Landing = 'LANDING',
  Hosting = 'HOSTING',
  Connected = 'CONNECTED',
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