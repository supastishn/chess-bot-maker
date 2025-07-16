import React, { useEffect } from 'react';
import { getBotNames, getBotSource } from '../../bot/botInterface';

const BotLibrary = () => {
  const botNames = getBotNames().filter(name => !name.startsWith('__temp'));
  const [selectedBot, setSelectedBot] = React.useState(botNames[0]);

  useEffect(() => {
    if (botNames.length > 0 && !selectedBot) {
      setSelectedBot(botNames[0]);
    }
  }, [botNames, selectedBot]);

  return (
    <div className="docs-section">
      <h1 className="page-title">🤖 Bot Library</h1>
      <div className="docs-card glass-card">
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
            <pre className="form-textarea" style={{ minHeight: '400px' }}>
              {getBotSource(selectedBot)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotLibrary;
