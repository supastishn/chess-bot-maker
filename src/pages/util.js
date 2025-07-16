import { Chess } from 'chess.js';

export function toDests(game) {
  const dests = new Map();

  if (!game || typeof game.moves !== 'function' || game.isGameOver()) {
    return dests;
  }

  const moves = game.moves({ verbose: true });
  for (const move of moves) {
    if (!dests.has(move.from)) {
      dests.set(move.from, []);
    }
    dests.get(move.from).push(move.to);
  }

  return dests;
}
