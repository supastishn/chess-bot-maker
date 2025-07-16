import { useState } from 'react';
import { getBotNames as getBotNamesFromInterface, registerBot as registerBotInInterface } from '../bot/botInterface';

export const useBotRegistry = () => {
  const [botNames, setBotNames] = useState(getBotNamesFromInterface());
  
  const registerBot = (name, code) => {
    if (!name || !code) {
      alert('Please provide bot name and code');
      return false;
    }
    try {
      registerBotInInterface(name, new Function('gameClient', `return ${code};`)());
      setBotNames(getBotNamesFromInterface());
      return true;
    } catch (e) {
      alert(`Bot Error: ${e.message}`);
      return false;
    }
  };

  return { botNames, registerBot };
};
