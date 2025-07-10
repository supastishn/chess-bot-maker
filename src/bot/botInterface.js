/**
 * Bot Interface Specification:
 * - Must be a function that takes a game API and returns a move object or move key
 * - Example: (game) => { from: 'e2', to: 'e4' } or (game) => 'e2e4'
 */

import { getTurnFromStatus } from '../chessAdapter.js';

const registeredBots = new Map();
const DEFAULT_BOT_NAME = 'starter-bot';

// Helper API for bots
const createBotHelper = (gameClient) => ({
  // Existing gameClient methods
  getStatus: gameClient.getStatus,
  move: gameClient.move,

  // New helper methods
  getAvailableMoves: () => {
    const status = gameClient.getStatus();
    return status.notatedMoves ? Object.keys(status.notatedMoves) : [];
  },
  getBoardState: () => {
    const { board } = gameClient.getStatus();
    return board.squares;
  },
  getTurn: () => getTurnFromStatus(gameClient.getStatus()),
  getGameResult: () => {
    const status = gameClient.getStatus();
    if (status.isCheckmate) return 'checkmate';
    if (status.isStalemate) return 'stalemate';
    if (status.isRepetition) return 'repetition';
    return 'ongoing';
  },
  evaluateMaterial: () => {
    const status = gameClient.getStatus();
    const pieceValues = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9 };
    let score = 0;
    status.board.squares.forEach(s => {
      if (s.piece) {
        const value = pieceValues[s.piece.type] || 0;
        score += s.piece.side.name === 'white' ? value : -value;
      }
    });
    return score;
  },
  undoMove: () => {
    try {
      if (typeof gameClient.undoMove === 'function') {
        return gameClient.undoMove();
      }
      // fallback: try to pop from history and call undoMove(lastMove)
      const history = [...(gameClient.history || [])];
      const lastMove = history.pop();
      if (lastMove) {
        return gameClient.undoMove(lastMove);
      }
    } catch (e) {
      console.error("Undo failed:", e);
    }
  }
});

export const registerBot = (name, botFunction) => {
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
