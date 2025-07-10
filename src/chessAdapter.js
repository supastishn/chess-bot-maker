/**
 * Adapter for the 'chess' library to provide FEN and move translation for react-chessboard.
 */

// --- Helper Functions ---

function getTurnFromStatus(status) {
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
    const status = gameClient.getStatus();
    const { board } = status;

    // 1. Piece placement
    const ranks = {};
    for (let i = 1; i <= 8; i++) ranks[i] = new Array(8).fill(null);
    board.squares.forEach(s => {
        if (s.piece) {
            const fileIndex = s.file.charCodeAt(0) - 'a'.charCodeAt(0);
            ranks[s.rank][fileIndex] = s.piece;
        }
    });

    let fen = '';
    for (let i = 8; i >= 1; i--) {
        let emptyCount = 0;
        for (let j = 0; j < 8; j++) {
            const piece = ranks[i][j];
            if (!piece) {
                emptyCount++;
            } else {
                if (emptyCount > 0) {
                    fen += emptyCount;
                    emptyCount = 0;
                }
                fen += squareToFen(piece);
            }
        }
        if (emptyCount > 0) fen += emptyCount;
        if (i > 1) fen += '/';
    }

    // 2. Active color
    fen += ` ${getTurnFromStatus(status)}`;

    // 3. Castling availability (inferred)
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
    
    // 4 & 5 & 6. En passant, half-move, full-move (not available in library)
    fen += ' - 0 1';

    return fen;
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
