import { render, screen } from '@testing-library/react'
import GamePage from '../../src/pages/Game'

jest.mock('chessground', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('GamePage', () => {
  test('renders chess board', () => {
    render(<GamePage selectedBot="random-bot" botNames={[]}/>)
    expect(screen.getByText('Chess vs Computer')).toBeInTheDocument()
  })
})
