import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Header from './components/Header';
import GamePage from './components/GamePage';
import Modal from './components/Modal';
import { PointState, Player } from './types';
import { INITIAL_BOARD_STATE } from './constants';

function App() {
  // Modal states
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Config state
  const [backendUrl, setBackendUrl] = useState('https://backend-server-mcodev.replit.app');

  // Game state from server
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameId, setGameId] = useState('');
  const [connectGameId, setConnectGameId] = useState(''); // For the connect modal input
  const [boardState, setBoardState] = useState<PointState[]>(INITIAL_BOARD_STATE);
  const [turn, setTurn] = useState<Player | null>(null);
  const [playerColor, setPlayerColor] = useState<Player | null>(null);
  const [dice, setDice] = useState<[number, number] | null>(null);
  const [movesLeft, setMovesLeft] = useState<number[]>([]);
  const [gameStatus, setGameStatus] = useState<'connecting' | 'waiting' | 'active' | 'disconnected'>('connecting');

  const joiningGameIdRef = useRef<string | null>(null);

  useEffect(() => {
    const newSocket = io(backendUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to backend:', newSocket.id);
      newSocket.emit('create-game');
    });

    newSocket.on('game-created', ({ gameId: newGameId }) => {
      console.log('Game created with ID:', newGameId);
      setGameId(newGameId);
      setGameStatus('waiting');
      setPlayerColor('white'); // First player is white by default
    });

    newSocket.on('game-started', (data) => {
      console.log('Game started:', data);
      
      // Re-applied fix: Set gameId for the joining player
      if (joiningGameIdRef.current) {
        setGameId(joiningGameIdRef.current);
        joiningGameIdRef.current = null; // Clear after use
      }

      setBoardState(data.boardState);
      setTurn(data.turn);
      
      const myColor = Object.keys(data.players).find(color => data.players[color] === newSocket.id) as Player;
      setPlayerColor(myColor);
      setGameStatus('active');
      setShowConnectModal(false);
    });

    newSocket.on('board-updated', ({ boardState: newBoardState }) => {
      setBoardState(newBoardState);
    });

    newSocket.on('dice-rolled', (data) => {
      setDice(data.dice);
      setTurn(data.turn);
      if (data.dice[0] === data.dice[1]) { // Doubles
        setMovesLeft([data.dice[0], data.dice[0], data.dice[0], data.dice[0]]);
      } else {
        setMovesLeft(data.dice);
      }
    });

    newSocket.on('new-turn', ({ turn: newTurn }) => {
      setTurn(newTurn);
      setDice(null); // Clear dice for the new turn
      setMovesLeft([]);
    });

    newSocket.on('player-disconnected', () => {
      setGameStatus('disconnected');
      alert('Your opponent has disconnected.');
    });

    newSocket.on('error', ({ message }) => {
      console.error('Backend error:', message);
      alert(`Error: ${message}`);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from backend');
      setGameStatus('disconnected');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [backendUrl]);

  const handleGoHome = () => {
    window.location.reload();
  };

  const handleConnect = () => {
    if (socket && connectGameId.trim()) {
      joiningGameIdRef.current = connectGameId.trim();
      socket.emit('join-game', { gameId: connectGameId.trim() });
    }
  };
  
  const handleRollDice = () => {
    if (socket && turn === playerColor && gameId) {
      socket.emit('roll-dice', { gameId });
    }
  };

  const handleMovePiece = (fromPointIndex: number, toPointIndex: number) => {
    if (socket && turn === playerColor && gameId) {
      // Optimistically update movesLeft
      const moveDistance = Math.abs(toPointIndex - fromPointIndex);
      const moveIndex = movesLeft.indexOf(moveDistance);
      if (moveIndex > -1) {
        const newMovesLeft = [...movesLeft];
        newMovesLeft.splice(moveIndex, 1);
        setMovesLeft(newMovesLeft);
      }
      
      socket.emit('move-piece', { gameId, fromPointIndex, toPointIndex });
    }
  };

  const handleEndTurn = () => {
    if (socket && turn === playerColor && gameId) {
      socket.emit('end-turn', { gameId });
    }
  };

  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'connecting':
        return 'Connecting to server...';
      case 'disconnected':
        return 'Disconnected. Please refresh to start a new game.';
      case 'waiting':
        return 'Waiting for another player to join...';
      case 'active':
        return turn === playerColor ? "It's your turn!" : `Waiting for ${turn} to move...`;
      default:
        return 'Loading...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col font-sans">
      <Header
        gameId={gameId}
        onShowAbout={() => setShowAboutModal(true)}
        onShowConfig={() => setShowConfigModal(true)}
        onShowConnect={() => setShowConnectModal(true)}
        onLogoClick={handleGoHome}
      />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-5xl text-center mb-2 p-2 bg-gray-900 rounded-md shadow-lg">
            <p className="text-lg text-cyan-300 font-semibold">{getStatusMessage()}</p>
            {playerColor && gameStatus !== 'waiting' && <p className="text-sm text-gray-400">You are playing as {playerColor}.</p>}
        </div>
        <GamePage
          gameId={gameId}
          boardState={boardState}
          dice={dice}
          movesLeft={movesLeft}
          turn={turn}
          playerColor={playerColor}
          onRollDice={handleRollDice}
          onMovePiece={handleMovePiece}
          onEndTurn={handleEndTurn}
          gameActive={gameStatus === 'active'}
        />
      </main>
      
      <Modal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)}
        title="About BackGammon"
      >
        <p className="text-gray-300">
          This application allows two players to enjoy a game of backgammon online. 
          The interface is designed to be intuitive and realistic, providing a great virtual tabletop experience.
        </p>
        <p className="mt-4 text-gray-300">
          To play with a friend, copy your Game ID from the header and send it to them. They can use the 'Connect' button to join your game.
        </p>
      </Modal>

      <Modal 
        isOpen={showConfigModal} 
        onClose={() => setShowConfigModal(false)}
        title="Configuration"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="backendUrlInput" className="block text-left text-gray-300 font-medium mb-2">
              Backend Service URL
            </label>
            <input
              type="text"
              id="backendUrlInput"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="Enter backend service URL"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-gray-400 mt-2 text-sm">
              This URL is used to connect to the game server for multiplayer functionality.
            </p>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={showConnectModal} 
        onClose={() => setShowConnectModal(false)}
        title="Connect to Game"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="gameIdInput" className="block text-left text-gray-300 font-medium mb-2">
              Game ID
            </label>
            <input
              type="text"
              id="gameIdInput"
              value={connectGameId}
              onChange={(e) => setConnectGameId(e.target.value)}
              placeholder="Enter friend's Game ID"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <button
            onClick={handleConnect}
            disabled={!connectGameId.trim()}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
          >
            Connect
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default App;