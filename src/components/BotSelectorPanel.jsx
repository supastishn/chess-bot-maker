import React from 'react';

const BotSelectorPanel = ({ selectedBot, onBotChange, botNames }) => (
  <div className="bot-panel">
    <div className="bot-selector">
      <label>Active Bot:</label>
      <select value={selectedBot} onChange={(e) => onBotChange(e.target.value)}>
        {botNames.map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
    </div>
  </div>
);

export default BotSelectorPanel;
