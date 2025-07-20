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

import { mockGameClient } from './utils';

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  store: {}
};

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: key => mockLocalStorage.getItem(key),
      setItem: (key, value) => mockLocalStorage.setItem(key, value),
      clear: () => mockLocalStorage.clear(),
      removeItem: key => mockLocalStorage.removeItem(key),
      key: vi.fn(),
      length: 0
    },
    writable: true
  });
});

describe('botInterface', () => {
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
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify([{name: 'user-bot'}]));

    const code = `(game) => game.getAvailableMoves()[0]`;
    const botFunction = new Function('game', `return (${code});`)();
    registerUserBot('user-bot', botFunction, code, '<xml></xml>');
    
    expect(isUserBot('user-bot')).toBe(true);
    expect(getBotSource('user-bot')).toBe(code);
  });

  test('bot execution handles errors', async () => {
    const errorBot = vi.fn(() => {
      throw new Error('Bot error');
    });
    registerBot('error-bot', errorBot);

    const mockGame = {
      getAvailableMoves: vi.fn(() => []),
      getTurn: vi.fn(() => 'w')
    };
    const bot = getBot('error-bot');
    await expect(bot(mockGame)).rejects.toThrow('Bot error');
  });

  test('build-in bot behaviors', () => {
    const mockGame = mockGameClient({
      getAvailableMoves: vi.fn(() => ['e2e4', 'g1f3']),
      isCheckmate: vi.fn(),
    });
    
    // Test random bot
    const randomBot = getBot('random-bot');
    expect(['e2e4', 'g1f3']).toContain(randomBot(mockGame));
    
    // Test material bot
    mockGame.isCheckmate.mockReturnValueOnce(true);
    const materialBot = getBot('material-bot');
    materialBot(mockGame);
    expect(mockGame.isCheckmate).toHaveBeenCalled();
  });
});
