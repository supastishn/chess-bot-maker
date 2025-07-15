import { describe, test, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import GamePage from '../../src/pages/Game';

vi.mock('chessground', () => ({
  default: vi.fn(() => ({
    set: vi.fn(),
    destroy: vi.fn()
  }))
}));

vi.mock('chess.js', async (importOriginal) => {
  const actual = await importOriginal();
  const Chess = vi.fn(() => ({
    ...new actual.Chess(),
    isCheckmate: () => false,
    isStalemate: () => false,
    isThreefoldRepetition: () => false,
  }));
  return { ...actual, Chess };
});

describe('GamePage', () => {
  test('renders chess board and controls', () => {
    render(<GamePage selectedBot="random-bot" botNames={[]} />);
    
    expect(screen.getByText('Chess vs Computer')).toBeInTheDocument();
    expect(screen.getByText(/Current turn/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  test('shows checkmate status message', () => {
    const { Chess } = require('chess.js');
    // Mock a checkmate state
    Chess.mockImplementation(() => ({
      fen: () => 'r1bqkbnr/pppp1Qpp/2n5/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 3', // Example checkmate FEN
      turn: () => 'b', // Black's turn, so white is checkmated
      isCheckmate: () => true,
      isStalemate: () => false,
      isThreefoldRepetition: () => false,
      moves: () => [],
      move: () => null,
    }));

    render(<GamePage selectedBot="random-bot" botNames={[]} />);
    expect(screen.getByText('White wins by Checkmate')).toBeInTheDocument();
  });
});
