import { useState, useRef } from 'react';
import chess from 'chess';
import { Chessboard } from 'react-chessboard';
import { getFen, findMoveNotation } from '../chessAdapter';
import { getBot } from '../bot/botInterface';
import InfoPanel from '../components/InfoPanel';
import BotSelectorPanel from '../components/BotSelectorPanel';

const GamePage = ({ selectedBot, onBotChange, botNames }) => {
  const gameRef = useRef(chess.create({ PGN: true }));
  const [fen, setFen] = useState(() => getFen(gameRef.current));
  const [boardOrientation] = useState('white');
  
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
  
  const status = gameRef.current.getStatus();
  const turn = fen.includes(' w ') ? 'white' : 'black';
  
  return (
    <div className="page-container">
      <div className="game-content">
        <h1 className="page-title">Chess vs Computer</h1>
        <div className="board-container">
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            boardOrientation={boardOrientation}
            customBoardStyle={{
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          />
        </div>
        <InfoPanel status={status} turn={turn} onReset={resetBoard} />
        <BotSelectorPanel
          selectedBot={selectedBot}
          onBotChange={onBotChange}
          botNames={botNames}
        />
      </div>
    </div>
  );
};

export default GamePage;
