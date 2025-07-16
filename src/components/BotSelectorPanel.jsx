import React from 'react';
import BotSelector from './BotSelector';

const BotSelectorPanel = ({ selectedBot, onBotChange, botNames }) => (
  <div className="bot-panel glass-card">
    <BotSelector 
      selectedBot={selectedBot} 
      onChange={onBotChange} 
      bots={botNames}
    />
  </div>
);

export default BotSelectorPanel;
