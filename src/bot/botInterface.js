
import { Chess } from 'chess.js';

import StockfishEngine from './stockfishEngine.js';
import getOpeningBook, { getPositionKey } from '../services/openingService.js';

const openingDB = getOpeningBook();
let stockfishEngine = null;

const USER_BOTS_KEY = 'chess-user-bots';
const userBotNames = new Set();
const registeredBots = new Map();
const botSources = new Map();
const botBlocklyJson = new Map();
const botTypes = new Map();
const botElos = new Map();
const DEFAULT_BOT_NAME = 'starter-bot';

export const getBotSource = (name) => {
  return botSources.get(name) || "// No source code available";
};

export const getBotBlocklyJson = (name) => botBlocklyJson.get(name);
export const getBotType = (name) => botTypes.get(name) || 'code';
export const getBotElo = (name) => botElos.get(name);

const createBotHelper = (gameClient) => {
  const helper = Object.assign({}, gameClient);

  // Game state methods
  if (gameClient.getAvailableMoves === undefined) helper.getAvailableMoves = () => {
    const verboseMoves = gameClient.moves({ verbose: true });
    return verboseMoves.map(move => move.from + move.to + (move.promotion || ''));
  };
  if (gameClient.getVerboseMoves === undefined) helper.getVerboseMoves = () => gameClient.moves({ verbose: true });
  if (gameClient.getTurn === undefined) helper.getTurn = () => gameClient.turn();
  if (gameClient.isCheckmate === undefined) helper.isCheckmate = () => gameClient.isCheckmate();
  if (gameClient.isStalemate === undefined) helper.isStalemate = () => gameClient.isStalemate();
  if (gameClient.isDraw === undefined) helper.isDraw = () => gameClient.isDraw();
  if (gameClient.isGameOver === undefined) helper.isGameOver = () => gameClient.isGameOver();
  if (gameClient.getFEN === undefined) helper.getFEN = () => gameClient.fen();
  if (gameClient.isInCheck === undefined) helper.isInCheck = () => gameClient.isCheck();
  if (gameClient.undoMove === undefined) helper.undoMove = () => gameClient.undo();
  if (gameClient.move === undefined) helper.move = (m) => gameClient.move(m);
  if (gameClient.isAttacked === undefined) helper.isAttacked = (square, byColor) => gameClient.isAttacked(square, byColor);
  if (gameClient.getMoveCount === undefined) helper.getMoveCount = () => gameClient.history().length;

  // Add getGamePhase helper
  if (gameClient.getGamePhase === undefined) helper.getGamePhase = () => {
    const moveCount = helper.getMoveCount();
    return moveCount < 15 ? 'opening' : moveCount < 40 ? 'middlegame' : 'endgame';
  };

  // Add getThreatenedSquares helper
  if (gameClient.getThreatenedSquares === undefined) helper.getThreatenedSquares = (byColor) => {
    // All 64 squares
    const files = ['a','b','c','d','e','f','g','h'];
    const ranks = ['1','2','3','4','5','6','7','8'];
    const allSquares = [];
    for (const f of files) for (const r of ranks) allSquares.push(f + r);
    const squares = [];
    for (const sq of allSquares) {
      if (helper.isAttacked(sq, byColor)) squares.push(sq);
    }
    return squares;
  };

  if (gameClient.getPositionScore === undefined) helper.getPositionScore = () => {
    let score = helper.evaluateMaterial();
    const center = ['e4', 'd4', 'e5', 'd5'];
    for (const sq of center) {
      const piece = gameClient.get(sq);
      if (piece) {
        score += (piece.color === 'w' ? 0.1 : -0.1);
      }
    }
    return score;
  };

  if (gameClient.setElo === undefined) helper.setElo = (elo) => {
    if (!stockfishEngine) stockfishEngine = new StockfishEngine();
    stockfishEngine.initialized.then(() => stockfishEngine.setElo(elo));
  };
  if (gameClient.disableEloLimit === undefined) helper.disableEloLimit = () => {
    if (!stockfishEngine) stockfishEngine = new StockfishEngine();
    stockfishEngine.initialized.then(() => stockfishEngine.disableEloLimit());
  };
  if (gameClient.setHashSize === undefined) helper.setHashSize = (size) => {
    if (!stockfishEngine) stockfishEngine = new StockfishEngine();
    stockfishEngine.initialized.then(() => stockfishEngine.setOption('Hash', size));
  };
  if (gameClient.setContempt === undefined) helper.setContempt = (value) => {
    if (!stockfishEngine) stockfishEngine = new StockfishEngine();
    stockfishEngine.initialized.then(() => stockfishEngine.setOption('Contempt', value));
  };

  // --- Opening Book helpers ---
  if (gameClient.getBookMoves === undefined) helper.getBookMoves = () => {
    const key = getPositionKey(gameClient.fen());
    return openingDB[key] || [];
  };

  if (gameClient.playBookMove === undefined) helper.playBookMove = () => {
    const bookMoves = helper.getBookMoves();
    if (bookMoves.length > 0) {
      return bookMoves[Math.floor(Math.random() * bookMoves.length)];
    }
    return null;
  };

  // --- More advanced helpers ---
  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
  if (gameClient.evaluateMaterial === undefined) helper.evaluateMaterial = () => {
    const board = gameClient.board();
    return board.reduce((total, row) => 
      row.reduce((sum, piece) => {
        if (!piece) return sum;
        const value = pieceValues[piece.type] || 0;
        return sum + (piece.color === 'w' ? value : -value);
      }, total), 
    0);
  };

  if (gameClient.lookAhead === undefined) helper.lookAhead = (move, depth) => {
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

  if (gameClient.prioritizeStrategy === undefined) helper.prioritizeStrategy = (weights) => {
    const moves = helper.getAvailableMoves();
    if (moves.length === 0) return null;

    const isBlack = gameClient.turn() === 'b';
    let bestScore = isBlack ? Infinity : -Infinity;
    let bestMoves = [];

    const mergedWeights = {
      material: 0.6,
      development: 0.4,
      centerControl: 0.5,
      kingSafety: 0.4,
      ...weights,
    };

    const getScore = (client) => {
      let totalScore = 0;
      const material = helper.evaluateMaterial();
      let centerControl = 0;
      const center = ['e4', 'd4', 'e5', 'd5'];
      for (const sq of center) {
        const piece = client.get(sq);
        if (piece) {
          centerControl += 0.1 * (piece.color === 'w' ? 1 : -1);
        }
      }
      if (mergedWeights.material) totalScore += mergedWeights.material * material;
      if (mergedWeights.centerControl) totalScore += mergedWeights.centerControl * centerControl;
      if (client.isCheck()) {
        totalScore += (client.turn() === 'w' ? -0.5 : 0.5) * (mergedWeights.kingSafety || 0);
      }
      return totalScore;
    };

    for (const move of moves) {
      const clientCopy = new Chess(gameClient.fen());
      if (clientCopy.move(move)) {
        const score = getScore(clientCopy);
        if ((isBlack && score < bestScore) || (!isBlack && score > bestScore)) {
          bestScore = score;
          bestMoves = [move];
        } else if (score === bestScore) {
          bestMoves.push(move);
        }
      }
    }

    if (bestMoves.length === 0) {
      return moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)] : null;
    }
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  };

  if (gameClient.stockfish === undefined) helper.stockfish = () => ({
    elo: 3190,
    hashSize: 256,
    contempt: 0,
    async init() {
      if (!stockfishEngine && typeof Worker !== 'undefined') {
        stockfishEngine = new StockfishEngine();
      }
      return stockfishEngine.initialized.then(() => {
        if (this.elo >= 3190) {
          stockfishEngine.disableEloLimit();
        } else {
          stockfishEngine.setElo(this.elo);
        }
        stockfishEngine.setOption("Hash", this.hashSize);
        stockfishEngine.setOption("Contempt", this.contempt);
      });
    },
    async getBestMove(fen, depth = 15) {
      // Auto-initialize on first call in a compatible environment
      if (!stockfishEngine && typeof Worker !== 'undefined') {
        stockfishEngine = new StockfishEngine();
      }

      if (!stockfishEngine) {
        throw new Error("Stockfish engine is not available in this environment.");
      }
      
      // Wait for the engine to confirm it's ready
      await stockfishEngine.initialized;

      if (stockfishEngine.ready) {
        const analysis = await stockfishEngine.getPositionEvaluation(fen, depth);
        return analysis?.bestMove;
      }
      
      // This path should ideally not be reached if initialized promise resolves
      throw new Error("Stockfish engine failed to initialize.");
    }
  });

  if (gameClient.benchmark === undefined) helper.benchmark = (depth = 16) => {
    if (!gameClient.stockfish?.engine) {
      return Promise.reject("Stockfish engine not initialized");
    }
    return gameClient.stockfish.runBenchmark(depth);
  };

  return helper;
};

