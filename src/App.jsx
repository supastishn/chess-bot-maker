import { useState } from 'react';
import { Chess } from '@chrisoakman/chess.js';
import { Chessboard } from 'react-chessboard';
import './App.css';
import { getBot, getBotNames, registerBot } from './bot/botInterface';

function App() {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation] = useState('white');
  const [gameMode] = useState('vsComputer');
  const [selectedBot, setSelectedBot] = useState('material-bot');
  const [customBotCode, setCustomBotCode] = useState('');
  const [customBotName, setCustomBotName] = useState('');

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

    setTimeout(() => {
      if (!game.isGameOver()) {
        const botMove = getBot(selectedBot)(game);
        if (botMove) {
          makeMove(botMove);
        }
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

      <div className="bot-panel">
        <h3>Bot Configuration</h3>
        
        <div className="bot-selector">
          <label>Active Bot:</label>
          <select 
            value={selectedBot} 
            onChange={(e) => setSelectedBot(e.target.value)}
          >
            {getBotNames().map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        
        <div className="custom-bot-creator">
          <h4>Create New Bot</h4>
          <input
            type="text"
            placeholder="Bot name"
            value={customBotName}
            onChange={(e) => setCustomBotName(e.target.value)}
          />
          <textarea
            value={customBotCode}
            onChange={(e) => setCustomBotCode(e.target.value)}
            placeholder="(game) => { /* bot logic */ }"
            rows={5}
          />
          <button
            onClick={() => {
              try {
                // The user code should be a function body or an arrow function
                // We wrap it in a function that receives Chess as an argument
                // so users can use Chess if they want.
                // Example: (game) => { ... }
                // eslint-disable-next-line no-new-func
                const botFunc = new Function('Chess', `return (${customBotCode});`)(Chess);
                registerBot(customBotName, botFunc);
                setSelectedBot(customBotName);
                setCustomBotCode('');
              } catch (e) {
                alert(`Bot Error: ${e.message}`);
              }
            }}
          >
            Register Bot
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
