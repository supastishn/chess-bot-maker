import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Chess } from 'chess.js';
import useTournamentRunner from '../../src/hooks/useTournamentRunner.js';
import { getBot } from '../../src/bot/botInterface.js';

vi.mock('chess.js');
vi.mock('../../src/bot/botInterface.js');

describe('useTournamentRunner', () => {
  let chessMock;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, 'setTimeout');
    vi.mocked(getBot).mockClear();

    chessMock = {
      move: vi.fn(),
      turn: vi.fn().mockReturnValue('w'),
      isGameOver: vi.fn().mockReturnValue(false),
      history: vi.fn().mockReturnValue([]),
      fen: vi.fn().mockReturnValue(''),
      isCheckmate: vi.fn().mockReturnValue(false),
    };
    vi.mocked(Chess).mockImplementation(() => chessMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useTournamentRunner());
    expect(result.current.status).toBe('idle');
    expect(result.current.standings).toEqual([]);
    expect(result.current.currentGameState).toEqual(expect.objectContaining({
      fen: null,
      white: null,
      black: null
    }));
  });

  it('runs matches correctly', async () => {
    vi.mocked(getBot).mockImplementation(() => () => 'e2e4');

    // Make each game end after one move cycle
    vi.mocked(Chess).mockImplementation(() => ({
      ...chessMock,
      isGameOver: vi.fn()
        .mockReturnValueOnce(false) // Let loop run once
        .mockReturnValue(true),      // End game on second check
      isCheckmate: vi.fn().mockReturnValue(true), // Ensure there's a winner
    }));

    const { result } = renderHook(() => useTournamentRunner());
    const bots = ['bot1', 'bot2'];

    act(() => {
      result.current.startTournament(bots);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('complete');
    expect(result.current.standings.length).toBe(2);

    // With our mock, the white player will always win.
    // Game 1: bot1 (W) vs bot2 (L) -> bot1 wins
    // Game 2: bot2 (W) vs bot1 (L) -> bot2 wins
    // Each bot gets 1 win, 1 loss, for 1 point total.
    const bot1Standing = result.current.standings.find(s => s.name === 'bot1');
    expect(bot1Standing.p).toBe(1);
  });

  it('handles premature termination', async () => {
    vi.mocked(getBot).mockImplementation(() => () => 'e2e4');
  
    const { result } = renderHook(() => useTournamentRunner());
    const bots = ['bot1', 'bot2'];
  
    await act(async () => {
      result.current.startTournament(bots);
      await vi.advanceTimersByTimeAsync(100); // Increase timeout
      result.current.stopTournament();
      await vi.runAllTimersAsync(); // Ensure timers flush
    });
  
    expect(result.current.status).toBe('complete');
  });
});
