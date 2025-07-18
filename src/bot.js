import { Chess } from '@chrisoakman/chess.js';

// Custom bot implementation using basic material evaluation
export const makeBotMove = (fen) => {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;

  // Immediate win detection
  const winningMove = moves.find(move => {
    const gameCopy = new Chess(fen);
    gameCopy.move(move);
    return gameCopy.isCheckmate();
  });
  if (winningMove) return winningMove;

  // Evaluate moves based on material difference
  const isBlackTurn = game.turn() === 'b';
  let bestScore = isBlackTurn ? Infinity : -Infinity;
  let bestMoves = [];
  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };

  for (const move of moves) {
    const gameCopy = new Chess(fen);
    gameCopy.move(move);
    
    let score = 0;
    // Calculate material difference
    const board = gameCopy.board();
    for (const row of board) {
      for (const piece of row) {
        if (piece) {
          const value = pieceValues[piece.type] || 0;
          score += piece.color === 'w' ? value : -value;
        }
      }
    }
    
    // Update best moves based on turn
    if ((isBlackTurn && score < bestScore) || 
        (!isBlackTurn && score > bestScore)) {
      bestScore = score;
      bestMoves = [move];
    } 
    else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  // Select randomly from equally good moves
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
};
