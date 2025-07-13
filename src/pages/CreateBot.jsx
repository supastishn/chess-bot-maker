import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CUSTOM_BOT_PLACEHOLDER = `(game) => {
  // Returns UCI string: 'e2e4' or 'e7e8q'
  const moves = game.getAvailableMoves();
  return moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)] : null;
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
      <div className="create-bot-content fade-in">
        <h1 className="page-title">Create New Bot</h1>
        <div className="bot-creator-card glass-card">
          <div className="form-group">
            <label htmlFor="bot-name">Bot Name</label>
            <input
              id="bot-name"
              type="text"
              placeholder="Enter a unique name for your bot"
              value={customBotName}
              onChange={(e) => setCustomBotName(e.target.value)}
              className="form-input mobile-optimized-input"
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
              className="form-textarea mobile-optimized-textarea"
            />
          </div>
          <button onClick={handleRegisterClick} className="btn primary-button">
            <span>⚡</span>
            Register Bot and Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBot;
