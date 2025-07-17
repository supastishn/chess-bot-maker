import { useState } from 'react';
import { getBotNames as getBotNamesFromInterface, registerUserBot } from '../bot/botInterface';

export const useBotRegistry = () => {
  const [botNames, setBotNames] = useState(getBotNamesFromInterface());

  const registerBot = (name, code, source) => {
    if (!name || !code) {
      alert('Please provide bot name and code');
      return false;
    }
    try {
      registerUserBot(name, new Function('game', `return ${code};`)(), source);
      setBotNames(getBotNamesFromInterface());
      return true;
    } catch (e) {
      alert(`Bot Error: ${e.message}`);
      return false;
    }
  };

  return { botNames, registerBot };
};
