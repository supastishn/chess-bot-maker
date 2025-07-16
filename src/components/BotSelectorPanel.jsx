import React from 'react';
import BotSelector from './BotSelector';

const BotSelectorPanel = ({ selectedBot, onBotChange, botNames, disabled = false, label = "Active Bot:" }) => (
  <div className="bot-panel glass-card">
    <BotSelector 
      selectedBot={selectedBot} 
      onChange={onBotChange} 
      bots={botNames}
      disabled={disabled}
      label={label}
    />
  </div>
);

export default BotSelectorPanel;
