# Online Backgammon

BG is a web application that allows two people to play backgammon together online using a realistic, interactive playing surface.

As of the current version, the application provides a fully rendered, interactive backgammon board with the standard initial checker setup. Players can click and drag pieces to move them between points, with basic rule enforcement preventing illegal moves to blocked points.

## Features

- **Realistic Game Board**: A visually appealing backgammon board with correctly placed, stacked checkers.
- **Interactive Checkers**: Players can move pieces using a smooth drag-and-drop interface.
- **Basic Rule Enforcement**: Prevents a player from moving a checker to a point that is blocked (held by two or more) by the opponent.
- **Responsive Landing Page**: An initial screen that provides options to "Host" a new game or "Connect" to an existing one.
- **Modal Dialogs**: "About" and "Config" modals provide a clean way to display information and settings without leaving the main view.

## Architecture Overview

The application is currently a **frontend-only application** built with React and TypeScript. It is designed to be the user-facing client, with a future plan to connect to a backend service for multiplayer game state synchronization, player history, and leaderboards.

### Technology Stack

- **React**: For building the user interface with a component-based architecture.
- **TypeScript**: For static typing, improving code quality and maintainability.
- **Tailwind CSS**: For utility-first styling, loaded via CDN for simplicity.
- **HTML5 Drag and Drop API**: For handling the interactive movement of game pieces.

## File & Folder Structure

The project is organized into a main `src` directory containing all the application code, with components separated into their own subdirectory.

```
.
├── index.html            # Main HTML entry point for the application
├── index.tsx             # React entry point, mounts the App component
├── metadata.json         # Project metadata
├── README.md             # Project documentation (this file)
├── App.tsx               # Root React component, handles page routing and modals
├── types.ts              # Centralized TypeScript type definitions
├── constants.ts          # Static data (initial board state, piece positions)
└── components/
    ├── Header.tsx            # Top navigation bar component
    ├── LandingPage.tsx       # Initial screen with Host/Connect options
    ├── GamePage.tsx          # Wrapper for the main game view
    ├── BackgammonBoard.tsx   # Core component for the game board and logic
    ├── Checker.tsx           # Component for a single backgammon piece
    ├── Modal.tsx             # Reusable modal dialog component
    └── icons/
        └── LogoIcon.tsx      # SVG logo component
```

### File Descriptions

- **`App.tsx`**: The main application component. It manages the overall `gameState` (switching between the landing page and the game page) and controls the visibility of the "About" and "Config" modals.
- **`constants.ts`**: This file is crucial for the game's setup. It exports:
    - `INITIAL_BOARD_STATE`: An array of objects defining the number of checkers and the controlling player for each of the 24 points at the start of a game.
    - `POINT_POSITIONS`: An array that maps each point to its specific CSS coordinates (`top`, `bottom`, `left`) for precise visual placement on the board image.
    - `getCheckerStyle`: A helper function that calculates the dynamic CSS for each checker based on its point, its position in a stack, and the board's aspect ratio.
- **`types.ts`**: Defines shared TypeScript interfaces and enums, such as `Player`, `PointState`, and `GameState`, ensuring type safety across the application.
- **`components/BackgammonBoard.tsx`**: The heart of the application. This component:
    - Manages the layout of the checkers using React's `useState`.
    - Renders all checkers based on the current `boardState`.
    - Implements all drag-and-drop event handlers (`handleDragStart`, `handleDrop`, `handleDragEnd`).
    - Renders invisible "drop zones" over each point to capture drop events.
    - Enforces game rules during piece movement.
- **`components/Checker.tsx`**: A simple, presentational component that renders a single checker. It receives its style and player color as props and applies the appropriate CSS classes.

## Code Structure Deep Dive

### State Management

The primary game state (`boardState`) is managed within the `BackgammonBoard.tsx` component using the `useState` hook. This state is an array that represents the 24 points on the board. When a piece is moved, this state is updated, and React re-renders the board to reflect the new positions.

A second state variable, `draggedItem`, is used to track the checker currently being dragged. This is essential for providing visual feedback (hiding the original piece) and for passing data between the drag start and drop events.

### Drag-and-Drop Logic

The interactive movement is built using the standard HTML5 Drag and Drop API.

1.  **Draggable Attribute**: Only the top checker of any stack is made draggable (`isDraggable` prop).
2.  **`onDragStart`**: When a drag begins on a checker, this event fires. It stores the source point's index and the player's color in the `dataTransfer` object and updates the `draggedItem` state to hide the original piece.
3.  **Drop Zones**: The `BackgammonBoard` component renders invisible `div` elements over each point. These act as targets for drop events.
4.  **`onDragOver`**: This event is captured on the drop zones, and `preventDefault()` is called to signal that a drop is allowed.
5.  **`onDrop`**: When a checker is dropped on a zone, this event fires. It reads the data from `dataTransfer`, validates the move against the game rules, and if the move is valid, it updates the `boardState`.
6.  **`onDragEnd`**: This event fires on the original checker when the drag operation is complete (regardless of success). It is used to clean up the `draggedItem` state, ensuring the board returns to a normal interactive state.
