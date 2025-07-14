/**
 * Bot Interface Specification:
 * - Must be a function that takes a game API and returns a move object or move key
 * - Example: (game) => { from: 'e2', to: 'e4' } or (game) => 'e2e4'
 */

console.log("[BotInterface] Initializing bot interface");

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
        // Opponent tries to minimize our score
        const scores = nextMoves.map(m => helper.lookAhead(m, depth - 1).score);
        result = { score: helper.getPositionScore() - Math.max(...scores) };
      }
    }
    gameClient.undo();
    return result;
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
