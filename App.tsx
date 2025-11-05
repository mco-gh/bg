import React, { useState } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import GamePage from './components/GamePage';
import Modal from './components/Modal';
import { GameState } from './types';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.Landing);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleStartGame = (state: GameState) => {
    setGameState(state);
  };
  
  const handleGoHome = () => {
    setGameState(GameState.Landing);
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.Hosting:
      case GameState.Connected:
        return <GamePage />;
      case GameState.Landing:
      default:
        return <LandingPage onStartGame={handleStartGame} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col font-sans">
      <Header
        onShowAbout={() => setShowAboutModal(true)}
        onShowConfig={() => setShowConfigModal(true)}
        onLogoClick={handleGoHome}
      />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {renderContent()}
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
          To start, one player must host a new game. They will receive a unique Game URL to share with their opponent. 
          The second player uses this URL to connect to the game session.
        </p>
      </Modal>

      <Modal 
        isOpen={showConfigModal} 
        onClose={() => setShowConfigModal(false)}
        title="Configuration"
      >
        <p className="text-gray-400">Configuration settings will be available here in a future update.</p>
      </Modal>
    </div>
  );
}

export default App;