import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { getBot } from '../bot/botInterface';

const TOURNAMENT_STORAGE_KEY = 'chess-tournament-last';

const useTournamentRunner = () => {
  const [tournamentState, setTournamentState] = useState(() => {
    try {
      const saved = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.status === 'running') data.status = 'complete';
        return data;
      }
    } catch (e) { console.error("Failed to load tournament data:", e); }
    return { standings: [], matches: [], completedMatches: [], currentMatch: null, status: 'idle' };
  });

  const { standings, matches, currentMatch, status } = tournamentState;

  const [currentGameState, setCurrentGameState] = useState({ fen: null, white: null, black: null });
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (status !== 'idle') {
      localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(tournamentState));
    } else {
      localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
    }
  }, [tournamentState, status]);

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
      resolve({ result, winner, moves: game.history().length });
    });
  };

  const startTournament = async (botNames) => {
    if (botNames.length < 2) {
      alert("Please select at least two bots.");
      return;
    }
    isRunningRef.current = true;
    setTournamentState({
      status: 'running',
      standings: botNames.map(name => ({ name, w: 0, l: 0, d: 0, p: 0 })),
      matches: (() => {
        const arr = [];
        for (let i = 0; i < botNames.length; i++) {
          for (let j = i + 1; j < botNames.length; j++) {
            arr.push({ white: botNames[i], black: botNames[j] });
            arr.push({ white: botNames[j], black: botNames[i] });
          }
        }
        return arr;
      })(),
      currentMatch: null,
    });

    const newMatches = [];
    for (let i = 0; i < botNames.length; i++) {
      for (let j = i + 1; j < botNames.length; j++) {
        newMatches.push({ white: botNames[i], black: botNames[j] });
        newMatches.push({ white: botNames[j], black: botNames[i] });
      }
    }

    // Asynchronous match runner to avoid UI blocking
    const runMatches = async () => {
      for (const match of newMatches) {
        if (!isRunningRef.current) break;
        setTournamentState(s => ({ ...s, currentMatch: match }));
        const { winner, moves } = await runGame(match.white, match.black);

        setTournamentState(prevState => {
          const newStandings = [...prevState.standings];
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

          let winnerName = null;
          if (winner === 'white') winnerName = match.white;
          else if (winner === 'black') winnerName = match.black;

          const completedMatch = {
            white: match.white,
            black: match.black,
            result: winnerName || 'Draw',
            moves
          };

          return {
            ...prevState,
            standings: newStandings,
            completedMatches: [...prevState.completedMatches, completedMatch]
          };
        });
        // Yield to UI thread after each match
        await new Promise(res => setTimeout(res, 0));
      }
      setTournamentState(s => ({ ...s, status: 'complete' }));
      isRunningRef.current = false;
    };

    // Start matches asynchronously to yield to UI thread
    setTimeout(runMatches, 0);
  };

  const stopTournament = () => {
    isRunningRef.current = false;
    setTournamentState(s => ({ ...s, status: 'complete' }));
  };

  const clearTournament = () => {
    setTournamentState({ standings: [], matches: [], completedMatches: [], currentMatch: null, status: 'idle' });
  };

  return { standings, status, currentMatch, currentGameState, startTournament, stopTournament, clearTournament, completedMatches: tournamentState.completedMatches };
};

export default useTournamentRunner;
