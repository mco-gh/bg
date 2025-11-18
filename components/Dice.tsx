import React from 'react';

interface DiceProps {
  value: number;
}

const Pip: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-gray-800 rounded-full ${className}`} />
);

const Dice: React.FC<DiceProps> = ({ value }) => {
  const renderPips = (val: number) => {
    switch (val) {
      case 1: return <div className="flex justify-center items-center w-full h-full"><Pip /></div>;
      case 2: return <div className="flex flex-col justify-between w-full h-full p-2"><Pip className="self-start" /><Pip className="self-end" /></div>;
      case 3: return <div className="flex flex-col justify-between w-full h-full p-2"><Pip className="self-start" /><Pip className="self-center" /><Pip className="self-end" /></div>;
      case 4: return <div className="flex justify-between w-full h-full"><div className="flex flex-col justify-between p-2"><Pip /><Pip /></div><div className="flex flex-col justify-between p-2"><Pip /><Pip /></div></div>;
      case 5: return <div className="flex justify-between w-full h-full"><div className="flex flex-col justify-between p-2"><Pip /><Pip /></div><div className="flex flex-col justify-center items-center"><Pip /></div><div className="flex flex-col justify-between p-2"><Pip /><Pip /></div></div>;
      case 6: return <div className="flex justify-between w-full h-full"><div className="flex flex-col justify-between p-2"><Pip /><Pip /><Pip /></div><div className="flex flex-col justify-between p-2"><Pip /><Pip /><Pip /></div></div>;
      default: return null;
    }
  };

  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-200 rounded-lg shadow-lg flex justify-center items-center p-2" aria-label={`Dice showing ${value}`}>
      {renderPips(value)}
    </div>
  );
};

export default Dice;