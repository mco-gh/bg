import React from 'react';

interface DiceProps {
  value: number;
}

const Pip: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-gray-800 rounded-full ${className}`} />
);

const Dice: React.FC<DiceProps> = ({ value }) => {
  // Helper to center content in a grid cell
  const Cell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
      <div className={`flex items-center justify-center ${className}`}>
          {children}
      </div>
  );

  const renderPips = (val: number) => {
    const p = <Pip />;
    switch (val) {
      case 1:
        return <Cell className="col-start-2 row-start-2">{p}</Cell>;
      case 2:
        return (
          <>
            <Cell className="col-start-3 row-start-1">{p}</Cell>
            <Cell className="col-start-1 row-start-3">{p}</Cell>
          </>
        );
      case 3:
        return (
          <>
            <Cell className="col-start-3 row-start-1">{p}</Cell>
            <Cell className="col-start-2 row-start-2">{p}</Cell>
            <Cell className="col-start-1 row-start-3">{p}</Cell>
          </>
        );
      case 4:
        return (
          <>
            <Cell className="col-start-1 row-start-1">{p}</Cell>
            <Cell className="col-start-3 row-start-1">{p}</Cell>
            <Cell className="col-start-1 row-start-3">{p}</Cell>
            <Cell className="col-start-3 row-start-3">{p}</Cell>
          </>
        );
      case 5:
        return (
          <>
            <Cell className="col-start-1 row-start-1">{p}</Cell>
            <Cell className="col-start-3 row-start-1">{p}</Cell>
            <Cell className="col-start-2 row-start-2">{p}</Cell>
            <Cell className="col-start-1 row-start-3">{p}</Cell>
            <Cell className="col-start-3 row-start-3">{p}</Cell>
          </>
        );
      case 6:
        return (
          <>
            <Cell className="col-start-1 row-start-1">{p}</Cell>
            <Cell className="col-start-1 row-start-2">{p}</Cell>
            <Cell className="col-start-1 row-start-3">{p}</Cell>
            <Cell className="col-start-3 row-start-1">{p}</Cell>
            <Cell className="col-start-3 row-start-2">{p}</Cell>
            <Cell className="col-start-3 row-start-3">{p}</Cell>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-200 rounded-lg shadow-lg grid grid-cols-3 grid-rows-3 p-2 sm:p-3 gap-0.5" aria-label={`Dice showing ${value}`}>
      {renderPips(value)}
    </div>
  );
};

export default Dice;