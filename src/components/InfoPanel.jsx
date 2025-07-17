import React from 'react';
import { RefreshCw } from 'lucide-react';

const InfoPanel = ({ status: { isCheckmate, isStalemate, isRepetition }, turn, onReset }) => {
  const statusText = 
    isCheckmate ? `${turn === 'white' ? 'Black' : 'White'} wins by Checkmate` :
    isStalemate ? 'Draw by Stalemate!' :
    isRepetition ? 'Draw by Repetition!' : 
    `Current turn: ${turn.charAt(0).toUpperCase() + turn.slice(1)}`;

  return (
    <div className="info-panel glass-card">
      <div className="turn-indicator">{statusText}</div>
      <button className="btn reset-button" onClick={onReset}>
        <RefreshCw size={16} />
        Reset Game
      </button>
    </div>
  );
};

export default InfoPanel;
