export const mockGameClient = () => ({
  getAvailableMoves: jest.fn(),
  move: jest.fn(),
  undoMove: jest.fn(),
  getGameResult: jest.fn(() => 'ongoing'),
  evaluateMaterial: jest.fn(() => 0),
  getStatus: jest.fn(),
  getTurn: jest.fn(),
  isInCheck: jest.fn(),
  getThreatenedSquares: jest.fn(),
  lookAhead: jest.fn()
});
