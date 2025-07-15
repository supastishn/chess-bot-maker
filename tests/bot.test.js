import { materialBot } from '../src/bot/materialBot'

const mockGame = {
  getAvailableMoves: () => ['e2e4', 'g1f3', 'd2d4'],
  move: jest.fn(),
  undoMove: jest.fn(),
  getGameResult: () => 'ongoing',
  evaluateMaterial: jest.fn(() => 0)
}

describe('materialBot', () => {
  test('selects valid move', () => {
    const move = materialBot(mockGame)
    expect(['e2e4', 'g1f3', 'd2d4']).toContain(move)
  })

  test('prefers checkmate moves', () => {
    mockGame.getGameResult = () => 'checkmate'
    const move = materialBot(mockGame)
    expect(move).toBe('e2e4')
  })
})
