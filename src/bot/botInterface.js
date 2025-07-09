/**
 * Bot Interface Specification:
 * - Must be a function that takes Chess instance and returns move object
 * - Example: (game) => game.moves()[0] 
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
registerBot('starter-bot', (game) => {
  const moves = game.moves({ verbose: true });
  return moves[Math.floor(Math.random() * moves.length)];
});
