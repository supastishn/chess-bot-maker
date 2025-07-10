import { useState, useRef } from 'react';
import chess from 'chess';
import { Chessboard } from 'react-chessboard';
import './App.css';
import { getBot, getBotNames, registerBot } from './bot/botInterface';
import { getFen, findMoveNotation } from './chessAdapter';
import InfoPanel from './components/InfoPanel';
import BotPanel from './components/BotPanel';

function App() {
  const gameRef = useRef(chess.create({ PGN: true }));
  const [fen, setFen] = useState(() => getFen(gameRef.current));
  const [boardOrientation] = useState('white');
  const [selectedBot, setSelectedBot] = useState('material-bot');
  const [botNames, setBotNames] = useState(getBotNames());

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
        }
      }
    }, 200);

    return true;
  };

  const resetBoard = () => {
    gameRef.current = chess.create({ PGN: true });
    setFen(getFen(gameRef.current));
  };

  const handleRegisterBot = (name, code) => {
    if (!name || !code) {
      alert('Please provide a name and code for the bot.');
      return;
    }
    try {
      // Using new Function() can be a security risk in production environments
      const botFunc = new Function('gameClient', `return (${code});`)();
      registerBot(name, botFunc);
      setBotNames(getBotNames()); // Refresh bot names
      setSelectedBot(name); // Select the newly registered bot
    } catch (e) {
      alert(`Bot Error: ${e.message}`);
    }
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

      <InfoPanel status={status} turn={turn} onReset={resetBoard} />

      <BotPanel
        selectedBot={selectedBot}
        onBotChange={setSelectedBot}
        botNames={botNames}
        onRegisterBot={handleRegisterBot}
      />
    </div>
  );
}

export default App;
