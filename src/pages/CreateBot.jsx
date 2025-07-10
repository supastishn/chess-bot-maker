import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const CreateBot = ({ onRegisterBot }) => {
  const [customBotName, setCustomBotName] = useState('');
  const [customBotCode, setCustomBotCode] = useState('');
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    if (!customBotName || !customBotCode) {
      alert('Please provide a name and code for the bot.');
      return;
    }
    const success = onRegisterBot(customBotName, customBotCode);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="page-container">
      <div className="create-bot-content">
        <h1 className="page-title">Create New Bot</h1>
        <div className="bot-creator-card">
          <div className="form-group">
            <label htmlFor="bot-name">Bot Name</label>
            <input
              id="bot-name"
              type="text"
              placeholder="Enter a unique name for your bot"
              value={customBotName}
              onChange={(e) => setCustomBotName(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="bot-code">Bot Code</label>
            <textarea
              id="bot-code"
              value={customBotCode}
              onChange={(e) => setCustomBotCode(e.target.value)}
              placeholder={CUSTOM_BOT_PLACEHOLDER}
              rows={18}
              className="form-textarea"
            />
          </div>
          <button onClick={handleRegisterClick} className="primary-button">
            <span>⚡</span>
            Register Bot and Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBot;
