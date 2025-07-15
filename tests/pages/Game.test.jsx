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

describe('GamePage', () => {
  test('renders chess board and controls', () => {
    render(<GamePage selectedBot="random-bot" botNames={[]} />);
    
    expect(screen.getByText('Chess vs Computer')).toBeInTheDocument();
    expect(screen.getByText(/Current turn/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  test('shows game status messages', () => {
    render(<GamePage selectedBot="random-bot" botNames={[]} />);
    
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByText(/White wins by Checkmate/i)).toBeInTheDocument();
  });
});
