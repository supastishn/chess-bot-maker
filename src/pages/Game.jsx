import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { getBot } from '../bot/botInterface';
import InfoPanel from '../components/InfoPanel';
import BotSelectorPanel from '../components/BotSelectorPanel';
import { Chessground } from 'chessground';
import '../chessground-base.css';
import '../chessground-brown.css';
import '../chessground-cburnett.css';

console.log("[GamePage] Component initialized");

const GamePage = ({ selectedBot, onBotChange, botNames }) => {
  console.log(`[GamePage] Rendering with bot: ${selectedBot}`);
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [boardOrientation] = useState('white');
  const boardRef = useRef(null);
  const cgRef = useRef(null);
  const destsRef = useRef(null);

  const getDests = () => {
    const dests = new Map();
    gameRef.current.moves({ verbose: true }).forEach(m => {
      const targets = dests.get(m.from) || [];
      targets.push(m.to);
      dests.set(m.from, targets);
    });
    destsRef.current = dests; // Store dests in ref
    return dests;
  };

  // Update chessground board when FEN changes
  useEffect(() => {
    // Setup interval for logging dests
    const intervalId = setInterval(() => {
      if (destsRef.current) {
        console.log('Current destination squares (dests):',
          Object.fromEntries(destsRef.current));
      }
    }, 5000);

    if (cgRef.current) {
      cgRef.current.set({
        fen,
        orientation: boardOrientation,
        turnColor: gameRef.current.turn() === 'w' ? 'white' : 'black',
        movable: {
          color: boardOrientation,
          dests: getDests(),
          free: false,
          events: {
            after: onBoardMove
          }
        }
      });
    }

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [fen, boardOrientation]);

  // Initialize chessground
  useEffect(() => {
    if (boardRef.current && !cgRef.current) {
      try {
        if (!Chessground || typeof Chessground !== 'function') {
          throw new TypeError('Chessground is not a function!');
        }
        cgRef.current = Chessground(boardRef.current, {
          fen: fen,
          orientation: boardOrientation,
          turnColor: gameRef.current.turn() === 'w' ? 'white' : 'black',
          movable: {
            color: boardOrientation,
            free: false,
            events: {
              after: onBoardMove
            }
          },
          animation: {
            enabled: true,
            duration: 200
          },
          highlight: {
            lastMove: true,
            check: true
          }
        });
      } catch (error) {
        console.error('Chessground initialization error:', error);
      }
    }
    return () => {
      if (cgRef.current?.destroy) {
        cgRef.current.destroy();
      }
      cgRef.current = null;
    };
  }, []);

  const onBoardMove = (from, to) => {
    handleMove({ from, to, promotion: 'q' });
  };

  const handleMove = async (move) => {
    const currentTurn = gameRef.current.turn();
    const isHumanTurn = (boardOrientation === 'white' && currentTurn === 'w') ||
                        (boardOrientation === 'black' && currentTurn === 'b');
    if (!isHumanTurn) return false;

    console.log(`[GamePage] Handling move: ${move.from}->${move.to}`);
    console.group("Pre-move game state");
    console.log("FEN:", gameRef.current.fen());
    console.log("Turn:", currentTurn);
    console.log("Status:", gameRef.current.game_over() ? "game over" : "active");
    console.groupEnd();

    const moveResult = makeMove({ from: move.from, to: move.to, promotion: move.promotion || 'q' });

    if (moveResult) {
      setTimeout(async () => {
        if (!gameRef.current.isGameOver()) {
          console.log(`[GamePage] Calling bot: ${selectedBot}`);
          const movePromise = getBot(selectedBot)(gameRef.current);
          const botMove = movePromise instanceof Promise ? await movePromise : movePromise;
          console.log(`[GamePage] Bot responded with move: ${JSON.stringify(botMove)}`);
          if (botMove) {
            if (typeof botMove === 'string') {
              makeMove({
                from: botMove.slice(0, 2),
                to: botMove.slice(2, 4),
                promotion: botMove[4] || 'q'
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

  const makeMove = (move) => {
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
      if (move.promotion) {
        moveObj.promotion = move.promotion;
      }
      const result = gameRef.current.move(moveObj);
      if (result) {
        console.log('Move successful:', result.san);
        console.log('New FEN:', gameRef.current.fen());
        setFen(gameRef.current.fen());
        return result;
      } else {
        console.warn('Move returned null result');
        return null;
      }
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

  const resetBoard = () => {
    console.log("[GamePage] Resetting board to start position");
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
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
        <div className="board-container" style={{
          width: '100%',
          maxWidth: '500px',
          aspectRatio: '1/1'
        }}>
          <div ref={boardRef} className="cg-wrap" style={{ height: '100%', width: '100%' }} />
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
