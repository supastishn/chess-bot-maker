import React from 'react';
import { RefreshCw } from 'lucide-react';

const InfoPanel = ({ status, turn, onReset }) => {
  // More descriptive game states
  return (
    <div className="info-panel glass-card">
      <div className="turn-indicator">
        {status.isCheckmate && <div>{`${turn === 'white' ? 'Black' : 'White'} wins by Checkmate`}</div>}
        {status.isStalemate && <div>Draw by Stalemate!</div>}
        {status.isRepetition && <div>Draw by Repetition!</div>}
        {!status.isCheckmate && !status.isStalemate && !status.isRepetition && 
          `Current turn: ${turn.charAt(0).toUpperCase() + turn.slice(1)}`}
      </div>

      <button className="btn reset-button" onClick={onReset}>
        <RefreshCw size={16} />
        Reset Game
      </button>
    </div>
  );
};

export default InfoPanel;
