import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './App.css';

function App() {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState('white');

  const makeMove = (move) => {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    setGame(gameCopy);
    return result;
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (move === null) return false;
    
    // Flip board on successful move
    setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white');
    return true;
  };

  const resetBoard = () => {
    setGame(new Chess());
    setBoardOrientation('white');
  };

  return (
    <div className="chess-app">
      <h1>Pass &amp; Play Chess</h1>
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
