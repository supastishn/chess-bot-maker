import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Chess } from 'chess.js';
import { getBot } from '../bot/botInterface';
import InfoPanel from '../components/InfoPanel';
import BotSelectorPanel from '../components/BotSelectorPanel';
import BotSelector from '../components/BotSelector';
import { Chessground } from 'chessground';
import { toDests } from './util';
import '../chessground-base.css';
import '../chessground-brown.css';
import '../chessground-cburnett.css';


const GamePage = ({ selectedBot, onBotChange, botNames }) => {
  const gameRef = useRef(new Chess());
  const [boardOrientation] = useState('white');
  const boardRef = useRef(null);
  const cgRef = useRef(null);

  const [gameMode, setGameMode] = useState('bot-human');
  const [blackBot, setBlackBot] = useState('random-bot');

  const getDests = useCallback(() => {
    return toDests(gameRef.current);
  }, []);

  // Update board
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

  updateBoard();

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

  // Bot vs Bot move handler
  const handleBotBotMove = useCallback(() => {
    if (gameMode === 'bot-bot') {
      const turn = gameRef.current.turn();
      const bot = turn === 'w' ? getBot(selectedBot) : getBot(blackBot);
      if (bot) {
        const move = bot(gameRef.current);
        if (move) {
          const moveObj = typeof move === 'string'
            ? { from: move.slice(0, 2), to: move.slice(2, 4) }
            : move;
          gameRef.current.move(moveObj);
          updateBoard();
        }
      }
    }
  }, [gameMode, selectedBot, blackBot, updateBoard]);

  // Start bot move depending on mode
  const startBotMove = useCallback(() => {
    if (!gameRef.current.isGameOver()) {
      if (gameMode === 'bot-human' && gameRef.current.turn() === 'b') {
        setTimeout(() => {
          const move = getBot(selectedBot)(gameRef.current);
          if (move) {
            gameRef.current.move(move);
            updateBoard();
          }
        }, 200);
      } else if (gameMode === 'bot-bot') {
        setTimeout(handleBotBotMove, 200);
      }
    }
  }, [gameMode, selectedBot, updateBoard, handleBotBotMove]);

  // Board move handler
  const onBoardMove = useCallback((from, to) => {
    try {
      const result = gameRef.current.move({ from, to, promotion: 'q' });
      if (result) {
        updateBoard();
        startBotMove();
      }
    } catch (e) {
      console.error('Invalid move', { from, to }, e);
    }
  }, [updateBoard, startBotMove]);

  // Reset board
  const resetBoard = useCallback(() => {
    gameRef.current = new Chess();
    updateBoard();
  }, [updateBoard]);

  // Reset when mode or bots change
  useEffect(() => {
    resetBoard();
  }, [gameMode, selectedBot, blackBot, resetBoard]);

  // Start bot vs bot sequence
  useEffect(() => {
    if (gameMode === 'bot-bot' && !gameRef.current.isGameOver()) {
      startBotMove();
    }
  }, [gameMode, startBotMove]);

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

        {/* Combined panel for controls */}
        <div className="bot-panel glass-card">
          {/* Game Mode Selector */}
          <div className="game-mode-selector" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label>
                <input
                  type="radio"
                  value="bot-human"
                  checked={gameMode === 'bot-human'}
                  onChange={() => setGameMode('bot-human')}
                />
                Bot vs Human
              </label>
              <label>
                <input
                  type="radio"
                  value="bot-bot"
                  checked={gameMode === 'bot-bot'}
                  onChange={() => setGameMode('bot-bot')}
                />
                Bot vs Bot
              </label>
            </div>
          </div>
          
          {/* Bot Selectors */}
          <div className="bot-selectors-container">
            <BotSelector 
              selectedBot={selectedBot} 
              onChange={onBotChange}
              bots={botNames}
              disabled={false}
              label={gameMode === 'bot-bot' ? "Bot for White:" : "Active Bot:"}
            />
            
            {gameMode === 'bot-bot' && (
              <div className="second-bot-selector" style={{ marginTop: '1rem' }}>
                <BotSelector
                  selectedBot={blackBot}
                  onChange={setBlackBot}
                  bots={botNames}
                  disabled={false}
                  label="Bot for Black:"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
