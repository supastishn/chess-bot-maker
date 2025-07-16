import { toDests } from '../../src/pages/util';
import { Chess } from 'chess.js';

describe('toDests', () => {
  test('returns empty map for invalid game state', () => {
    const dests = toDests({});
    expect(dests.size).toBe(0);
  });

  test('returns correct moves for starting position', () => {
    const game = new Chess();
    const dests = toDests(game);
    
    // Should have pawn and knight moves
    expect(dests.get('a2')).toEqual(['a3','a4']);
    expect(dests.get('b1')).toEqual(['a3','c3']);
    expect(dests.size).toBe(10);
  });
});
