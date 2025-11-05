import { PointState } from './types';

export const INITIAL_BOARD_STATE: PointState[] = [
  // Point 1-6 (Top Right Quadrant)
  { checkers: 2, player: 'white' },  // Point 1
  { checkers: 0, player: null },     // Point 2
  { checkers: 0, player: null },     // Point 3
  { checkers: 0, player: null },     // Point 4
  { checkers: 0, player: null },     // Point 5
  { checkers: 5, player: 'black' },  // Point 6
  // Point 7-12 (Top Left Quadrant)
  { checkers: 0, player: null },     // Point 7
  { checkers: 3, player: 'black' },  // Point 8
  { checkers: 0, player: null },     // Point 9
  { checkers: 0, player: null },     // Point 10
  { checkers: 0, player: null },     // Point 11
  { checkers: 5, player: 'white' },  // Point 12
  // Point 13-18 (Bottom Left Quadrant)
  { checkers: 5, player: 'black' },  // Point 13
  { checkers: 0, player: null },     // Point 14
  { checkers: 0, player: null },     // Point 15
  { checkers: 0, player: null },     // Point 16
  { checkers: 3, player: 'white' },  // Point 17
  { checkers: 0, player: null },     // Point 18
  // Point 19-24 (Bottom Right Quadrant)
  { checkers: 5, player: 'white' },  // Point 19
  { checkers: 0, player: null },     // Point 20
  { checkers: 0, player: null },     // Point 21
  { checkers: 0, player: null },     // Point 22
  { checkers: 0, player: null },     // Point 23
  { checkers: 2, player: 'black' },  // Point 24
];


// Coordinates represent the HORIZONTAL CENTER of each point.
// These values are calculated based on the visible playable area of the board,
// accounting for the image's own border and perspective distortion.
// The array index `i` corresponds to point `i+1`.
export const POINT_POSITIONS: { top?: string; bottom?: string; left: string }[] = [
    // Top Row (Points 1-12)
    // Top Right Quadrant (Points 1-6) from outer edge to bar
    { top: '8.5%', left: '90.4%' },    // Point 1
    { top: '8.5%', left: '83.6%' },    // Point 2
    { top: '8.5%', left: '76.8%' },    // Point 3
    { top: '8.5%', left: '70.0%' },    // Point 4
    { top: '8.5%', left: '63.2%' },    // Point 5
    { top: '8.5%', left: '56.4%' },    // Point 6
    // Top Left Quadrant (Points 7-12) from bar to outer edge
    { top: '8.5%', left: '43.0%' },    // Point 7
    { top: '8.5%', left: '36.2%' },    // Point 8
    { top: '8.5%', left: '29.4%' },    // Point 9
    { top: '8.5%', left: '22.6%' },    // Point 10
    { top: '8.5%', left: '15.8%' },    // Point 11
    { top: '8.5%', left: '9.0%' },     // Point 12
  
    // Bottom Row (Points 13-24)
    // Bottom Left Quadrant (Points 13-18) from outer edge to bar
    { bottom: '8.5%', left: '9.0%' },    // Point 13
    { bottom: '8.5%', left: '15.8%' },   // Point 14
    { bottom: '8.5%', left: '22.6%' },   // Point 15
    { bottom: '8.5%', left: '29.4%' },   // Point 16
    { bottom: '8.5%', left: '36.2%' },   // Point 17
    { bottom: '8.5%', left: '43.0%' },   // Point 18
    // Bottom Right Quadrant (Points 19-24) from bar to outer edge
    { bottom: '8.5%', left: '56.4%' },   // Point 19
    { bottom: '8.5%', left: '63.2%' },   // Point 20
    { bottom: '8.5%', left: '70.0%' },   // Point 21
    { bottom: '8.5%', left: '76.8%' },   // Point 22
    { bottom: '8.5%', left: '83.6%' },   // Point 23
    { bottom: '8.5%', left: '90.4%' },   // Point 24
];

export const getCheckerStyle = (pointIndex: number, stackIndex: number, totalCheckers: number): React.CSSProperties => {
  const basePosition = POINT_POSITIONS[pointIndex];
  const isTopRow = pointIndex < 12;

  // These values MUST match the values used in Checker.tsx and BackgammonBoard.tsx
  const CHECKER_DIAMETER_PERCENT_OF_WIDTH = 6.15;
  const BOARD_ASPECT_RATIO = 1200 / 1000;

  const checkerHeightAsPercentOfBoardHeight = CHECKER_DIAMETER_PERCENT_OF_WIDTH * BOARD_ASPECT_RATIO;
  const stackOffset = stackIndex * checkerHeightAsPercentOfBoardHeight;

  const halfCheckerWidth = CHECKER_DIAMETER_PERCENT_OF_WIDTH / 2;

  const style: React.CSSProperties = {};

  // Horizontal positioning: Use calc() to subtract half the checker's width from the center-point coordinate.
  style.left = `calc(${basePosition.left} - ${halfCheckerWidth}%)`;

  // Vertical positioning
  if (isTopRow) {
    // Base position has `top`. We add the offset to move down.
    style.top = `calc(${basePosition.top} + ${stackOffset}%)`;
  } else {
    // Base position has `bottom`. We add the offset to move up.
    style.bottom = `calc(${basePosition.bottom} + ${stackOffset}%)`;
  }
  
  return style;
};