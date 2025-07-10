import React from 'react';

const InfoPanel = ({ status, turn, onReset }) => {
  return (
    <div className="info-panel">
      <div className="turn-indicator">
        {status.isCheckmate ? (
          <div className="game-status">
            Checkmate! {turn === 'white' ? 'Black' : 'White'} wins.
          </div>
        ) : status.isStalemate ? (
          <div className="game-status">Draw by Stalemate!</div>
        ) : status.isRepetition ? (
          <div className="game-status">Draw by Repetition!</div>
        ) : (
          `Current turn: ${turn.charAt(0).toUpperCase() + turn.slice(1)}`
        )}
      </div>

      <button className="reset-button" onClick={onReset}>
        Reset Game
      </button>
    </div>
  );
};

export default InfoPanel;
