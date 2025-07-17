
import { Chess } from 'chess.js';

import StockfishEngine from './stockfishEngine.js';
import getOpeningBook, { getPositionKey } from '../services/openingService.js';

const openingDB = getOpeningBook();
let stockfishEngine = null;

const USER_BOTS_KEY = 'chess-user-bots';
const registeredBots = new Map();
const botSources = new Map();
const DEFAULT_BOT_NAME = 'starter-bot';

export const getBotSource = (name) => {
  return botSources.get(name) || "// No source code available";
};

const createBotHelper = (gameClient) => {
  const helper = {};

  // Game state methods
  helper.getAvailableMoves = () => gameClient.moves({ verbose: false });
  helper.getVerboseMoves = () => gameClient.moves({ verbose: true });
  helper.getTurn = () => gameClient.turn();
  helper.isCheckmate = () => gameClient.isCheckmate();
  helper.isStalemate = () => gameClient.isStalemate();
  helper.isDraw = () => gameClient.isDraw();
  helper.isGameOver = () => gameClient.isGameOver();
  helper.getFEN = () => gameClient.fen();
  helper.undoMove = () => gameClient.undo();
  helper.move = (m) => gameClient.move(m);
  helper.isAttacked = (square, byColor) => gameClient.isAttacked(square, byColor);
  helper.getMoveCount = () => gameClient.history().length;

  // --- More advanced helpers ---
  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
  helper.evaluateMaterial = () => {
    const board = gameClient.board();
    let score = 0;
    for (const row of board) {
      for (const piece of row) {
        if (piece) {
          const value = pieceValues[piece.type] || 0;
          score += piece.color === 'w' ? value : -value;
        }
      }
    }
    return score;
  };

  helper.lookAhead = (move, depth) => {
    // This is a simplified implementation for bot compatibility
    const clientCopy = new Chess(gameClient.fen());
    const moveResult = clientCopy.move(move);
    if (!moveResult) return { score: -Infinity };
    let score = 0;
    clientCopy.board().forEach(row => row.forEach(piece => {
      if (!piece) return;
      score += (pieceValues[piece.type] || 0) * (piece.color === 'w' ? 1 : -1);
    }));
    return { score };
  };

  helper.prioritizeStrategy = (weights) => {
    const moves = helper.getAvailableMoves();
    if (moves.length === 0) return null;
    // This is a placeholder; a real implementation would be more complex
    return moves[Math.floor(Math.random() * moves.length)];
  };

  helper.stockfish = () => ({
    skillLevel: 20,
    hashSize: 256,
    contempt: 0,
    async init(depth = 15) {
      if (!stockfishEngine && typeof Worker !== 'undefined') {
        stockfishEngine = new StockfishEngine(depth);
      }
      stockfishEngine?.setOption?.("Skill Level", this.skillLevel);
      stockfishEngine?.setOption?.("Hash", this.hashSize);
      stockfishEngine?.setOption?.("Contempt", this.contempt);
    },
    async getBestMove(fen, depth = 15) {
      await this.init(depth);
      if (stockfishEngine) {
        return stockfishEngine.evaluatePosition(fen, depth);
      }
      throw new Error("Stockfish engine initialization failed");
    }
  });

  helper.benchmark = (depth = 16) => {
    if (!gameClient.stockfish?.engine) {
      return Promise.reject("Stockfish engine not initialized");
    }
    return gameClient.stockfish.runBenchmark(depth);
  };

  return { ...helper, ...gameClient };
};

export const registerBot = (name, botFunction, source) => {
  console.log(`[Bot] Registering bot: ${name}`);
  if (typeof botFunction !== 'function') {
    throw new Error('Bot must be a function');
  }
  if (source) {
    botSources.set(name, source);
  }
  // Wrap the botFunction to provide the helper API
  registeredBots.set(name, (gameClient) =>
    botFunction(createBotHelper(gameClient))
  );
};

export const registerUserBot = (name, botFunction, source) => {
  registerBot(name, botFunction, source); // Register in-memory for the current session

  try {
    const userBots = JSON.parse(localStorage.getItem(USER_BOTS_KEY) || '[]');
    const botIndex = userBots.findIndex(b => b.name === name);
    const newBot = { name, source };

    if (botIndex > -1) {
      userBots[botIndex] = newBot;
    } else {
      userBots.push(newBot);
    }
    localStorage.setItem(USER_BOTS_KEY, JSON.stringify(userBots));
  } catch (e) {
    console.error("Failed to save user bot to localStorage:", e);
  }
};

