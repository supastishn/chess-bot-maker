import { useState, useRef } from 'react';
import chess from 'chess';
import { Chessboard } from 'react-chessboard';
import './App.css';
import { getBot, getBotNames, registerBot } from './bot/botInterface';
import { getFen, findMoveNotation } from './chessAdapter';

const CUSTOM_BOT_PLACEHOLDER = `(gameClient) => {
  // Access game status via gameClient.getStatus()
  // Return move as { from: 'e2', to: 'e4' }
  const status = gameClient.getStatus();
  const moves = status.notatedMoves;
  const moveKeys = Object.keys(moves);
  if (moveKeys.length === 0) return null;
  const randomKey = moveKeys[Math.floor(Math.random() * moveKeys.length)];
  const moveDetails = moves[randomKey];
  return { 
    from: moveDetails.src.file + moveDetails.src.rank, 
    to: moveDetails.dest.file + moveDetails.dest.rank 
  };
}`;

function App() {
  const gameRef = useRef(chess.create({ PGN: true }));
  const [fen, setFen] = useState(() => getFen(gameRef.current));
  const [boardOrientation] = useState('white');
  const [selectedBot, setSelectedBot] = useState('material-bot');
  const [customBotCode, setCustomBotCode] = useState('');
  const [customBotName, setCustomBotName] = useState('');

  const makeMove = (move) => {
    const moveNotation = findMoveNotation(gameRef.current, move);
    if (!moveNotation) return null;
    const result = gameRef.current.move(moveNotation);
    setFen(getFen(gameRef.current));
    return result;
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const moveResult = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (moveResult === null) return false;

    setTimeout(() => {
      const status = gameRef.current.getStatus();
      if (!status.isCheckmate && !status.isStalemate) {
        const botMove = getBot(selectedBot)(gameRef.current);
        if (botMove) {
          makeMove(botMove);
          setFen(getFen(gameRef.current)); // Add this line
        }
      }
    }, 200);

    return true;
  };

  const resetBoard = () => {
    gameRef.current = chess.create({ PGN: true });
    setFen(getFen(gameRef.current));
  };

  const status = gameRef.current.getStatus();
  const turn = fen.includes(' w ') ? 'white' : 'black';

  return (
    <div className="chess-app">
      <h1>Chess vs Computer</h1>
      <div className="board-container">
        <Chessboard
          position={fen}
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
          {status.isCheckmate ? (
            <div className="game-status">
              Checkmate! {turn === 'white' ? 'Black' : 'White'} wins.
            </div>
          ) : status.isStalemate ? (
            <div className="game-status">Draw by Stalemate!</div>
          ) : status.isRepetition ? (
            <div className="game-status">Draw by Repetition!</div>
          ) : (
            `Current turn: ${turn.charAt(0).toUpperCase() + turn.slice(1)}`
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
            placeholder={CUSTOM_BOT_PLACEHOLDER}
            rows={12}
          />
          <button
            onClick={() => {
              if (!customBotName || !customBotCode) {
                alert('Please provide a name and code for the bot.');
                return;
              }
              try {
                const botFunc = new Function('gameClient', `return (${customBotCode});`)();
                registerBot(customBotName, botFunc);
                setSelectedBot(customBotName);
                setCustomBotName('');
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
