import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Chess } from 'chess.js';
import { getBot } from '../bot/botInterface';
import InfoPanel from '../components/InfoPanel';
import BotSelectorPanel from '../components/BotSelectorPanel';
import { Chessground } from 'chessground';
import { toDests } from './util';
import '../chessground-base.css';
import '../chessground-brown.css';
import '../chessground-cburnett.css';

console.log("[GamePage] Component initialized");

const GamePage = ({ selectedBot, onBotChange, botNames }) => {
  console.log(`[GamePage] Rendering with bot: ${selectedBot}`);
  const gameRef = useRef(new Chess());
  const [boardOrientation] = useState('white');
  const boardRef = useRef(null);
  const cgRef = useRef(null);

  const getDests = useCallback(() => {
    return toDests(gameRef.current);
  }, []);

  const updateBoard = useCallback(() => {
    if (cgRef.current) {
      const turnColor = gameRef.current.turn() === 'w' ? 'white' : 'black';
      cgRef.current.set({
        fen: gameRef.current.fen(),
        turnColor,
        movable: {
          color: boardOrientation,
          dests: getDests(),
          free: false,
          events: { after: onBoardMove }
        }
      });
    }
  }, [boardOrientation, getDests]);

  useEffect(() => {
    // Setup interval for logging dests
    const intervalId = setInterval(() => {
      const dests = getDests();
      console.log('Current destination squares (dests):', Object.fromEntries(dests));
      console.log('Board state (fen):', gameRef.current.fen());
      console.log('Board position:');
      console.group();
      console.log(gameRef.current.ascii());
      console.groupEnd();
    }, 5000);

    // Initialize board
    updateBoard();

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [boardOrientation, getDests, updateBoard]);

  // Initialize chessground
  useEffect(() => {
    if (boardRef.current && !cgRef.current) {
      try {
        if (!Chessground || typeof Chessground !== 'function') {
          throw new TypeError('Chessground is not a function!');
        }
        cgRef.current = Chessground(boardRef.current, {
          fen: gameRef.current.fen(),
          orientation: boardOrientation,
          turnColor: gameRef.current.turn() === 'w' ? 'white' : 'black',
          movable: {
            color: boardOrientation,
            dests: getDests(),
            free: false,
            events: { after: onBoardMove }
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
    // eslint-disable-next-line
  }, []);

  const onBoardMove = useCallback((from, to) => {
    handleMove({ from, to, promotion: 'q' });
  }, []);

  const handleMove = useCallback((from, to) => {
    try {
      const result = gameRef.current.move({ from, to, promotion: 'q' });
      if (result) {
        updateBoard();
        if (!gameRef.current.isGameOver()) {
          setTimeout(() => {
            const botMove = getBot(selectedBot)(gameRef.current);
            if (botMove) {
              gameRef.current.move(botMove);
              updateBoard();
            }
          }, 200);
        }
        return result;
      }
    } catch (e) {
      console.error('Invalid move', { from, to }, e);
    }
    return null;
  }, [selectedBot, updateBoard]);

  const makeMove = useCallback((move) => {
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
        updateBoard();
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
  }, [updateBoard]);

  const resetBoard = useCallback(() => {
    console.log("[GamePage] Resetting board to start position");
    gameRef.current = new Chess();
    updateBoard();
  }, [updateBoard]);

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
