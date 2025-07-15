import { describe, test, expect } from 'vitest';
import { getFen, findMoveNotation } from '../../src/chessAdapter';
import { mockGameClient } from '../utils.js';

describe('chessAdapter', () => {
  describe('getFen()', () => {
    test('starting position', () => {
      const mockStatus = {
        board: {
          squares: [
            ...['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'].map((p, i) => ({ file: String.fromCharCode(97 + i), rank: 8, piece: { type: p === 'n' ? 'knight' : p === 'k' ? 'king' : p === 'q' ? 'queen' : p === 'b' ? 'bishop' : 'rook', side: { name: 'black' }, moveCount: 0 }})),
            ...Array(8).fill(0).map((_, i) => ({ file: String.fromCharCode(97 + i), rank: 7, piece: { type: 'pawn', side: { name: 'black' }, moveCount: 0 }})),
            ...Array(8).fill(0).map((_, i) => ({ file: String.fromCharCode(97 + i), rank: 2, piece: { type: 'pawn', side: { name: 'white' }, moveCount: 0 }})),
            ...['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'].map((p, i) => ({ file: String.fromCharCode(97 + i), rank: 1, piece: { type: p.toLowerCase() === 'n' ? 'knight' : p.toLowerCase() === 'k' ? 'king' : p.toLowerCase() === 'q' ? 'queen' : p.toLowerCase() === 'b' ? 'bishop' : 'rook', side: { name: 'white' }, moveCount: 0 }}))
          ]
        },
        notatedMoves: {},
      };
      const fen = getFen({ getStatus: () => mockStatus });
      expect(fen).toMatch(/rnbqkbnr\/pppppppp\/8\/8\/8\/8\/PPPPPPPP\/RNBQKBNR w KQkq - 0 1/);
    });

    test('position after e4 d5 moves', () => {
      const mockStatus = {
        board: {
          squares: [
            { file: 'e', rank: 1, piece: { type: 'king', side: { name: 'white' }, moveCount: 0 } },
            { file: 'a', rank: 1, piece: { type: 'rook', side: { name: 'white' }, moveCount: 0 } },
            { file: 'h', rank: 1, piece: { type: 'rook', side: { name: 'white' }, moveCount: 0 } },
            { file: 'e', rank: 8, piece: { type: 'king', side: { name: 'black' }, moveCount: 0 } },
            { file: 'a', rank: 8, piece: { type: 'rook', side: { name: 'black' }, moveCount: 0 } },
            { file: 'h', rank: 8, piece: { type: 'rook', side: { name: 'black' }, moveCount: 0 } },
            { file: 'e', rank: 4, piece: { type: 'pawn', side: { name: 'white' } } },
            { file: 'd', rank: 5, piece: { type: 'pawn', side: { name: 'black' } } },
          ]
        },
        notatedMoves: {},
      };
      const fen = getFen({ getStatus: () => mockStatus });
      expect(fen).toMatch(/r3k2r\/8\/8\/3p4\/4P3\/8\/8\/R3K2R w KQkq - 0 1/);
    });

    test('correctly generates FEN for a middlegame position', () => {
      const mockStatus = {
        board: {
          squares: [
            { file: 'e', rank: 2, piece: { type: 'king', side: { name: 'white' }, moveCount: 1 } },
            { file: 'f', rank: 7, piece: { type: 'king', side: { name: 'black' }, moveCount: 0 } },
            { file: 'g', rank: 1, piece: { type: 'rook', side: { name: 'white' }, moveCount: 0 } },
            { file: 'h', rank: 8, piece: { type: 'rook', side: { name: 'black' }, moveCount: 0 } },
            { file: 'a', rank: 8, piece: { type: 'rook', side: { name: 'black' }, moveCount: 1 } },
          ]
        },
        notatedMoves: {},
      };
      const fen = getFen({ getStatus: () => mockStatus });
      expect(fen).toMatch(/r6r\/5k2\/8\/8\/8\/8\/4K3\/6R1 w k - 0 1/);
    });

    test('castling availability after both kings moved', () => {
      const mockStatus = {
        board: {
          squares: [
            { file: 'e', rank: 1, piece: { type: 'king', side: { name: 'white' }, moveCount: 1 } },
            { file: 'e', rank: 8, piece: { type: 'king', side: { name: 'black' }, moveCount: 1 } },
            { file: 'a', rank: 1, piece: { type: 'rook', side: { name: 'white' }, moveCount: 1 } },
            { file: 'h', rank: 1, piece: { type: 'rook', side: { name: 'white' }, moveCount: 1 } },
            { file: 'a', rank: 8, piece: { type: 'rook', side: { name: 'black' }, moveCount: 1 } },
            { file: 'h', rank: 8, piece: { type: 'rook', side: { name: 'black' }, moveCount: 1 } },
          ]
        },
        notatedMoves: {},
      };
      const fen = getFen({ getStatus: () => mockStatus });
      expect(fen).toMatch(/- 0 1$/);
    });
  });

  describe('findMoveNotation()', () => {
    test('standard pawn move', () => {
      const moveObj = { from: 'e2', to: 'e4' };
      const status = {
        notatedMoves: {
          e2e4: {
            src: { file: 'e', rank: 2, piece: { type: 'pawn', side: { name: 'white' } } },
            dest: { file: 'e', rank: 4, piece: null }
          }
        }
      };
      const notation = findMoveNotation(
        { getStatus: () => status },
        moveObj
      );
      expect(notation).toBe('e2e4');
    });

    test('queenside castling', () => {
      const moveObj = { from: 'e1', to: 'c1', castling: 'queenside' };
      const status = {
        notatedMoves: {
          e1c1: {
            src: { file: 'e', rank: 1, piece: { type: 'king', side: { name: 'white' } } },
            dest: { file: 'c', rank: 1, piece: null }
          }
        }
      };
      const notation = findMoveNotation(
        { getStatus: () => status },
        moveObj
      );
      expect(notation).toBe('e1c1');
    });

    test('promotion move', () => {
      const moveObj = { from: 'e7', to: 'e8', promotion: 'q' };
      const status = {
        notatedMoves: {
          e7e8: {
            src: { file: 'e', rank: 7, piece: { type: 'pawn', side: { name: 'white' } } },
            dest: { file: 'e', rank: 8, piece: null }
          }
        }
      };
      const notation = findMoveNotation(
        { getStatus: () => status },
        moveObj
      );
      expect(notation).toMatch(/e7e8=Q/);
    });
  });
});
