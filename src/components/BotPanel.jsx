import React, { useState } from 'react';

const CUSTOM_BOT_PLACEHOLDER = `(gameClient) => {
  // Access game status via gameClient.getStatus()
  // Return move as { from: 'e2', to: 'e4' }
  const status = gameClient.getStatus();
  const moves = status.notatedMoves;
  const moveKeys = Object.keys(moves);
  if (moveKeys.length === 0) return null;
  const randomKey = moveKeys[Math.floor(Math.random() * moveKeys.length)];
  const moveDetails = moves[randomKey];
  return { 
    from: moveDetails.src.file + moveDetails.src.rank, 
    to: moveDetails.dest.file + moveDetails.dest.rank 
  };
}`;

const BotPanel = ({ selectedBot, onBotChange, botNames, onRegisterBot }) => {
  const [customBotName, setCustomBotName] = useState('');
  const [customBotCode, setCustomBotCode] = useState('');

  const handleRegisterClick = () => {
    if (!customBotName || !customBotCode) {
      alert('Please provide a name and code for the bot.');
      return;
    }
    onRegisterBot(customBotName, customBotCode);
    setCustomBotName('');
    setCustomBotCode('');
  };

  return (
    <div className="bot-panel">
      <h3>Bot Configuration</h3>

      <div className="bot-selector">
        <label>Active Bot:</label>
        <div className="bot-selector">
          <select 
            value={selectedBot}
            onChange={(e) => onBotChange(e.target.value)}
          >
            {botNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="custom-bot-creator">
        <h4>Create New Bot</h4>
        <input
          type="text"
          placeholder="Bot name"
          value={customBotName}
          onChange={(e) => setCustomBotName(e.target.value)}
        />
        <textarea
          value={customBotCode}
          onChange={(e) => setCustomBotCode(e.target.value)}
          placeholder={CUSTOM_BOT_PLACEHOLDER}
          rows={12}
        />
        <button onClick={handleRegisterClick}>
          Register Bot
        </button>
      </div>
    </div>
  );
};

export default BotPanel;
