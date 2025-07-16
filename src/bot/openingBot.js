import { materialBot } from './materialBot';

export const openingBot = (game) => {
  // Use book moves for first 10 moves
  if (game.getMoveCount && game.getMoveCount() < 10) {
    const bookMove = game.playBookMove();
    if (bookMove) return bookMove;
  }
  
  // Fallback to material eval
  return materialBot(game);
};
