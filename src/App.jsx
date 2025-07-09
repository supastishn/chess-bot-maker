import { useState } from 'react';
import { Chess } from '@chrisoakman/chess.js';
import { Chessboard } from 'react-chessboard';
import './App.css';

function App() {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation] = useState('white');
  const [gameMode] = useState('vsComputer');

  const makeMove = (move) => {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    setGame(gameCopy);
    return result;
  };

  const makeRandomMove = () => {
    const moves = game.moves({ verbose: true });
    if (moves.length > 0) {
      const randomIndex = Math.floor(Math.random() * moves.length);
      const move = moves[randomIndex];
      return makeMove(move);
    }
    return null;
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (move === null) return false;

    setTimeout(() => {
      if (!game.isGameOver()) {
        makeRandomMove();
      }
    }, 200);

    return true;
  };

  const resetBoard = () => {
    setGame(new Chess());
  };

  return (
    <div className="chess-app">
      <h1>Chess vs Computer</h1>
      <div className="board-container">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardOrientation={boardOrientation}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        />
      </div>
      
      <div className="info-panel">
        <div className="turn-indicator">
          {game.isGameOver() ? (
            <div className="game-status">
              {game.isCheckmate() && 'Checkmate! '}
              {game.isDraw() && 'Draw! '}
              {game.isStalemate() && 'Stalemate! '}
              {!game.isDraw() && game.turn() === 'b' ? 'White wins' : 'Black wins'}
            </div>
          ) : (
            `Current turn: ${game.turn() === 'w' ? 'White' : 'Black'}`
          )}
        </div>
        
        <button className="reset-button" onClick={resetBoard}>
          Reset Game
        </button>
      </div>
    </div>
  );
}

export default App;
