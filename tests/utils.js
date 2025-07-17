import { vi } from 'vitest';

export const mockGameClient = (overrides = {}) => ({
  // --- Methods mocked by tests ---
  getAvailableMoves: vi.fn(),
  getVerboseMoves: vi.fn(() => []),
  getTurn: vi.fn(),
  isAttacked: vi.fn(() => false),
  lookAhead: vi.fn(),
  prioritizeStrategy: vi.fn(),
  getMoveCount: vi.fn(),
  isCheckmate: vi.fn(),
  stockfish: vi.fn(),

  // --- Underlying chess.js methods for helpers ---
  moves: vi.fn(() => []),
  history: vi.fn(() => []),
  turn: vi.fn().mockReturnValue('w'),
  undo: vi.fn(),
  move: vi.fn(),
  getGameResult: vi.fn(() => 'ongoing'),
  evaluateMaterial: vi.fn(() => 0),
  getStatus: vi.fn(),
  isInCheck: vi.fn(),
  getThreatenedSquares: vi.fn(),
  ...overrides
});
