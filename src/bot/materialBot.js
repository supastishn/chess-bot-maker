export const materialBot = (game) => {
  const moves = game.getAvailableMoves();
  if (moves.length === 0) return null;
  
  // Check for immediate checkmate
  for (const move of moves) {
    game.move(move);
    if (game.getGameResult() === 'checkmate') {
      game.undoMove();
      return move;
    }
    game.undoMove();
  }

  // Material evaluation
  const isBlack = game.getTurn() === 'b';
  let bestScore = isBlack ? Infinity : -Infinity;
  let bestMoves = [];
  
  for (const move of moves) {
    game.move(move);
    const score = game.evaluateMaterial();
    game.undoMove();
    
    if ((isBlack && score < bestScore) || (!isBlack && score > bestScore)) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }
  
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
};
