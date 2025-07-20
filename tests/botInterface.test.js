import { describe, test, expect, vi, beforeEach } from 'vitest';
import { 
  registerBot, 
  getBot, 
  getBotNames,
  registerUserBot,
  deleteUserBot,
  isUserBot,
  getBotSource,
  getBotBlocklyXml
} from '../src/bot/botInterface';
import { Chess } from 'chess.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key]),
    setItem: vi.fn((key, value) => { store[key] = value }),
    clear: vi.fn(() => { store = {} }),
    removeItem: vi.fn(key => delete store[key])
  };
})();

global.localStorage = localStorageMock;

describe('botInterface', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('registerBot registers function bots', () => {
    const mockBot = vi.fn(() => 'e2e4');
    registerBot('test-bot', mockBot);
    expect(getBotNames()).toContain('test-bot');
  });

  test('registerBot throws for non-function bots', () => {
    expect(() => registerBot('invalid-bot', 'not a function'))
      .toThrow('Bot must be a function');
  });

  test('user bot registration flow', () => {
    const code = `(game) => game.getAvailableMoves()[0]`;
    const botFunction = new Function('game', `return (${code});`)();
    registerUserBot('user-bot', botFunction, code, '<xml></xml>');
  
    expect(isUserBot('user-bot')).toBe(true);
    expect(getBotSource('user-bot')).toBe(code);
    expect(getBotBlocklyXml('user-bot')).toBe('<xml></xml>');
  
    deleteUserBot('user-bot');
    expect(isUserBot('user-bot')).toBe(false);
  });

  test('bot execution handles errors', async () => {
    const errorBot = vi.fn(() => { 
      throw new Error('Bot error') 
    });
    registerBot('error-bot', errorBot);
    
    const mockGame = new Chess();
    const bot = getBot('error-bot');
    
    await expect(bot(mockGame)).rejects.toThrow('Bot error');
  });

  test('build-in bot behaviors', async () => {
    const mockGame = {
      turn: vi.fn(() => 'w'),
      getAvailableMoves: vi.fn(() => ['e2e4', 'g1f3']),
      evaluateMaterial: vi.fn(() => 1.5),
      isCheckmate: vi.fn().mockReturnValue(true),
      fen: vi.fn(() => 'mock-fen'),
      // ...other methods
    };
    
    // Test material bot
    const materialBot = getBot('material-bot');
    materialBot(mockGame);
    expect(mockGame.isCheckmate).toHaveBeenCalled();
    
    // Test random bot
    const randomBot = getBot('random-bot');
    const move = randomBot(mockGame);
    expect(['e2e4', 'g1f3']).toContain(move);
  });
});
