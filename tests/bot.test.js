import { describe, test, expect, vi, beforeEach } from 'vitest';
import { materialBot } from '../../src/bot/materialBot';
import { mockGameClient } from './utils';

describe('materialBot', () => {
  let mockGame;

  beforeEach(() => {
    mockGame = mockGameClient({
      getAvailableMoves: vi.fn().mockReturnValue([
        'e2e4', 'd2d4', 'g1f3'
      ]),
      evaluateMaterial: vi.fn()
        .mockReturnValueOnce(0)   // Checkmate evaluation
        .mockReturnValueOnce(0.5) // Initial board state
        .mockReturnValue(0.5)      // Arbitrary value
    });
  });

  test('prefers checkmate moves', () => {
    mockGame.isCheckmate.mockReturnValueOnce(false)
      .mockReturnValueOnce(true)   // Force checkmate on first mock
      .mockReturnValue(false);

    const move = materialBot(mockGame);
    expect(move).toBe('e2e4');
    expect(mockGame.move).toHaveBeenCalledTimes(2);
  });

  test('selects move with best material gain', () => {
    // Simulate material evaluation
    mockGame.evaluateMaterial.mockReturnValueOnce(0.5) // Original value
      .mockReturnValueOnce(1.0) // e2e4
      .mockReturnValueOnce(0.2) // d2d4
      .mockReturnValue(0.5);    // g1f3
    
    const move = materialBot(mockGame);
    expect(move).toBe('e2e4');
    expect(mockGame.move).toHaveBeenCalledTimes(4);
  });

  test('handles move evaluation errors', () => {
    mockGame.move.mockImplementationOnce(() => {
      throw new Error('Illegal move');
    });
    
    // Simulate material evaluation
    mockGame.evaluateMaterial.mockReturnValueOnce(0.5) // Original value
      .mockReturnValueOnce(0.5) // e2e4 (failed)
      .mockReturnValue(1.0);     // d2d4
    
    const move = materialBot(mockGame);
    expect(move).toBe('d2d4');
  });
});
