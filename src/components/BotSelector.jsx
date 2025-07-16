import React from 'react';

const BotSelector = ({ selectedBot, onChange, bots, label = "Active Bot:", disabled = false }) => (
  <div className="bot-selector">
    <label>{label}</label>
    <select
      value={selectedBot}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
    >
      {bots.map(name => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>
  </div>
);

export default BotSelector;
