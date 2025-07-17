import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Chess } from 'chess.js';
import { getBot } from '../bot/botInterface';
import InfoPanel from '../components/InfoPanel';
import BotSelector from '../components/BotSelector';
import { Chessground } from 'chessground';
import { toDests } from './util';
import '../chessground-base.css';
import '../chessground-brown.css';
import '../chessground-cburnett.css';

const GamePage = ({ selectedBot, onBotChange, botNames }) => {
  const gameRef = useRef(new Chess());
  const [playerColor, setPlayerColor] = useState('white');
  const boardRef = useRef(null);
  const cgRef = useRef(null);
  const timeoutRef = useRef(null); // Track pending bot move timeouts
  const boardOrientation = playerColor;

  // 1. Add FEN state for re-rendering
  const [fen, setFen] = useState(gameRef.current.fen());

  // 2. Add refs for stable callback references
  const updateBoardRef = useRef();
  const startBotMoveRef = useRef();

  // Centralized game state
  const [gameState, setGameState] = useState(() => ({
    turn: gameRef.current.turn() === 'w' ? 'white' : 'black',
    status: {
      isCheckmate: gameRef.current.isCheckmate(),
      isStalemate: gameRef.current.isStalemate(),
      isRepetition: gameRef.current.isThreefoldRepetition(),
    },
  }));

  const [gameMode, setGameMode] = useState('bot-human');
  const [blackBot, setBlackBot] = useState('random-bot');

  const getDests = useCallback(() => {
    return toDests(gameRef.current);
  }, []);

  // 7. Replace onBoardMove to use refs and be stable
  const onBoardMove = useCallback((from, to) => {
    try {
      const result = gameRef.current.move({ from, to, promotion: 'q' });
      if (result) {
        console.log(`[Play] Human plays ${result.san}`);
        updateBoardRef.current();
        startBotMoveRef.current();
      }
    } catch (e) {
      console.error('Invalid move', { from, to }, e);
    }
  }, []);

  // 3. Replace updateBoard to use setFen and stable dependencies
  const updateBoard = useCallback(() => {
    if (cgRef.current) {
      const game = gameRef.current;
      const newFen = game.fen();
      const turnColor = game.turn() === 'w' ? 'white' : 'black';
      const newStatus = {
        isCheckmate: game.isCheckmate(),
        isStalemate: game.isStalemate(),
        isRepetition: game.isThreefoldRepetition(),
      };

      if (game.isGameOver()) {
        let reason = "game over";
        if (newStatus.isCheckmate) {
          const winner = turnColor === 'white' ? 'Black' : 'White';
          reason = `${winner} won by checkmate.`;
        } else if (newStatus.isStalemate) {
          reason = 'Draw by stalemate.';
        } else if (newStatus.isRepetition) {
          reason = 'Draw by threefold repetition.';
        } else if (game.isInsufficientMaterial()) {
          reason = 'Draw by insufficient material.';
        } else if (game.isDraw()) {
          reason = 'Draw by 50-move rule.';
        }
        console.log(`[Play] Game over: ${reason}`);
      }

      setGameState({ turn: turnColor, status: newStatus });
      cgRef.current.set({
        fen: newFen,
        orientation: playerColor,
        turnColor,
        movable: {
          color: gameMode === 'bot-human' ? playerColor : null,
          dests: getDests(),
          free: false,
          events: { after: onBoardMove }
        }
      });
      setFen(newFen);
    }
  }, [gameMode, playerColor, getDests, onBoardMove]);

  // 4. REMOVE erroneous direct call to updateBoard()
  // (No call to updateBoard() here)

  // 6. Replace startBotMove to use refs and break dependency cycle
  const startBotMove = useCallback(() => {
    if (gameRef.current.isGameOver()) return;

    const makeBotMove = async () => {
      const turn = gameRef.current.turn();
      const isBotTurn = (gameMode === 'bot-human' && turn !== playerColor[0]) || gameMode === 'bot-bot';

      if (isBotTurn) {
        const botName = (gameMode === 'bot-bot')
          ? (turn === 'w' ? selectedBot : blackBot)
          : selectedBot;
        const bot = getBot(botName);
        if (!bot) return;

        try {
          // Give the bot a copy of the game to prevent state corruption
          const gameCopy = new Chess(gameRef.current.fen());
          const move = await bot(gameCopy);

          if (move) {
            console.log(`[Play] ${botName} plays ${typeof move === 'object' ? JSON.stringify(move) : move}`);
            gameRef.current.move(move);
            updateBoardRef.current(); // Use the ref here

            // Continue bot vs bot sequence
            if (gameMode === 'bot-bot' && !gameRef.current.isGameOver()) {
              timeoutRef.current = setTimeout(makeBotMove, 200);
            }
          } else {
            console.log(`[Play] ${botName} returned a null move.`);
          }
        } catch (e) {
          console.error("Bot execution error:", e);
        }
      }
    };

    timeoutRef.current = setTimeout(makeBotMove, 200);
  }, [gameMode, selectedBot, blackBot, playerColor]);

  // 8. Replace resetBoard to be stable
  const resetBoard = useCallback(() => {
    // Clear any pending bot move timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    gameRef.current = new Chess();
    updateBoard();
  }, [updateBoard]);

  // 5. Assign callbacks to refs after all useCallback hooks
  updateBoardRef.current = updateBoard;
  startBotMoveRef.current = startBotMove;

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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (cgRef.current?.destroy) {
        cgRef.current.destroy();
      }
      cgRef.current = null;
    };
    // eslint-disable-next-line
  }, []);

  // Reset when mode or bots change
  useEffect(() => {
    resetBoard();
    
    const game = gameRef.current;
    const isHumanVsBot = gameMode === 'bot-human';
    const botIsWhite = isHumanVsBot && playerColor === 'black';
    const botsArePlaying = gameMode === 'bot-bot';
    
    if ((botsArePlaying && game.turn() === 'w') || (isHumanVsBot && botIsWhite)) {
      console.log(`[Play] Starting game: Bot turn`);
      startBotMove();
    } else {
      console.log(`[Play] Starting game: Human turn`);
    }
  }, [gameMode, selectedBot, blackBot, playerColor, resetBoard, startBotMove]);

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
        
        <InfoPanel status={gameState.status} turn={gameState.turn} onReset={resetBoard} />

        {/* Combined panel for controls */}
        <div className="bot-panel glass-card">
          {/* Game Mode Selector */}
          <div className="toggle-group">
            <button
              className={`toggle-btn ${gameMode === 'bot-human' ? 'active' : ''}`}
              onClick={() => setGameMode('bot-human')}
            >
              <span>Bot vs Human</span>
            </button>
            <button
              className={`toggle-btn ${gameMode === 'bot-bot' ? 'active' : ''}`}
              onClick={() => setGameMode('bot-bot')}
            >
              <span>Bot vs Bot</span>
            </button>
          </div>

          {gameMode === 'bot-human' && (
            <div className="toggle-group">
              <button
                className={`toggle-btn ${playerColor === 'white' ? 'active' : ''}`}
                onClick={() => setPlayerColor('white')}
              >
                <span>Play as White</span>
              </button>
              <button
                className={`toggle-btn ${playerColor === 'black' ? 'active' : ''}`}
                onClick={() => setPlayerColor('black')}
              >
                <span>Play as Black</span>
              </button>
            </div>
          )}

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
