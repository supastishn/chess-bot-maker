import React from 'react';
import { getBotNames, getBotSource } from '../bot/botInterface';

const BotLibrary = () => {
  const botNames = getBotNames().filter(name =>
    !name.startsWith('__temp')
  );
  const [selectedBot, setSelectedBot] = React.useState(botNames[0]);

  return (
    <div className="bot-library glass-card">
      <h3>Bot Library</h3>
      <div className="bot-selector">
        <label>Select Bot:</label>
        <select
          value={selectedBot}
          onChange={e => setSelectedBot(e.target.value)}
        >
          {botNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {selectedBot && (
        <div className="bot-code-viewer">
          <pre className="form-textarea">
            {getBotSource(selectedBot)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default BotLibrary;
