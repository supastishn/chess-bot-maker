function getTurnFromStatus(status) {
    if (!status.notatedMoves || Object.keys(status.notatedMoves).length === 0) return 'w';
    const firstMove = Object.values(status.notatedMoves)[0];
    return firstMove.src.piece.side.name === 'white' ? 'w' : 'b';
}

export const materialBot = (gameClient) => {
  const status = gameClient.getStatus();
  const moves = status.notatedMoves;
  const moveKeys = Object.keys(moves);

  if (moveKeys.length === 0) return null;
  
  // Look for an immediate checkmating move
  for (const moveKey of moveKeys) {
      const moveResult = gameClient.move(moveKey);
      if (gameClient.getStatus().isCheckmate) {
          moveResult.undo();
          const moveDetails = moves[moveKey];
          return { from: moveDetails.src.file + moveDetails.src.rank, to: moveDetails.dest.file + moveDetails.dest.rank };
      }
      moveResult.undo();
  }

  // Evaluate material
  const turn = getTurnFromStatus(status);
  const isBlackTurn = turn === 'b';
  let bestScore = isBlackTurn ? Infinity : -Infinity;
  let bestMoves = [];
  const pieceValues = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9 };

  for (const moveKey of moveKeys) {
    const moveResult = gameClient.move(moveKey);
    const newStatus = gameClient.getStatus();
    
    let score = 0;
    newStatus.board.squares.forEach(s => {
        if (s.piece) {
            const value = pieceValues[s.piece.type] || 0;
            score += s.piece.side.name === 'white' ? value : -value;
        }
    });
    
    moveResult.undo();
    
    if ((isBlackTurn && score < bestScore) || (!isBlackTurn && score > bestScore)) {
      bestScore = score;
      bestMoves = [moveKey];
    } else if (score === bestScore) {
      bestMoves.push(moveKey);
    }
  }

  const randomBestMoveKey = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  const moveDetails = moves[randomBestMoveKey];
  return { from: moveDetails.src.file + moveDetails.src.rank, to: moveDetails.dest.file + moveDetails.dest.rank };
};
