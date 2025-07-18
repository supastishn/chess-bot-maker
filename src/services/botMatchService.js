import { Chess } from 'chess.js';
import { getBot } from '../bot/botInterface';

export const runBotMatch = async (whiteBotName, blackBotName, onUpdate, maxMoves = 100) => {
  const game = new Chess();
  onUpdate?.(game.fen(), whiteBotName, blackBotName);
  
  for (let moveCount = 0; moveCount < maxMoves && !game.isGameOver(); moveCount++) {
    const botName = game.turn() === 'w' ? whiteBotName : blackBotName;
    const bot = getBot(botName);
    
    try {
      const gameCopy = new Chess(game.fen());
      const move = await bot(gameCopy);
      if (move) {
        game.move(move);
        onUpdate?.(game.fen(), whiteBotName, blackBotName);
      } else {
        break;
      }
    } catch (e) {
      console.error('Bot error:', e);
      break;
    }
  }

  return {
    fen: game.fen(),
    history: game.history(),
    winner: game.turn() === 'w' ? 'black' : 'white'
  };
};
