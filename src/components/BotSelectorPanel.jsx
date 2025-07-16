import React from 'react';
import BotSelector from './BotSelector';

const BotSelectorPanel = ({ selectedBot, onBotChange, botNames, disabled = false, label = "Active Bot:" }) => (
  <BotSelector
    selectedBot={selectedBot}
    onChange={onBotChange}
    bots={botNames}
    disabled={disabled}
    label={label}
  />
);

export default BotSelectorPanel;
