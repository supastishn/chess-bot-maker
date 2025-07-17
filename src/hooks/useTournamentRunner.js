import { useState, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { getBot } from '../bot/botInterface';

const useTournamentRunner = () => {
  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, running, complete
  const [currentGameState, setCurrentGameState] = useState({ fen: null, white: null, black: null });
  const isRunningRef = useRef(false);

  const runGame = async (whiteBotName, blackBotName) => {
    return new Promise(async (resolve) => {
      console.log(`[Tournament] Starting game: ${whiteBotName} (W) vs ${blackBotName} (B)`);
      const game = new Chess();
      const whiteBot = getBot(whiteBotName);
      const blackBot = getBot(blackBotName);

      while (!game.isGameOver() && game.history().length < 200) {
        if (!isRunningRef.current) break;

        const bot = game.turn() === 'w' ? whiteBot : blackBot;
        const botName = game.turn() === 'w' ? whiteBotName : blackBotName;
        try {
          // Give the bot a copy of the game to prevent state corruption
          const gameCopy = new Chess(game.fen());
          const move = await bot(gameCopy);
          if (move) {
            console.log(`[Tournament] ${botName} plays ${typeof move === 'object' ? JSON.stringify(move) : move}`);
            game.move(move);
            setCurrentGameState({ fen: game.fen(), white: whiteBotName, black: blackBotName });
            await new Promise(res => setTimeout(res, 50)); // Yield to UI thread
          } else {
            console.log(`[Tournament] ${botName} returned a null move.`);
            break; // Bot returned null, game ends
          }
        } catch (e) {
          console.error(`Error in bot: ${game.turn() === 'w' ? whiteBotName : blackBotName}`, e);
          break; // Bot error, game ends
        }
      }

      let winner = null;
      if (game.isCheckmate()) {
        winner = game.turn() === 'b' ? 'white' : 'black';
        const winnerName = winner === 'white' ? whiteBotName : blackBotName;
        console.log(`[Tournament] ${winnerName} won by checkmate.`);
      } else if (!game.isGameOver()) {
        // Game loop was broken by bot error, null move, or move limit.
        // Award loss to the current player.
        winner = game.turn() === 'w' ? 'black' : 'white';
        const winnerName = winner === 'white' ? whiteBotName : blackBotName;
        const loserName = game.turn() === 'w' ? whiteBotName : blackBotName;
        console.log(`[Tournament] ${winnerName} won as ${loserName} erred or hit move limit.`);
      } else {
        // Otherwise, it's a draw (stalemate, repetition, etc.)
        let reason = 'a draw';
        if (game.isStalemate()) reason = 'draw by stalemate';
        else if (game.isThreefoldRepetition()) reason = 'draw by repetition';
        else if (game.isInsufficientMaterial()) reason = 'draw by insufficient material';
        console.log(`[Tournament] Game ended in ${reason}.`);
      }
      // Otherwise, it's a draw (stalemate, repetition, etc.), so winner remains null.

      const result = winner || 'draw';
      resolve({ result, winner });
    });
  };

  const startTournament = async (botNames) => {
    if (botNames.length < 2) {
      alert("Please select at least two bots.");
      return;
    }
    isRunningRef.current = true;
    setStatus('running');
    
    // Initialize standings
    const initialStandings = botNames.map(name => ({ name, w: 0, l: 0, d: 0, p: 0 }));
    setStandings(initialStandings);

    // Generate round-robin matches
    const newMatches = [];
    for (let i = 0; i < botNames.length; i++) {
      for (let j = i + 1; j < botNames.length; j++) {
        newMatches.push({ white: botNames[i], black: botNames[j] });
        newMatches.push({ white: botNames[j], black: botNames[i] });
      }
    }
    setMatches(newMatches);

    // Asynchronous match runner to avoid UI blocking
    const runMatches = async () => {
      for (const match of newMatches) {
        if (!isRunningRef.current) break;
        setCurrentMatch(match);
        const { winner } = await runGame(match.white, match.black);

        setStandings(prevStandings => {
          const newStandings = [...prevStandings];
          const whiteIndex = newStandings.findIndex(s => s.name === match.white);
          const blackIndex = newStandings.findIndex(s => s.name === match.black);

          if (winner === 'white') {
            newStandings[whiteIndex].w++;
            newStandings[whiteIndex].p++;
            newStandings[blackIndex].l++;
          } else if (winner === 'black') {
            newStandings[blackIndex].w++;
            newStandings[blackIndex].p++;
            newStandings[whiteIndex].l++;
          } else {
            newStandings[whiteIndex].d++;
            newStandings[blackIndex].d++;
            newStandings[whiteIndex].p += 0.5;
            newStandings[blackIndex].p += 0.5;
          }
          return newStandings;
        });
        // Yield to UI thread after each match
        await new Promise(res => setTimeout(res, 0));
      }
      setStatus('complete');
      isRunningRef.current = false;
    };

    // Start matches asynchronously to yield to UI thread
    setTimeout(runMatches, 0);
  };

  const stopTournament = () => {
    isRunningRef.current = false;
    setStatus('complete');
  };

  return { standings, status, currentMatch, currentGameState, startTournament, stopTournament };
};

export default useTournamentRunner;
