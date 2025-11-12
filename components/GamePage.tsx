import React from 'react';
import BackgammonBoard from './BackgammonBoard';
import DiceTray from './DiceTray';

const GamePage: React.FC = () => {
  return (
    <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-center gap-8 px-4">
      <div className="w-full max-w-4xl flex-shrink">
        <BackgammonBoard />
      </div>
      <div className="w-full md:w-auto md:max-w-xs flex-shrink-0">
        <DiceTray />
      </div>
    </div>
  );
};

export default GamePage;