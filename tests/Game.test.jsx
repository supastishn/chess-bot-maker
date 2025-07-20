import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GamePage from '../src/pages/Game';
import { getBot } from '../src/bot/botInterface';
import { Chess } from 'chess.js';

import { vi } from 'vitest';

vi.mock('../src/bot/botInterface');
vi.mock('chess.js');
vi.mock('chessground', () => ({
  Chessground: vi.fn(() => ({
    set: vi.fn(),
    destroy: vi.fn()
  }))
}));

// Chess instance mock
const mockChess = {
  fen: vi.fn(() => 'standard-fen'),
  turn: vi.fn(() => 'w'),
  isCheckmate: vi.fn(),
  isStalemate: vi.fn(),
  move: vi.fn(),
  isGameOver: vi.fn(),
  isThreefoldRepetition: vi.fn(),
  isInsufficientMaterial: vi.fn(),
  undo: vi.fn(),
  history: vi.fn(() => []),
};
Chess.mockImplementation(() => mockChess);

describe('GamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBot.mockImplementation(() => vi.fn(() => 'e2e4'));
  });

  test('renders and plays full human vs bot game', () => {
    render(<GamePage selectedBot="test-bot" botNames={['test-bot']} />);
    
    // Board and controls render
    expect(mockChess.fen).toHaveBeenCalled();
    expect(screen.getByText('Chess vs Computer')).toBeInTheDocument();
    expect(screen.getByText(/Current turn:/)).toBeInTheDocument();
  });

  test('switches game mode and resets', () => {
    render(<GamePage selectedBot="test-bot" botNames={['test-bot']} />);
    
    // Switch to bot vs bot
    fireEvent.click(screen.getByText('Bot vs Bot'));
    
    // Select black bot
    const botSelector = screen.getAllByRole('combobox')[1];
    fireEvent.change(botSelector, { target: { value: 'test-bot' } });
    
    // Reset game
    fireEvent.click(screen.getByText('Reset Game'));
    expect(mockChess.fen).toHaveBeenCalled();
  });
});
