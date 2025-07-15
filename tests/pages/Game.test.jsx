import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import GamePage from '../../src/pages/Game';
import { Chess } from 'chess.js';

vi.mock('chessground', () => ({
  default: vi.fn(() => ({
    set: vi.fn(),
    destroy: vi.fn()
  }))
}));

vi.mock('chess.js', () => ({
  Chess: vi.fn(),
}));

describe('GamePage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    const mockInstance = {
      fen: vi.fn().mockReturnValue('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
      turn: vi.fn().mockReturnValue('w'),
      isCheckmate: vi.fn().mockReturnValue(false),
      isStalemate: vi.fn().mockReturnValue(false),
      isThreefoldRepetition: vi.fn().mockReturnValue(false),
      isGameOver: vi.fn().mockReturnValue(false),
      moves: vi.fn().mockReturnValue(['e2e4']),
      move: vi.fn((m) => ({ san: 'e4', ...m })),
    };
    Chess.mockImplementation(() => mockInstance);
  });

  test('renders chess board and controls', () => {
    render(<GamePage selectedBot="random-bot" botNames={[]} />);
    
    expect(screen.getByText('Chess vs Computer')).toBeInTheDocument();
    expect(screen.getByText(/Current turn/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  test('shows checkmate status message', () => {
    // Configure the mock for this specific test
    Chess.mockImplementation(() => ({
      fen: vi.fn().mockReturnValue('r1bqkbnr/pppp1Qpp/2n5/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 3'),
      turn: vi.fn().mockReturnValue('b'),
      isCheckmate: vi.fn().mockReturnValue(true),
      isStalemate: vi.fn().mockReturnValue(false),
      isThreefoldRepetition: vi.fn().mockReturnValue(false),
      isGameOver: vi.fn().mockReturnValue(true),
    }));

    render(<GamePage selectedBot="random-bot" botNames={[]} />);
    expect(screen.getByText('White wins by Checkmate')).toBeInTheDocument();
  });
});
