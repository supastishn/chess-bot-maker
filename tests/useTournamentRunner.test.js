import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useTournamentRunner from '../../src/hooks/useTournamentRunner';
import { getBot } from '../../src/bot/botInterface';

// Mock dependencies
vi.mock('../../src/bot/botInterface', () => ({
  getBot: vi.fn(name => {
    const botMap = {
      'bot1': vi.fn(() => 'e2e4'),
      'bot2': vi.fn(() => 'g1f3')
    };
    return botMap[name] || botMap['bot1'];
  })
}));

vi.mock('chess.js', () => {
  const mockGame = {
    history: vi.fn(() => []),
    isGameOver: vi.fn(() => false),
    isCheckmate: vi.fn(),
    isStalemate: vi.fn(),
    isThreefoldRepetition: vi.fn(),
    isInsufficientMaterial: vi.fn(),
    undo: vi.fn(),
    turn: vi.fn(() => 'w'),
    move: vi.fn(),
    fen: vi.fn(() => 'mock-fen'),
    board: vi.fn()
  };
  
  return {
    Chess: vi.fn(() => mockGame)
  };
});

describe('useTournamentRunner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('initializes with idle status', () => {
    const { result } = renderHook(() => useTournamentRunner());
    expect(result.current.status).toBe('idle');
  });

  test('starts tournament with bot selection', () => {
    const { result } = renderHook(() => useTournamentRunner());
    
    act(() => {
      result.current.startTournament(['bot1', 'bot2']);
    });
    
    expect(result.current.status).toBe('running');
    expect(result.current.standings.length).toBe(2);
  });
  
  test('tracks match outcomes', async () => {
    const { result } = renderHook(() => useTournamentRunner());
    
    act(() => {
      result.current.startTournament(['bot1', 'bot2']);
    });
    
    // Wait for matches to complete
    await act(async () => {
      await new Promise(res => setTimeout(res, 200));
    });
    
    expect(result.current.completedMatches.length).toBeGreaterThan(0);
    expect(result.current.standings.some(b => b.p > 0)).toBe(true);
  });
});
