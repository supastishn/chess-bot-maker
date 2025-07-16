import { useState } from 'react';
import { Chess } from 'chess.js';

export const useGameLogic = (initialFen) => {
  const [game] = useState(new Chess(initialFen));

  return {
    makeMove: (from, to) => {
      try {
        return game.move({ from, to, promotion: 'q' });
      } catch {
        return null;
      }
    },
    currentState: () => ({
      fen: game.fen(),
      turn: game.turn(),
      isCheckmate: game.isCheckmate(),
      isStalemate: game.isStalemate(),
    })
  };
};
