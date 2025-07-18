import { useState, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';

const useChessGame = (initialFen) => {
  const gameRef = useRef(new Chess(initialFen));
  const [fen, setFen] = useState(initialFen);
  const [gameState, setGameState] = useState({
    turn: 'white',
    isCheckmate: false,
    isStalemate: false,
    isDraw: false
  });

  const makeMove = useCallback((move) => {
    try {
      const result = gameRef.current.move(move);
      if (result) {
        updateGameState();
        return result;
      }
      return null;
    } catch (e) {
      return null;
    }
  }, []);

  const resetGame = useCallback(() => {
    gameRef.current = new Chess();
    updateGameState();
  }, []);

  const updateGameState = useCallback(() => {
    const game = gameRef.current;
    const newFen = game.fen();
    const turn = game.turn() === 'w' ? 'white' : 'black';
    
    setFen(newFen);
    setGameState({
      turn,
      isCheckmate: game.isCheckmate(),
      isStalemate: game.isStalemate(),
      isDraw: game.isDraw(),
      canMove: !game.isGameOver()
    });
  }, []);

  return {
    fen,
    gameState,
    makeMove,
    resetGame,
    gameRef
  };
};

export default useChessGame;
