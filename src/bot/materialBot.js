import { Chess } from '@chrisoakman/chess.js';

export const materialBot = (currentGame) => {
  const game = new Chess(currentGame.fen());
  const moves = game.moves({ verbose: true });
  
  // Immediate win detection
  const winningMove = moves.find(move => {
    const gameCopy = new Chess(game.fen());
    gameCopy.move(move);
    return gameCopy.isCheckmate();
  });
  if (winningMove) return winningMove;

  // Material evaluation
  const isBlackTurn = game.turn() === 'b';
  let bestScore = isBlackTurn ? Infinity : -Infinity;
  let bestMoves = [];
  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };

  for (const move of moves) {
    const gameCopy = new Chess(game.fen());
    gameCopy.move(move);
    
    let score = 0;
    const board = gameCopy.board();
    board.forEach(row => {
      row.forEach(piece => {
        if (piece) {
          const value = pieceValues[piece.type] || 0;
          score += piece.color === 'w' ? value : -value;
        }
      });
    });
    
    if ((isBlackTurn && score < bestScore) || 
        (!isBlackTurn && score > bestScore)) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
};
