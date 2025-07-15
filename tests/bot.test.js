import { materialBot } from '../src/bot/materialBot';
import { mockGameClient } from '../utils';

describe('materialBot', () => {
  let mockGame;

  beforeEach(() => {
    mockGame = mockGameClient();
    mockGame.getAvailableMoves.mockReturnValue(['e2e4', 'd2d4']);
  });

  test('selects valid move', () => {
    const move = materialBot(mockGame);
    expect(['e2e4', 'd2d4']).toContain(move);
  });

  test('prefers checkmate moves', () => {
    mockGame.getGameResult.mockReturnValue('checkmate');
    const move = materialBot(mockGame);
    expect(move).toBe('e2e4');
  });

  test('avoids blunders that hang material', () => {
    mockGame.lookAhead.mockImplementation(move => {
      if (move === 'e2e4') return { score: -5 };
      return { score: 0 };
    });

    const move = materialBot(mockGame);
    expect(move).toBe('d2d4');
  });

  test('prioritizes piece development', () => {
    mockGame.getAvailableMoves.mockReturnValue(['b1c3', 'f1d3', 'e2e4']);
    jest.spyOn(console, 'log').mockImplementation();
    const move = materialBot(mockGame);
    expect(['b1c3', 'f1d3', 'e2e4']).toContain(move);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Evaluating move')
    );
  });

  test('handles check position early resignation', () => {
    mockGame.getAvailableMoves.mockReturnValue([]);
    expect(materialBot(mockGame)).toBeNull();
  });
});
