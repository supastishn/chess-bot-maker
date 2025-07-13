export const materialBot = (game) => {
  console.log("[MaterialBot] Calculating move");
  const moves = game.getAvailableMoves();
  if (moves.length === 0) return null;
  
  // Check for immediate checkmate
  for (const move of moves) {
    console.log(`[MaterialBot] Evaluating move: ${JSON.stringify(move)}`);
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
    console.log(`[MaterialBot] Evaluating move: ${JSON.stringify(move)}`);
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
  
  console.log(`[MaterialBot] Selected move: ${JSON.stringify(bestMoves[0])}`);
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
};
