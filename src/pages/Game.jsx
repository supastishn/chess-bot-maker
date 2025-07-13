import { useState, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { getBot } from '../bot/botInterface';
import InfoPanel from '../components/InfoPanel';
import BotSelectorPanel from '../components/BotSelectorPanel';

console.log("[GamePage] Component initialized");

const GamePage = ({ selectedBot, onBotChange, botNames }) => {
  console.log(`[GamePage] Rendering with bot: ${selectedBot}`);
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

  // Update handleMove to use object format and handle bot moves
  const handleMove = (from, to, promotion = undefined) => {
    console.log(`[GamePage] Handling move: ${from}->${to}`);

    // Log game state before human move
    console.group("Pre-move game state");
    console.log("FEN:", gameRef.current.fen());
    console.log("Turn:", gameRef.current.turn());
    console.log("Status:", gameRef.current.game_over() ? "game over" : "active");
    console.groupEnd();

    const moveResult = makeMove({ from, to, promotion });

    // Only proceed with bot move if human move was successful
    if (moveResult) {
      setTimeout(() => {
        if (!gameRef.current.isGameOver()) {
          console.log(`[GamePage] Calling bot: ${selectedBot}`);
          const botMove = getBot(selectedBot)(gameRef.current);
          console.log(`[GamePage] Bot responded with move: ${JSON.stringify(botMove)}`);
          if (botMove) {
            // Handle string moves correctly
            if (typeof botMove === 'string') {
              makeMove({
                from: botMove.slice(0, 2),
                to: botMove.slice(2, 4)
              });
            } else {
              makeMove(botMove);
            }
          }
        }
      }, 200);
    }

    return !!moveResult;
  };

  // Simplified handleSquareClick
  const handleSquareClick = (square) => {
    console.log(`[SquareClick] ${square} ${gameRef.current.get(square) ? "has piece" : "empty"}`);
    const game = gameRef.current;
    const piece = game.get(square);

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
      console.log(`Attempting move from ${activeSquare} to ${square}`); // Added
      handleMove(activeSquare, square);       // This is the actual fix
      clearValidMoves();
    }
    // Clear moves on any other click
    else {
      clearValidMoves();
    }
  };

  // Debug logging for e2e4 move attempts
  const logMoveDebugInfo = (move) => {
    console.group('Move Debug: e2e4');
    console.log('Move attempt:', move);
    console.log('Game FEN before move:', gameRef.current.fen());
    console.log('Active chess.js state:', gameRef.current.ascii());
    console.log('Game over status:', gameRef.current.isGameOver());
    console.log('Turn:', gameRef.current.turn());
    console.log('Available moves for e2:');
    try {
      const moves = gameRef.current.moves({ square: 'e2', verbose: true });
      console.log(moves.map(m =>
        `${m.from}${m.to}${m.promotion || ''} - ${m.san}`
      ));
    } catch (e) {
      console.error('Error fetching moves:', e);
    }
    console.groupEnd();
  };

  // Always use object format for moves
  const makeMove = (move) => {
    // Log debug info for all moves
    console.group(`Move Debug: ${move.from} to ${move.to}`);
    console.log('Move attempt:', move);
    console.log('Game FEN before move:', gameRef.current.fen());
    console.log('Active chess.js state:', gameRef.current.ascii());
    console.log('Game over status:', gameRef.current.isGameOver());
    console.log('Turn:', gameRef.current.turn());
    console.log('Available moves for position:');
    try {
      const moves = gameRef.current.moves({ square: move.from, verbose: true });
      console.log(moves.map(m => 
        `${m.from}${m.to}${m.promotion || ''} - ${m.san}`
      ));
    } catch (e) {
      console.error('Error fetching moves:', e);
    }
    console.groupEnd();

    try {
      console.log(`Attempting move: ${move.from} to ${move.to}${move.promotion ? ` (promotion: ${move.promotion})` : ''}`);
      const moveObj = {
        from: move.from,
        to: move.to
      };
      // Only add promotion when explicitly specified
      if (move.promotion) {
        moveObj.promotion = move.promotion;
      }
      const result = gameRef.current.move(moveObj);
      if (result) {
        console.log('Move successful:', result.san);
        console.log('New FEN:', gameRef.current.fen());
      } else {
        console.warn('Move returned null result');
      }
      setFen(gameRef.current.fen());
      clearValidMoves();
      return result;
    } catch (e) {
      console.error(`Move failed: ${e.message}`);
      console.error('Attempted move:', move);
      console.error('Game state:', {
        fen: gameRef.current.fen(),
        turn: gameRef.current.turn(),
        in_check: gameRef.current.inCheck(),
        game_over: gameRef.current.isGameOver()
      });
      return null;
    }
  };

  // Simplified onDrop
  const onDrop = (sourceSquare, targetSquare) => {
    return handleMove(sourceSquare, targetSquare);
  };

  // Modified resetBoard to clear highlights
  const resetBoard = () => {
    console.log("[GamePage] Resetting board to start position");
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
