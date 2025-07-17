

import StockfishEngine from './stockfishEngine';
import getOpeningBook, { getPositionKey } from '../services/openingService';

const openingDB = getOpeningBook();

const registeredBots = new Map();
const botSources = new Map();
const DEFAULT_BOT_NAME = 'starter-bot';

export const getBotSource = (name) => {
  return botSources.get(name) || "// No source code available";
};

const createBotHelper = (gameClient) => {
  // Helper context for 'this' in advanced methods
  const helper = {};

  // Game state methods
  helper.getAvailableMoves = () => {
    const moves = gameClient.moves({ verbose: true });
    console.log(`[Bot] getAvailableMoves returned ${moves.length} moves`);
    return moves.map(move => 
      move.promotion ? move.from + move.to + move.promotion : move.from + move.to
    );
  };

  // New helpers for advanced bots
  helper.getVerboseMoves = () => gameClient.moves({ verbose: true });
  helper.isAttacked = (square, byColor) => gameClient.isAttacked(square, byColor);
  helper.getMoveCount = () => gameClient.history().length;

  // Opening book API
  helper.getPositionKey = () => getPositionKey(gameClient.fen());
  helper.getBookMoves = () => {
    const fen = helper.getPositionKey();
    return openingDB[fen] || [];
  };
  helper.playBookMove = () => {
    const moves = helper.getBookMoves();
    if (moves.length === 0) return null;
    return moves[Math.floor(Math.random() * moves.length)];
  };

  helper.getBoardState = () => {
    console.log("[Bot] getBoardState called");
    return gameClient.board().flatMap((row, rankIdx) => 
      row.map((piece, fileIdx) => ({
        file: String.fromCharCode(97 + fileIdx),
        rank: 8 - rankIdx,
        piece: piece ? {
          type: piece.type,
          side: { name: piece.color }
        } : null
      }))
    );
  };

  // --- Strategy prioritization ---
  helper.prioritizeStrategy = (weights, depth = 4) => {
    const moves = helper.getAvailableMoves();
    let bestMove = null;
    let bestScore = -Number.MAX_VALUE;
    
    for (const move of moves) {
      let score = 0;
      
      // Material factor
      const materialBase = helper.evaluateMaterial();
      helper.move(move);
      const materialAfter = helper.evaluateMaterial();
      score += (materialAfter - materialBase) * 100 * (weights.material || 0);
      helper.undoMove();
      
      // Development factor
      const piece = move.includes('n') || move.includes('b') ? 1 : 0;
      score += piece * 20 * (weights.development || 0);
      
      // Center control factor
      const center = ['d4','d5','e4','e5'];
      const isCenter = center.includes(helper.getPositionAfterMove(move).piecePosition);
      score += isCenter ? 30 * (weights.centerControl || 0) : 0;
      
      // King safety factor
      helper.move(move);
      const threats = helper.getThreatenedSquares(move[0] === 'w' ? 'b' : 'w');
      const kingSafe = threats.find(t => t.endsWith('king'));
      score -= kingSafe ? 50 * (weights.kingSafety || 0) : 0;
      helper.undoMove();
      
      // Lookahead bonus
      const lookAheadScore = helper.lookAhead(move, depth).score;
      score += lookAheadScore * 0.5;
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  };

  helper.getTurn = () => {
    console.log("[Bot] getTurn called");
    return gameClient.turn();
  };
  
  helper.getGameResult = () => {
    if (gameClient.isCheckmate()) return 'checkmate';
    if (gameClient.isStalemate()) return 'stalemate';
    if (gameClient.isThreefoldRepetition()) return 'repetition';
    return 'ongoing';
  };
  
  helper.evaluateMaterial = () => {
    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    let score = 0;
    gameClient.board().flat().forEach(piece => {
      if (!piece) return;
      const value = pieceValues[piece.type] || 0;
      score += piece.color === 'w' ? value : -value;
    });
    return score;
  };
  
  helper.undoMove = () => gameClient.undo();
  
  helper.move = (move) => {
    console.log(`[Bot] Attempting move: ${JSON.stringify(move)}`);
    try {
      let result;
      if (typeof move === 'string') {
        result = gameClient.move({
          from: move.slice(0, 2),
          to: move.slice(2, 4),
          promotion: move[4] || 'q'
        });
      } else {
        result = gameClient.move(move);
      }
      console.log(`[Bot] Move result: ${result ? "success" + result.san : "failure"}`);
      return result;
    } catch (e) {
      console.error("[Bot] Move error:", e.message);
      return null;
    }
  };

  helper.getPositionAfterMove = (move) => {
    gameClient.move(move);
    const position = {
      piecePosition: move.slice(2,4),
      allPositions: gameClient.board()
    };
    gameClient.undo();
    return position;
  };

  // --- Advanced Methods ---

  // Check detection
  helper.isInCheck = () => gameClient.inCheck ? gameClient.inCheck() : gameClient.isCheck();

  // Checkmate detection
  helper.isCheckmate = () => gameClient.isCheckmate();

  // Game phase detection
  helper.getGamePhase = () => {
    const pieceCount = gameClient.board().flat().filter(Boolean).length;
    return pieceCount > 32 ? 'opening' : pieceCount > 16 ? 'middlegame' : 'endgame';
  };

  // Threat detection
  helper.getThreatenedSquares = (color) => {
    const moves = gameClient.moves({verbose: true});
    return [...new Set(moves.filter(m => m.color !== color).map(m => m.to))];
  };

  // Position evaluation (material + center control)
  helper.getPositionScore = () => {
    let score = helper.evaluateMaterial();
    const color = helper.getTurn();
    ['e4', 'd4', 'e5', 'd5'].forEach(center => {
      const piece = gameClient.get(center);
      if (piece && piece.color === color) score += 0.1;
    });
    return score;
  };

  // Future move simulation (basic minimax)
  helper.lookAhead = (move, depth = 2) => {
    gameClient.move(move);
    let result;
    if (depth <= 0) {
      result = { score: helper.getPositionScore() };
    } else {
      const nextMoves = helper.getAvailableMoves();
      if (nextMoves.length === 0) {
        result = { score: helper.getPositionScore() };
      } else {
        // Calculate maximum opponent score at reduced depth
        const opponentScores = nextMoves.map(m => {
          const outcome = helper.lookAhead(m, depth - 1);
          return outcome.score;
        });
        const maxScore = Math.max(...opponentScores);
        result = { score: helper.getPositionScore() - maxScore };
      }
    }
    gameClient.undo();
    return result;
  };

  // FEN helper
  helper.getFEN = () => {
    try {
      return gameClient.fen();
    } catch {
      const status = gameClient.getStatus?.();
      if (status && status.board) {
        // Could generate FEN from board, but fallback for now
      }
      return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
  };

  // --- Advanced Stockfish API methods ---
  helper.setSkillLevel = (level) => {
    if (gameClient.stockfish?.engine) {
      gameClient.stockfish.setOption("Skill Level", level);
    }
  };

  helper.setHashSize = (size) => {
    if (gameClient.stockfish?.engine) {
      gameClient.stockfish.setOption("Hash", size);
    }
  };

  helper.setContempt = (value) => {
    if (gameClient.stockfish?.engine) {
      gameClient.stockfish.setOption("Contempt", value);
    }
  };

  helper.getPositionEvaluation = (fen = gameClient.fen()) => {
    if (!gameClient.stockfish?.engine) {
      return Promise.reject("Stockfish engine not initialized");
    }
    return gameClient.stockfish.getEvaluation(fen);
  };

  helper.analyzeGame = (pgn) => {
    if (!gameClient.stockfish?.engine) {
      return Promise.reject("Stockfish engine not initialized");
    }
    return gameClient.stockfish.analyzeGame(pgn);
  };

  helper.benchmark = (depth = 16) => {
    if (!gameClient.stockfish?.engine) {
      return Promise.reject("Stockfish engine not initialized");
    }
    return gameClient.stockfish.runBenchmark(depth);
  };

  helper.stockfish = (status) => ({
    skillLevel: 20,
    hashSize: 256,
    contempt: 0,
    async init(depth = 15) {
      if (!status.stockfishEngine) {
        status.stockfishEngine = new StockfishEngine(depth);
        await status.stockfishEngine.init();
        this.setOption("Skill Level", this.skillLevel);
        this.setOption("Hash", this.hashSize);
        this.setOption("Contempt", this.contempt);
      }
    },
    async getBestMove(fen, depth = 15) {
      await this.init(depth);
      if (status.stockfishEngine) {
        return status.stockfishEngine.evaluatePosition(fen, depth);
      }
      throw new Error("Stockfish engine initialization failed");
    }
  });

  return helper;
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

registerBot('stockfish-bot', async (game) => {
  const fen = game.getFEN ? game.getFEN() : game.fen();
  return game.stockfish.getBestMove(fen);
});

export const getBot = (name) => {
  const bot = registeredBots.get(name);
  return bot || registeredBots.get(DEFAULT_BOT_NAME);
};

export const getBotNames = () => Array.from(registeredBots.keys());

 // Register built-in bots
import { materialBot } from './materialBot';

// Define all bots explicitly in a fixed order for the library
registerBot('guru-bot', (game) => {
  const moves = game.getAvailableMoves();
  if (moves.length === 0) return null;
  
  return game.prioritizeStrategy({
    development: 0.3,
    kingSafety: 0.3,
    centerControl: 0.2,
    material: 0.2
  });
});

registerBot('material-bot', materialBot);

registerBot('aggressive-bot', (game) => {
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
  
  const randomMove = moves[Math.floor(Math.random() * moves.length)];
  return randomMove.promotion 
    ? randomMove.from + randomMove.to + randomMove.promotion
    : randomMove.from + randomMove.to;
});

registerBot('defensive-bot', (game) => {
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
});

registerBot('toggle-bot', (game) => {
  const moveCount = game.getMoveCount();
  const turnNumber = Math.floor(moveCount / 2);
  const aiMode = turnNumber % 3;

  if (aiMode === 0) return getBot('material-bot')(game);
  if (aiMode === 1) return getBot('aggressive-bot')(game);
  return getBot('positional-bot')(game);
});

registerBot('positional-bot', (game) => {
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
});

registerBot('random-bot', (game) => {
  const moves = game.getAvailableMoves();
  return moves.length > 0
    ? moves[Math.floor(Math.random() * moves.length)]
    : null;
});

registerBot('toggle-bot', (game) => {
  const moveCount = game.getBoardState().length;
  const aiMode = Math.floor(moveCount / 3) % 3;

  if (aiMode === 0) return getBot('material-bot')(game);
  if (aiMode === 1) return getBot('aggressive-bot')(game);
  return getBot('positional-bot')(game);
});

registerBot('starter-bot', (game) => {
  const moves = game.getAvailableMoves();
  return moves.length > 0
    ? moves[Math.floor(Math.random() * moves.length)]
    : null;
});
