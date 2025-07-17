import React from 'react';
import { getBotNames, getBotSource, isUserBot } from '../bot/botInterface';

const BotLibrary = ({ onEdit, onDelete }) => {
  const botNames = getBotNames().filter(name => !name.startsWith('__temp'));
  const [selectedBot, setSelectedBot] = React.useState(botNames[0] ?? '');

  const isEditable = selectedBot && isUserBot(selectedBot);

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

      {onEdit && onDelete && isEditable && (
        <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
          <button onClick={() => onEdit(selectedBot)} className="btn">
            Edit
          </button>
          <button onClick={() => onDelete(selectedBot)} className="btn reset-button">
            Delete
          </button>
        </div>
      )}

      {selectedBot && (
        <div className="bot-code-viewer" style={{ marginTop: isEditable ? '1rem' : '0' }}>
          <pre className="form-textarea">
            {getBotSource(selectedBot)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default BotLibrary;
