import { useState, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { getBot } from '../bot/botInterface';
import InfoPanel from '../components/InfoPanel';
import BotSelectorPanel from '../components/BotSelectorPanel';

const GamePage = ({ selectedBot, onBotChange, botNames }) => {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [boardOrientation] = useState('white');

  // --- Click-to-move state ---
  const [activeSquare, setActiveSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [customSquareStyles, setCustomSquareStyles] = useState({});

  // Helper to clear move highlights
  const clearValidMoves = () => {
    setActiveSquare(null);
    setValidMoves([]);
    setCustomSquareStyles({});
  };

  // Helper for pawn promotion detection
  const handleMove = (from, to, promotion = 'q') => {
    const moveResult = makeMove({
      from,
      to,
      promotion
    });

    // Only proceed with bot move if human move was successful
    if (moveResult) {
      setTimeout(() => {
        if (!gameRef.current.isGameOver()) {
          const botMove = getBot(selectedBot)(gameRef.current);
          if (botMove) makeMove(botMove);
        }
      }, 200);
    }

    return !!moveResult;  // Return boolean success status
  };

  // Click handler for squares
  const handleSquareClick = (square) => {
    const game = gameRef.current;
    const piece = game.get(square);

    // Proper pawn promotion detection
    const isPawnPromotion = activeSquare &&
      game.get(activeSquare)?.type === 'pawn' &&
      ((game.turn() === 'w' && square[1] === '8') ||
       (game.turn() === 'b' && square[1] === '1'));

    // If clicking a piece of current player's color
    if (piece && piece.color === game.turn()) {
      const movesForPiece = game.moves({ square, verbose: true });
      const moveTargets = movesForPiece.map(m => m.to);
      setValidMoves(moveTargets);
      setActiveSquare(square);

      // Create circle styles for valid moves
      const styles = moveTargets.reduce((obj, move) => {
        obj[move] = {
          background: 'radial-gradient(circle, #00ff0044 25%, transparent 26%)',
          borderRadius: '50%'
        };
        return obj;
      }, {});

      // Add border for active piece
      styles[square] = { border: '3px solid #00ff00' };
      setCustomSquareStyles(styles);
    }
    // If valid destination is clicked
    else if (activeSquare && validMoves.includes(square)) {
      handleMove(
        activeSquare,
        square,
        isPawnPromotion ? 'q' : undefined
      );
      clearValidMoves();
    }
    // Clear moves on any other click
    else {
      clearValidMoves();
    }
  };

  // Modified makeMove to clear highlights
  const makeMove = (move) => {
    try {
      // Create move object with optional promotion
      const moveObj = { from: move.from, to: move.to };
      if (move.promotion) {
        moveObj.promotion = move.promotion;
      }

      const result = gameRef.current.move(moveObj);
      setFen(gameRef.current.fen());
      clearValidMoves();
      return result;
    } catch (e) {
      console.error("Move failed:", e);
      return null;
    }
  };

  // Modified onDrop to use handleMove
  const onDrop = (sourceSquare, targetSquare) => {
    const game = gameRef.current;
    const piece = game.get(sourceSquare);
    const isPawnPromotion = piece?.type === 'pawn' &&
      ((piece.color === 'w' && targetSquare[1] === '8') ||
       (piece.color === 'b' && targetSquare[1] === '1'));

    return handleMove(
      sourceSquare,
      targetSquare,
      isPawnPromotion ? 'q' : undefined
    );
  };

  // Modified resetBoard to clear highlights
  const resetBoard = () => {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    clearValidMoves();
  };

  const turn = gameRef.current.turn() === 'w' ? 'white' : 'black';
  const status = {
    isCheckmate: gameRef.current.isCheckmate(),
    isStalemate: gameRef.current.isStalemate(),
    isRepetition: gameRef.current.isThreefoldRepetition(),
  };

  return (
    <div className="page-container">
      <div className="game-content">
        <h1 className="page-title">Chess vs Computer</h1>
        <div className="board-container">
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            onSquareClick={handleSquareClick}
            boardOrientation={boardOrientation}
            customBoardStyle={{
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
            customSquareStyles={customSquareStyles}
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
