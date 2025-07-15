import { getFen } from '../src/chessAdapter'

const mockGameStatus = {
  board: {
    squares: [
      // Mock board state with pieces
      { file: 'a', rank: 1, piece: { type: 'rook', side: { name: 'white' }}},
      { file: 'b', rank: 1, piece: { type: 'knight', side: { name: 'white' }}},
      // ... other squares
    ]
  },
  notatedMoves: {
    e2e4: {
      src: { piece: { side: { name: 'white' }}}
    }
  }
}

describe('chessAdapter', () => {
  test('generates correct FEN for starting position', () => {
    const fen = getFen({ 
      getStatus: () => mockGameStatus 
    })
    expect(fen).toMatch(/rnbqkbnr\/pppppppp\/8\/8\/8\/8\/PPPPPPPP\/RNBQKBNR w KQkq/)
  })
})
