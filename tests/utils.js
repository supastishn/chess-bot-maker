import { vi } from 'vitest';

export const mockGameClient = () => ({
  getAvailableMoves: vi.fn(),
  getVerboseMoves: vi.fn(() => []),
  move: vi.fn(),
  undoMove: vi.fn(),
  getGameResult: vi.fn(() => 'ongoing'),
  evaluateMaterial: vi.fn(() => 0),
  getStatus: vi.fn(),
  getTurn: vi.fn(),
  isInCheck: vi.fn(),
  isAttacked: vi.fn(() => false),
  getThreatenedSquares: vi.fn(),
  lookAhead: vi.fn()
});
