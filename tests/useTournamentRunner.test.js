import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useTournamentRunner from '../src/hooks/useTournamentRunner';
import { getBot } from '../src/bot/botInterface';

// Mock dependencies
vi.mock('../src/bot/botInterface');
vi.mock('chess.js', () => ({
  Chess: vi.fn(() => ({
    history: vi.fn(() => []),
    isGameOver: vi.fn(() => false),
    isCheckmate: vi.fn(() => false),
    isStalemate: vi.fn(() => false),
    isThreefoldRepetition: vi.fn(() => false),
    isInsufficientMaterial: vi.fn(() => false),
    undo: vi.fn(),
    turn: vi.fn(() => 'w'),
    move: vi.fn(),
    fen: vi.fn(() => 'mock-fen'),
  }))
}));

describe('useTournamentRunner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getBot.mockImplementation(() => vi.fn(() => 'e2e4'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('complete tournament cycle', async () => {
    const { result } = renderHook(() => useTournamentRunner());
    const bots = ['bot1', 'bot2'];
    
    act(() => result.current.startTournament(bots));
    expect(result.current.status).toBe('running');
    
    await act(async () => vi.runAllTimersAsync());
    
    expect(result.current.status).toBe('complete');
    expect(result.current.standings).toEqual([
      expect.objectContaining({ name: 'bot1', p: 1 }),
      expect.objectContaining({ name: 'bot2', p: 1 })
    ]);
  });

  test('handles bot errors in matches', async () => {
    getBot.mockImplementation(() => vi.fn(() => {
      throw new Error('Bot failed');
    }));
    
    const { result } = renderHook(() => useTournamentRunner());
    const bots = ['bot1', 'bot2'];
    
    act(() => result.current.startTournament(bots));
    await act(async () => vi.runAllTimersAsync());
    
    expect(result.current.completedMatches[0].result).not.toBe('draw');
  });

  test('persists and restores tournament state', () => {
    const initialState = {
      status: 'running',
      standings: [{name: 'bot1', w:1, l:0, d:0, p:1}],
      matches: [],
      completedMatches: [],
      currentMatch: null
    };
    
    localStorage.setItem('chess-tournament-last', JSON.stringify(initialState));
    
    const { result } = renderHook(() => useTournamentRunner());
    expect(result.current.status).toBe('complete'); // Should reset to complete
  });
});
