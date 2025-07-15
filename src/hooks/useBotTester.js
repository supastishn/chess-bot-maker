import { useCallback, useState } from 'react';
import { getBotNames, registerBot, getBot } from '../bot/botInterface';
import { Chess } from 'chess.js';

const useBotTester = () => {
  const [isTesting, setIsTesting] = useState(false);
  
  const runBotTests = useCallback(async (botName, botCode) => {
    setIsTesting(true);
    
    // Temporary registration for testing
    registerBot(`__temp_test_bot`, new Function('game', `return (${botCode});`)());
    const testBot = getBot(`__temp_test_bot`);
    
    const opponents = [
      'starter-bot',
      'material-bot',
      'random-bot',
      'aggressive-bot'
    ].filter(name => getBotNames().includes(name));
    
    const results = { wins: 0, losses: 0, draws: 0, matchResults: [] };
    
    for (const opponentName of opponents) {
      const result = await runBotMatch(testBot, getBot(opponentName));
      results[result.result]++;
      results.matchResults.push(result);
    }
    
    // Calculate simple ELO-like rating
    const winPercent = results.wins / results.matchResults.length;
    results.rating = Math.round(800 + (winPercent * 1200));
    
    setIsTesting(false);
    return results;
  }, []);
  
  const runBotMatch = async (bot1, bot2) => {
    const game = new Chess();
    let moves = 0;
    let result = 'draw';
    
    while (!game.isGameOver() && moves < 100) {
      try {
        moves++;
        const move = moves % 2 === 1 
          ? bot1(game) 
          : bot2(game);
        
        if (!move) break;
        
        if (typeof move === 'string') {
          game.move({
            from: move.slice(0, 2),
            to: move.slice(2, 4),
            promotion: move[4] || 'q'
          });
        } else {
          game.move(move);
        }
      } catch (e) {
        break;
      }
    }
    
    if (game.isCheckmate()) {
      result = moves % 2 === 0 ? 'win' : 'loss';
    } else if (game.isDraw()) {
      result = 'draw';
    }
    
    return { 
      opponent: moves % 2 === 1 ? bot2.name : bot1.name, 
      result, 
      moves 
    };
  };
  
  return { isTesting, runBotTests };
};

export default useBotTester;
