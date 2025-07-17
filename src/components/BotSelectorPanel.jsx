import React from 'react';
import BotSelector from './BotSelector';

const BotSelectorPanel = ({ selectedBot, onBotChange, botNames, disabled = false, labelText = "Active Bot:" }) => (
  <BotSelector
    selectedBot={selectedBot}
    onChange={onBotChange}
    bots={botNames}
    disabled={disabled}
    label={labelText}
  />
);

export default BotSelectorPanel;
