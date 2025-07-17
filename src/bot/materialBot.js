export const materialBot = (game) => {
  const moves = game.getAvailableMoves?.() || [];
  if (moves.length === 0) return null;

  for (const move of moves) {
    try {
      game.move(move);
      if (game.isCheckmate()) {
        game.undoMove();
        return move;
      }
      game.undoMove();
    } catch (e) {
      // ignore illegal move and continue
    }
  }

  // Material evaluation
  const isBlack = game.getTurn() === 'b';
  let bestScore = isBlack ? Infinity : -Infinity;
  let bestMoves = [];

  for (const move of moves) {
    try {
      game.move(move);
      const score = game.evaluateMaterial();
      game.undoMove();

      if ((isBlack && score < bestScore) || (!isBlack && score > bestScore)) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    } catch (e) {
      // ignore illegal move and continue
    }
  }

  if (bestMoves.length === 0) {
    return null;
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
};
