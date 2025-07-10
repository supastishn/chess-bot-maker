/**
 * Bot Interface Specification:
 * - Must be a function that takes a game client and returns a move object
 * - Example: (gameClient) => { from: 'e2', to: 'e4' }
 */

const registeredBots = new Map();
const DEFAULT_BOT_NAME = 'starter-bot';

export const registerBot = (name, botFunction) => {
  if (typeof botFunction !== 'function') {
    throw new Error('Bot must be a function');
  }
  registeredBots.set(name, botFunction);
};

export const getBot = (name) => {
  const bot = registeredBots.get(name);
  return bot || registeredBots.get(DEFAULT_BOT_NAME);
};

export const getBotNames = () => Array.from(registeredBots.keys());

// Register built-in bots
import { materialBot } from './materialBot';

registerBot('material-bot', materialBot);
registerBot('starter-bot', (gameClient) => {
  const status = gameClient.getStatus();
  const moves = status.notatedMoves;
  const moveKeys = Object.keys(moves);
  if (moveKeys.length === 0) return null;
  const randomKey = moveKeys[Math.floor(Math.random() * moveKeys.length)];
  const moveDetails = moves[randomKey];
  return { from: moveDetails.src.file + moveDetails.src.rank, to: moveDetails.dest.file + moveDetails.dest.rank };
});
