import { useCallback, useState } from 'react';
import { getBotNames, registerBot, getBot } from '../bot/botInterface';
import { Chess } from 'chess.js';

const useBotTester = () => {
  const [isTesting, setIsTesting] = useState(false);
  
  const runBotTests = useCallback(async (botName, botCode) => {
    setIsTesting(true);
    
    // Temporary registration for testing with a unique name
    const tempTestBotName = `__temp_test_bot_${Date.now()}`;
    registerBot(tempTestBotName, new Function('game', `return (${botCode});`)(), null);
    const testBot = getBot(tempTestBotName);
    
    const opponents = [
      'starter-bot',
      'material-bot',
      'random-bot',
      'aggressive-bot'
    ].filter(name => getBotNames().includes(name));
    
    const results = { wins: 0, losses: 0, draws: 0, matchResults: [] };
    
    for (const opponentName of opponents) {
      // Pass bot names to the match runner for correct result tracking
      const result = await runBotMatch(testBot, getBot(opponentName), botName, opponentName);
      if (result.result === 'win') results.wins++;
      else if (result.result === 'loss') results.losses++;
      else results.draws++;
      results.matchResults.push(result);
    }
    
    const totalMatches = results.matchResults.length;
    if (totalMatches > 0) {
      // Elo calculation should account for draws
      const winPercent = (results.wins + results.draws * 0.5) / totalMatches;
      results.rating = Math.round(800 + (winPercent * 1200));
    } else {
      results.rating = 800; // Default rating
    }
    
    setIsTesting(false);
    return results;
  }, []);
  
  const runBotMatch = async (bot1, bot2, bot1Name, bot2Name) => {
    const game = new Chess();
    let moves = 0;
    let loopBroken = false;

    while (!game.isGameOver() && moves < 100) {
      try {
        const currentBot = game.turn() === 'w' ? bot1 : bot2;
        // Give the bot a copy of the game to prevent state corruption
        const gameCopy = new Chess(game.fen());
        const move = await currentBot(gameCopy);

        if (!move) {
          loopBroken = true;
          break;
        }
        game.move(move);
        moves++;
      } catch (e) {
        console.error(`Bot error during testing match for ${game.turn() === 'w' ? bot1Name : bot2Name}`, e);
        loopBroken = true;
        break;
      }
    }

    let result; // 'win', 'loss', or 'draw' from bot1's perspective
    if (game.isCheckmate()) {
      result = game.turn() === 'b' ? 'win' : 'loss';
    } else if (loopBroken) {
      // The player whose turn it was is at fault for breaking the loop
      result = game.turn() === 'w' ? 'loss' : 'win';
    } else {
      result = 'draw';
    }
    
    return {
      opponent: bot2Name,
      result,
      moves,
    };
  };
  
  return { isTesting, runBotTests };
};

export default useBotTester;