export const registerBot = (name, botFunction, source, blocklyJson = null, elo = null) => {
  console.log(`[Bot] Registering bot: ${name}`);
  if (typeof botFunction !== 'function') {
    throw new Error('Bot must be a function');
  }
  if (source) {
    botSources.set(name, source);
  }
  if (blocklyJson) {
    botBlocklyJson.set(name, blocklyJson);
    botTypes.set(name, 'blockly');
  } else {
    botTypes.set(name, 'code');
  }
  if (elo) {
    botElos.set(name, elo);
  }
  // Wrap the botFunction to provide the helper API with proper error handling
  registeredBots.set(name, (gameClient) => {
    try {
      return botFunction(createBotHelper(gameClient));
    } catch (e) {
      return Promise.reject(e);
    }
  });
};

export const registerUserBot = (name, botFunction, source, blocklyJson = null, elo = null) => {
  userBotNames.add(name);
  registerBot(name, botFunction, source, blocklyJson, elo); // Register in-memory for the current session

  try {
    const userBots = JSON.parse(localStorage.getItem(USER_BOTS_KEY) || '[]');
    const botIndex = userBots.findIndex(b => b.name === name);

    const existingElo = botIndex > -1 ? userBots[botIndex].elo : null;
    const newBot = { name, source, blocklyJson, elo: elo || existingElo };

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
  const bookMove = game.playBookMove();
  if (bookMove) return bookMove;

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
  const bookMove = game.playBookMove();
  if (bookMove) return bookMove;

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
  const bookMove = game.playBookMove();
  if (bookMove) return bookMove;

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
  const bookMove = game.playBookMove();
  if (bookMove) return bookMove;

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
  const bookMove = game.playBookMove();
  if (bookMove) return bookMove;

  const moves = game.getAvailableMoves();
  if (!moves.length) return null;

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
  const bookMove = game.playBookMove();
  if (bookMove) return bookMove;

  const moves = game.getAvailableMoves();
  return moves.length > 0
    ? moves[Math.floor(Math.random() * moves.length)]
    : null;
};
registerBot('random-bot', randomBotFn, randomBotFn.toString());
registerBot('starter-bot', randomBotFn, randomBotFn.toString());

/**
 * Initialize and load all bots (built-in and user) with ELO support.
 */
const initializeAndLoadBots = () => {
  const BUILT_IN_BOTS = [
    { name: 'stockfish-bot', fn: stockfishBotFn, elo: 1800 },
    { name: 'guru-bot', fn: guruBotFn, elo: 1600 },
    { name: 'material-bot', fn: materialBot, elo: 1400 },
    { name: 'positional-bot', fn: positionalBotFn, elo: 1500 },
    { name: 'aggressive-bot', fn: aggressiveBotFn, elo: 1300 },
    { name: 'defensive-bot', fn: defensiveBotFn, elo: 1200 },
    { name: 'toggle-bot', fn: toggleBotFn, elo: 1400 },
    { name: 'random-bot', fn: randomBotFn, elo: 800 },
    { name: 'starter-bot', fn: randomBotFn, elo: 800 }
  ];

  try {
    let botsInStorage = JSON.parse(localStorage.getItem(USER_BOTS_KEY) || '[]');

    // If no bots exist in storage, seed with built-in bots.
    if (botsInStorage.length === 0) {
      console.log('[Bot] Seeding localStorage with built-in bots.');
      botsInStorage = BUILT_IN_BOTS.map(bot => ({
        name: bot.name,
        source: bot.fn.toString(),
        blocklyJson: null,
        elo: bot.elo
      }));
      localStorage.setItem(USER_BOTS_KEY, JSON.stringify(botsInStorage));
    }

    // Load all bots from localStorage (either pre-existing or freshly seeded)
    botsInStorage.forEach(({ name, source, blocklyJson, elo }) => {
      try {
        // ALWAYS register from local storage. This ensures user edits to built-in bots are loaded.
        userBotNames.add(name); // Mark as a "user" bot (editable, deletable)
        // By wrapping source in parentheses, we ensure arrow functions are parsed correctly.
        const botFunction = new Function('game', `return (${source});`)();
        // This will overwrite the built-in bot with the (potentially modified) version from localStorage.
        registerBot(name, botFunction, source, blocklyJson, elo);
      } catch (e) {
        console.error(`Error loading bot "${name}" from localStorage:`, e);
      }
    });

  } catch (e) {
    console.error("Failed to initialize or load bots from localStorage:", e);
  }
};

export const isUserBot = (name) => userBotNames.has(name);

export const deleteUserBot = (name) => {
  if (!isUserBot(name)) return false;

  try {
    registeredBots.delete(name);
    botSources.delete(name);
    botBlocklyJson.delete(name);
    botTypes.delete(name);
    botElos.delete(name);
    userBotNames.delete(name);

    const userBots = JSON.parse(localStorage.getItem(USER_BOTS_KEY) || '[]');
    const updatedBots = userBots.filter(b => b.name !== name);
    localStorage.setItem(USER_BOTS_KEY, JSON.stringify(updatedBots));
    return true;
  } catch (e) {
    console.error(`Failed to delete bot "${name}":`, e);
    return false;
  }
};

initializeAndLoadBots();
