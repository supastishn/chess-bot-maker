import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Chess } from 'chess.js';
import useTournamentRunner from '../../src/hooks/useTournamentRunner';

vi.mock('chess.js');

vi.mock('../../src/bot/botInterface', () => ({
  getBot: vi.fn()
}));

describe('useTournamentRunner', () => {
  beforeEach(() => {
    vi.stubGlobal('Math.random', () => 0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
    const { getBot } = require('../../src/bot/botInterface');
    getBot.mockImplementation(() => () => 'e2e4');

    const chessMock = {
      move: vi.fn(),
      turn: vi.fn().mockReturnValue('w'),
      isGameOver: vi.fn().mockReturnValue(true),
      history: vi.fn().mockReturnValue([]),
      fen: vi.fn().mockReturnValue('')
    };
    vi.mocked(Chess).mockImplementation(() => chessMock);

    const { result, waitForNextUpdate } = renderHook(() => useTournamentRunner());
    const bots = ['bot1', 'bot2'];

    await act(async () => {
      result.current.startTournament(bots);
      await waitForNextUpdate();
    });

    expect(result.current.status).toBe('running');
    expect(result.current.standings.length).toBe(2);
    expect(result.current.currentMatch).toEqual(
      expect.objectContaining({ white: 'bot1', black: 'bot2' })
    );
  });

  it('handles premature termination', async () => {
    const { getBot } = require('../../src/bot/botInterface');
    getBot.mockImplementation(() => () => 'e2e4');

    const { result } = renderHook(() => useTournamentRunner());
    const bots = ['bot1', 'bot2'];

    await act(async () => {
      result.current.startTournament(bots);
      result.current.stopTournament();
    });

    expect(result.current.status).toBe('complete');
  });
});
