import { describe, test, expect, vi, beforeEach } from 'vitest';
import { materialBot } from '../src/bot/materialBot.js';
import { mockGameClient } from './utils';

describe('materialBot', () => {
  let mockGame;

  beforeEach(() => {
    // Reset mocks and make random predictable
    vi.restoreAllMocks();
    vi.stubGlobal('Math.random', () => 0.5);

    mockGame = mockGameClient({
      getAvailableMoves: vi.fn().mockReturnValue([
        'e2e4', 'd2d4', 'g1f3'
      ]),
      getTurn: vi.fn().mockReturnValue('w'),
      // No stateful mocks here
    });
  });

  test('prefers checkmate moves', () => {
    // Make the first move a checkmate
    mockGame.isCheckmate.mockReturnValueOnce(true);

    const move = materialBot(mockGame);
    expect(move).toBe('e2e4');
  });

  test('selects move with best material gain', () => {
    mockGame.isCheckmate.mockReturnValue(false);
    
    // Scores for 'e2e4', 'd2d4', 'g1f3' respectively
    mockGame.evaluateMaterial
      .mockReturnValueOnce(1.0) // e2e4 is best
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.5);
    
    const move = materialBot(mockGame);
    expect(move).toBe('e2e4');
  });

  test('handles move evaluation errors', () => {
    mockGame.isCheckmate.mockReturnValue(false);
    
    // Make the first move 'e2e4' throw an error
    mockGame.move.mockImplementation((move) => {
      if (move === 'e2e4') {
        throw new Error('Illegal move');
      }
    });
    
    // Scores for the remaining moves 'd2d4' and 'g1f3'
    mockGame.evaluateMaterial
      .mockReturnValueOnce(1.0) // d2d4 is best
      .mockReturnValueOnce(0.5);
    
    const move = materialBot(mockGame);
    expect(move).toBe('d2d4');
  });
});
