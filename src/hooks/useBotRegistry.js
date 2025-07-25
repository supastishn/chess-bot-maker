import { useState } from 'react';
import { getBotNames as getBotNamesFromInterface, registerUserBot, deleteUserBot } from '../bot/botInterface';

export const useBotRegistry = () => {
  const [botNames, setBotNames] = useState(getBotNamesFromInterface());

  const registerBot = (name, code, source, blocklyJson) => {
    if (!name || !code) {
      alert('Please provide bot name and code');
      return false;
    }
    try {
      registerUserBot(name, new Function('game', `return ${code};`)(), source, blocklyJson);
      setBotNames(getBotNamesFromInterface());
      return true;
    } catch (e) {
      alert(`Bot Error: ${e.message}`);
      return false;
    }
  };

  const deleteBot = (name) => {
    if (deleteUserBot(name)) {
      setBotNames(getBotNamesFromInterface());
      return true;
    }
    return false;
  };

  return { botNames, registerBot, deleteBot };
};
