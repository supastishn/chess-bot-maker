const useTournamentRunner = vi.fn();
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { getBot } from '../src/bot/botInterface';

// Mock dependencies
vi.mock('../src/bot/botInterface');
vi.mock('chess.js', () => ({
  Chess: vi.fn(() => ({
    history: vi.fn(() => []),
    isGameOver: vi.fn(() => false),
    isCheckmate: vi.fn(() => false),
    isStalemate: vi.fn(() => false),
    isThreefoldRepetition: vi.fn(() => false),
    isInsufficientMaterial: vi.fn(() => false),
    undo: vi.fn(),
    turn: vi.fn(() => 'w'),
    move: vi.fn(),
    fen: vi.fn(() => 'mock-fen'),
  }))
}));

beforeEach(() => {
  useTournamentRunner.mockImplementation(() => ({
    status: 'idle',
    startTournament: vi.fn(),
    // ... other methods
  }));
});
