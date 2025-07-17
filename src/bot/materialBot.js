export const materialBot = (game) => {
  const moves = game.getAvailableMoves?.() || [];
  if (moves.length === 0) return null;

  // --- Check for immediate checkmate ---
  for (const move of moves) {
    try {
      game.move(move);
    } catch (e) {
      // This move is illegal for some reason, so we skip it.
      continue;
    }
    
    const isMate = game.isCheckmate();
    game.undo(); // Crucial: undo the move to restore state for the next loop iteration.

    if (isMate) {
      return move; // Found a checkmate.
    }
  }

  // --- Material evaluation ---
  const isBlack = game.getTurn() === 'b';
  let bestScore = isBlack ? Infinity : -Infinity;
  let bestMoves = [];

  for (const move of moves) {
    try {
      game.move(move);
    } catch (e) {
      // This move is illegal for some reason, so we skip it.
      continue;
    }

    const score = game.evaluateMaterial();
    game.undo(); // Crucial: undo after evaluation.

    if ((isBlack && score < bestScore) || (!isBlack && score > bestScore)) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  if (bestMoves.length === 0) {
    // This should not happen if `moves` is not empty, but it's a safe fallback.
    return moves[Math.floor(Math.random() * moves.length)];
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
};
