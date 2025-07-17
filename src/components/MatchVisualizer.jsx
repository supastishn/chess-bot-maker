import React, { useRef, useEffect } from 'react';
import { Chessground } from 'chessground';
import '../chessground-base.css';
import '../chessground-brown.css';
import '../chessground-cburnett.css';

const MatchVisualizer = ({ gameState }) => {
  const boardRef = useRef(null);
  const cgRef = useRef(null);

  useEffect(() => {
    if (boardRef.current && !cgRef.current) {
      cgRef.current = Chessground(boardRef.current, {
        viewOnly: true,
        highlight: { lastMove: true },
      });
    }
  }, []);

  useEffect(() => {
    if (cgRef.current && gameState?.fen) {
      cgRef.current.set({ fen: gameState.fen });
    }
  }, [gameState?.fen]);

  const { white, black } = gameState || {};

  return (
    <div className="match-visualizer">
      <h3>
        Current Match: <span className="player-name">{white || '...'}</span> vs <span className="player-name">{black || '...'}</span>
      </h3>
      <div ref={boardRef} className="board-container" style={{
        width: '100%',
        maxWidth: '400px',
        aspectRatio: '1/1',
        margin: '0 auto'
      }}></div>
    </div>
  );
};

export default MatchVisualizer;
