const openingDB = {
  // Starting position
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq": [
    "e2e4", "d2d4", "c2c4", "g1f3"
  ],
  // After 1.e4
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3": [
    "e7e5", "c7c5", "e7e6", "c7c6"
  ],
  // Add more positions as needed
};

const getOpeningBook = () => openingDB;

// Simplified FEN generator (positions + castling rights)
export const getPositionKey = (fen) => {
  const parts = fen.split(' ');
  return parts.slice(0, 4).join(' ');
};

export default getOpeningBook;
