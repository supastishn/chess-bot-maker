export const getFen = (gameClient) => {
  // Use chess.js directly if available
  try {
    return gameClient.fen();
  } catch (e) {
    console.error('Error getting FEN:', e);
    // Fallback to starting position
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }
};
