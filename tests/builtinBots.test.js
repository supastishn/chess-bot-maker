import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getBot } from '../src/bot/botInterface.js';
import { mockGameClient } from './utils';

// Common setup for all bot tests
describe('Built-in Bots', () => {
  let mockGame;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('Math.random', () => 0.5); // Ensure predictable random choices
    mockGame = mockGameClient();
  });

  // Test for random-bot
  describe('randomBot', () => {
    test('selects a move from available moves', () => {
      const randomBot = getBot('random-bot');
      const moves = ['e2e4', 'd2d4', 'g1f3'];
      mockGame.getAvailableMoves.mockReturnValue(moves);
      // Test that the returned move is one of the available options
      expect(moves).toContain(randomBot(mockGame));
    });
  });

  // Test for aggressive-bot
  describe('aggressiveBot', () => {
    const aggressiveBot = getBot('aggressive-bot');

    test('prefers capture moves', () => {
      mockGame.getVerboseMoves.mockReturnValue([
        { from: 'e2', to: 'e4', flags: 'n' },
        { from: 'd2', to: 'd4', flags: 'c', captured: 'p' },
        { from: 'g1', to: 'f3', flags: 'n' },
      ]);
      expect(aggressiveBot(mockGame)).toBe('d2d4');
    });

    test('prefers capturing a more valuable piece', () => {
      mockGame.getVerboseMoves.mockReturnValue([
        { from: 'd2', to: 'd4', flags: 'c', captured: 'p' }, // Pawn, value 1
        { from: 'e2', to: 'e5', flags: 'c', captured: 'r' }, // Rook, value 5
      ]);
      expect(aggressiveBot(mockGame)).toBe('e2e5');
    });

    test('plays a random move if no captures are available', () => {
      mockGame.getVerboseMoves.mockReturnValue([
        { from: 'e2', to: 'e4', san: 'e4', flags: 'n' },
        { from: 'd2', to: 'd4', san: 'd4', flags: 'n' },
        { from: 'g1', to: 'f3', san: 'Nf3', flags: 'n' },
      ]);
      mockGame.getAvailableMoves.mockReturnValue(['e2e4', 'd2d4', 'g1f3']);
      expect(aggressiveBot(mockGame)).toBe('d2d4');
    });
  });

  // Test for defensive-bot
  describe('defensiveBot', () => {
    const defensiveBot = getBot('defensive-bot');

    test('prefers moves to safe squares', () => {
      mockGame.getTurn.mockReturnValue('w'); // Bot is white, opponent is black
      mockGame.getAvailableMoves.mockReturnValue(['a2a3', 'b2b3', 'c2c3']);
      // Mock 'b2b3' as a move to an attacked square
      mockGame.isAttacked.mockImplementation((square, byColor) => square === 'b3' && byColor === 'b');

      const safeMoves = ['a2a3', 'c2c3'];
      // Math.floor(2 * 0.5) = 1 -> should pick the second safe move
      expect(defensiveBot(mockGame)).toBe('c2c3');
    });
  });

  // Test for positional-bot
  describe('positionalBot', () => {
    test('chooses move with the highest lookAhead score', () => {
      const positionalBot = getBot('positional-bot');
      mockGame.getAvailableMoves.mockReturnValue(['e2e4', 'd2d4', 'g1f3']);
      // Scores for e2e4, d2d4, g1f3 respectively
      mockGame.lookAhead
        .mockReturnValueOnce({ score: 5 })
        .mockReturnValueOnce({ score: 10 }) // d2d4 is best
        .mockReturnValueOnce({ score: 2 });

      expect(positionalBot(mockGame)).toBe('d2d4');
    });
  });

  // Test for guru-bot
  describe('guruBot', () => {
    test('uses prioritizeStrategy to select a move', () => {
      const guruBot = getBot('guru-bot');
      mockGame.getAvailableMoves.mockReturnValue(['e2e4', 'd2d4']);
      mockGame.prioritizeStrategy.mockReturnValue('e2e4');

      const move = guruBot(mockGame);
      expect(move).toBe('e2e4');
      expect(mockGame.prioritizeStrategy).toHaveBeenCalledWith(expect.any(Object));
    });
  });
  
  // Test for toggle-bot
  describe('toggleBot', () => {
    const toggleBot = getBot('toggle-bot');
    
    test('acts like materialBot on turn 0', () => {
      mockGame.getMoveCount.mockReturnValue(0);
      mockGame.isCheckmate.mockReturnValue(true); // materialBot prefers checkmate
      mockGame.getAvailableMoves.mockReturnValue(['e2e4', 'd2d4']);
      
      expect(toggleBot(mockGame)).toBe('e2e4');
    });
    
    test('acts like aggressiveBot on turn 1', () => {
      mockGame.getMoveCount.mockReturnValue(2); // turnNumber 1
      mockGame.getVerboseMoves.mockReturnValue([
        { from: 'e2', to: 'e4', flags: 'n' },
        { from: 'd2', to: 'd4', flags: 'c', captured: 'p' },
      ]);
      
      expect(toggleBot(mockGame)).toBe('d2d4');
    });
    
    test('acts like positionalBot on turn 2', () => {
      mockGame.getMoveCount.mockReturnValue(4); // turnNumber 2
      mockGame.getAvailableMoves.mockReturnValue(['e2e4', 'd2d4']);
      mockGame.lookAhead
        .mockReturnValueOnce({ score: 1 })
        .mockReturnValueOnce({ score: 5 });
        
      expect(toggleBot(mockGame)).toBe('d2d4');
    });
  });
  
  // Test for stockfish-bot
  describe('stockfishBot', () => {
    test('chooses the move from the engine', async () => {
      const stockfishBot = getBot('stockfish-bot');
      const getBestMoveMock = vi.fn().mockResolvedValue('e2e4');
      
      // Mock the stockfish helper function on the game object
      mockGame.stockfish = vi.fn().mockReturnValue({
        getBestMove: getBestMoveMock,
      });

      const move = await stockfishBot(mockGame);

      expect(move).toBe('e2e4');
      expect(mockGame.stockfish).toHaveBeenCalled();
      expect(getBestMoveMock).toHaveBeenCalled();
    });
  });
});
