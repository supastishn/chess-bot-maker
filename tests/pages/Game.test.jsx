import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { HashRouter } from 'react-router-dom';
import GamePage from '../../src/pages/Game';
import { Chess } from 'chess.js';
import '@testing-library/jest-dom';

vi.mock('chessground', () => ({
  Chessground: vi.fn(() => ({
    set: vi.fn(),
    destroy: vi.fn(),
    state: vi.fn()
  }))
}));

// Mock browser ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

describe('GamePage', () => {
  beforeEach(() => {
    vi.mocked(Chess).mockImplementation(() => ({
      turn: vi.fn().mockReturnValue('w'),
      fen: vi.fn().mockReturnValue('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
      isCheckmate: vi.fn(),
      isStalemate: vi.fn(),
      isThreefoldRepetition: vi.fn(),
      move: vi.fn(),
      board: vi.fn(),
      history: vi.fn(() => []),
      inCheck: vi.fn(),
      isGameOver: vi.fn(),
      moves: vi.fn(() => [
        { from: 'e2', to: 'e4' },
        { from: 'g1', to: 'f3' }
      ])
    }));
  });

  test('renders chess board', async () => {
    render(
      <HashRouter>
        <GamePage selectedBot="random-bot" botNames={[]} />
      </HashRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Chess vs Computer')).toBeInTheDocument();
      expect(screen.getByText(/Current turn: White/)).toBeInTheDocument();
    });
  });

  test('updates status on checkmate', async () => {
    vi.mocked(Chess).mockImplementation(() => ({
      ...Chess.prototype,
      turn: vi.fn().mockReturnValue('b'),
      isCheckmate: vi.fn().mockReturnValue(true),
      fen: vi.fn().mockReturnValue('r1bqkbnr/pppp1Qpp/2n5/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 3')
    }));
    
    render(
      <HashRouter>
        <GamePage selectedBot="random-bot" botNames={[]} />
      </HashRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('White wins by Checkmate')).toBeInTheDocument();
    });
  });
});
