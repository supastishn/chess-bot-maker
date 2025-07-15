/**
 * Bot Interface Specification:
 * - Must be a function that takes a game API and returns a move object or move key
 * - Example: (game) => { from: 'e2', to: 'e4' } or (game) => 'e2e4'
 */

console.log("[BotInterface] Initializing bot interface");

import StockfishEngine from './stockfishEngine';

const registeredBots = new Map();
const DEFAULT_BOT_NAME = 'starter-bot';

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

  // Stockfish engine helper
  helper.stockfish = {
    engine: null,
    async getBestMove(fen, depth = 15) {
      if (!this.engine) {
        this.engine = new StockfishEngine(depth);
        await this.engine.init();
      }
      return this.engine.evaluatePosition(fen);
    }
  };

  return helper;
};

export const registerBot = (name, botFunction) => {
  console.log(`[Bot] Registering bot: ${name}`);
  if (typeof botFunction !== 'function') {
    throw new Error('Bot must be a function');
  }
  // Wrap the botFunction to provide the helper API
  registeredBots.set(name, (gameClient) =>
    botFunction(createBotHelper(gameClient))
  );
};

// Register Stockfish bot
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

registerBot('material-bot', materialBot);
registerBot('starter-bot', (game) => {
  const moves = game.getAvailableMoves();
  return moves.length > 0
    ? moves[Math.floor(Math.random() * moves.length)]
    : null;
});

// Test bots for performance testing
registerBot('aggressive-bot', (game) => {
  const moves = game.getAvailableMoves();
  const captureMoves = moves.filter(move =>
    game.lookAhead(move, 1).capturedPiece
  );
  return captureMoves.length > 0
    ? captureMoves[0]
    : moves[Math.floor(Math.random() * moves.length)];
});

registerBot('defensive-bot', (game) => {
  const moves = game.getAvailableMoves();
  const safeMoves = moves.filter(move =>
    !game.lookAhead(move, 1).inCheckAfter
  );
  return safeMoves.length > 0
    ? safeMoves[0]
    : moves[Math.floor(Math.random() * moves.length)];
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
