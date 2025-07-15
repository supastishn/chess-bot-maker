/**
 * Adapter for the 'chess' library to provide FEN and move translation for react-chessboard.
 */

// --- Helper Functions ---

export function getTurnFromStatus(status) {
    if (!status.notatedMoves || Object.keys(status.notatedMoves).length === 0) {
        return 'w'; // Fallback
    }
    const firstMove = Object.values(status.notatedMoves)[0];
    return firstMove.src.piece.side.name === 'white' ? 'w' : 'b';
}

function squareToFen(piece) {
  // This function is only called when a piece exists on a square.
  const typeToNotation = {
    pawn: 'p', knight: 'n', bishop: 'b', rook: 'r', queen: 'q', king: 'k'
  };
  const notation = typeToNotation[piece.type];

  // Return empty string for unknown piece types to avoid creating an invalid FEN.
  if (!notation) {
    console.error("Unknown piece type:", piece.type);
    return '';
  }
  
  return piece.side.name === 'white' ? notation.toUpperCase() : notation;
}

// --- Adapter API ---

export const getFen = (gameClient) => {
  try {
    const status = gameClient.getStatus();
    const { board } = status;

    // Piece placement
    const ranks = Array.from({ length: 8 }, () => Array(8).fill(null));
    // Map squares to ranks/files
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach((file, fileIdx) => {
      for (let rank = 1; rank <= 8; rank++) {
        const square = board.squares.find(s =>
          s.file === file && s.rank === rank
        );
        if (square?.piece) {
          ranks[8 - rank][fileIdx] = squareToFen(square.piece);
        }
      }
    });

    let fen = '';
    ranks.forEach(rank => {
      let empties = 0;
      rank.forEach(sq => {
        if (!sq) {
          empties++;
        } else {
          if (empties > 0) {
            fen += empties;
            empties = 0;
          }
          fen += sq;
        }
      });
      if (empties > 0) fen += empties;
      fen += '/';
    });
    fen = fen.slice(0, -1); // Remove trailing slash

    // Active color
    fen += ` ${getTurnFromStatus(status)}`;

    // 3. Castling availability
    let castle = '';
    const whiteKing = board.squares.find(s => s.piece?.type === 'king' && s.piece.side.name === 'white')?.piece;
    const blackKing = board.squares.find(s => s.piece?.type === 'king' && s.piece.side.name === 'black')?.piece;
    const a1Rook = board.squares.find(s => s.file === 'a' && s.rank === 1 && s.piece?.type === 'rook')?.piece;
    const h1Rook = board.squares.find(s => s.file === 'h' && s.rank === 1 && s.piece?.type === 'rook')?.piece;
    const a8Rook = board.squares.find(s => s.file === 'a' && s.rank === 8 && s.piece?.type === 'rook')?.piece;
    const h8Rook = board.squares.find(s => s.file === 'h' && s.rank === 8 && s.piece?.type === 'rook')?.piece;

    if (whiteKing?.moveCount === 0) {
      if (h1Rook?.moveCount === 0) castle += 'K';
      if (a1Rook?.moveCount === 0) castle += 'Q';
    }
    if (blackKing?.moveCount === 0) {
      if (h8Rook?.moveCount === 0) castle += 'k';
      if (a8Rook?.moveCount === 0) castle += 'q';
    }
    fen += ` ${castle || '-'}`;

    // 4, 5, & 6. Other FEN parts
    fen += ' - 0 1';

    return fen;
  } catch (error) {
    console.error("[Adapter] Critical FEN generation error:", error);
    // Fallback to the starting position to prevent a crash
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }
};

export const findMoveNotation = (gameClient, moveObj) => {
    const { from, to, promotion } = moveObj;
    const status = gameClient.getStatus();
    const { notatedMoves } = status;

    for (const key in notatedMoves) {
        const move = notatedMoves[key];
        const srcSquare = move.src.file + move.src.rank;
        const destSquare = move.dest.file + move.dest.rank;

        if (srcSquare === from && destSquare === to) {
            let moveNotation = key;
            const piece = move.src.piece;
            if (piece.type === 'pawn' && (to[1] === '8' || to[1] === '1')) {
                 moveNotation += `=${(promotion || 'q').toUpperCase()}`;
            }
            return moveNotation;
        }
    }
    return null;
};