const stockfishBotFn = async (game) => {
  const fen = game.getFEN ? game.getFEN() : game.fen();
  // Correctly call the stockfish helper to get the API object
  return game.stockfish().getBestMove(fen);
};
registerBot('stockfish-bot', stockfishBotFn, stockfishBotFn.toString());

export const getBot = (name) => {
  const bot = registeredBots.get(name);
  return bot || registeredBots.get(DEFAULT_BOT_NAME);
};

export const getBotNames = () => Array.from(registeredBots.keys());

 // Register built-in bots
import { materialBot } from './materialBot.js';

const guruBotFn = (game) => {
  const moves = game.getAvailableMoves();
  if (moves.length === 0) return null;
  
  return game.prioritizeStrategy({
    development: 0.3,
    kingSafety: 0.3,
    centerControl: 0.2,
    material: 0.2
  });
};
registerBot('guru-bot', guruBotFn, guruBotFn.toString());

registerBot('material-bot', materialBot, materialBot.toString());

const aggressiveBotFn = (game) => {
  const moves = game.getVerboseMoves();
  if (!moves.length) return null;

  const captureMoves = moves.filter(m => m.flags.includes('c'));

  if (captureMoves.length > 0) {
    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    captureMoves.sort((a, b) => {
        const valA = pieceValues[a.captured] || 0;
        const valB = pieceValues[b.captured] || 0;
        return valB - valA; // highest value first
    });
    const bestCapture = captureMoves[0];
    return bestCapture.promotion 
      ? bestCapture.from + bestCapture.to + bestCapture.promotion 
      : bestCapture.from + bestCapture.to;
  }
  
  // Fallback to a random move from available moves, consistent with randomBot
  const availableMoves = game.getAvailableMoves();
  if (!availableMoves.length) return null;
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};
registerBot('aggressive-bot', aggressiveBotFn, aggressiveBotFn.toString());

const defensiveBotFn = (game) => {
  const moves = game.getAvailableMoves();
  if (!moves.length) return null;

  const opponentColor = game.getTurn() === 'w' ? 'b' : 'w';
  
  const safeMoves = moves.filter(move => {
    const dest = move.slice(2, 4);
    return !game.isAttacked(dest, opponentColor);
  });

  if (safeMoves.length > 0) {
    return safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }

  return moves[Math.floor(Math.random() * moves.length)];
};
registerBot('defensive-bot', defensiveBotFn, defensiveBotFn.toString());

const positionalBotFn = (game) => {
  const moves = game.getAvailableMoves();
  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    const result = game.lookAhead(move, 2);
    if (result.score > bestScore) {
      bestScore = result.score;
      bestMove = move;
    }
  }
  return bestMove;
};
registerBot('positional-bot', positionalBotFn, positionalBotFn.toString());

const toggleBotFn = (game) => {
  const moveCount = game.getMoveCount();
  const turnNumber = Math.floor(moveCount / 2);
  const aiMode = turnNumber % 3;

  if (aiMode === 0) return getBot('material-bot')(game);
  if (aiMode === 1) return getBot('aggressive-bot')(game);
  return getBot('positional-bot')(game);
};
registerBot('toggle-bot', toggleBotFn, toggleBotFn.toString());

const randomBotFn = (game) => {
  const moves = game.getAvailableMoves();
  return moves.length > 0
    ? moves[Math.floor(Math.random() * moves.length)]
    : null;
};
registerBot('random-bot', randomBotFn, randomBotFn.toString());
registerBot('starter-bot', randomBotFn, randomBotFn.toString());

const loadUserBots = () => {
  try {
    const userBots = JSON.parse(localStorage.getItem(USER_BOTS_KEY) || '[]');
    userBots.forEach(({ name, source }) => {
      if (registeredBots.has(name)) return; // Avoid re-registering
      try {
        const botFunction = new Function('game', `return ${source};`)();
        registerBot(name, botFunction, source);
      } catch (e) {
        console.error(`Error loading bot "${name}" from localStorage:`, e);
      }
    });
  } catch (e) {
    console.error("Failed to load user bots from localStorage:", e);
  }
};

loadUserBots();
