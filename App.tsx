import React, { useState } from 'react';
import Header from './components/Header';
import GamePage from './components/GamePage';
import Modal from './components/Modal';

function App() {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectGameId, setConnectGameId] = useState('');
  const [backendUrl, setBackendUrl] = useState('https://backend-server-mcodev.replit.app');

  const handleGoHome = () => {
    // In the future, this could reset the game board.
    // For now, it does nothing as we are always on the main page.
    window.location.reload();
  };

  const handleConnect = () => {
    // In a real app, this would use the connectGameId to connect to a game session.
    console.log('Connecting to game:', connectGameId);
    setShowConnectModal(false);
    setConnectGameId('');
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col font-sans">
      <Header
        onShowAbout={() => setShowAboutModal(true)}
        onShowConfig={() => setShowConfigModal(true)}
        onShowConnect={() => setShowConnectModal(true)}
        onLogoClick={handleGoHome}
      />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <GamePage />
      </main>
      
      <Modal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)}
        title="About Online Backgammon"
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