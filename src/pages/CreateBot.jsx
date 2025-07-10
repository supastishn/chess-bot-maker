import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CUSTOM_BOT_PLACEHOLDER = `(game) => {
  /**
   * Bot API Documentation
   * 
   * Available methods on 'game' object:
   * - game.getStatus(): Get current game status
   * - game.getAvailableMoves(): Array of all legal move keys
   * - game.getBoardState(): Board square data
   * - game.getTurn(): 'w' or 'b' for current turn
   * - game.getGameResult(): Current game result ('ongoing', 'checkmate', 'stalemate', 'repetition')
   * - game.evaluateMaterial(): Material score (+ for white, - for black)
   * - game.move(moveKey): Execute a move (returns game state)
   * - game.undoMove(): Undo the last move
   * 
   * Return format: 
   * - A move key string (e.g. 'e2e4')
   * - An object { from: 'e2', to: 'e4', promotion: 'q' }
   * - null for no move
   */
  
  // Example: Material-driven bot
  const moves = game.getAvailableMoves();
  if (moves.length === 0) return null;

  let bestScore = -Infinity;
  let bestMoves = [];
  
  for (const moveKey of moves) {
    game.move(moveKey);
    const score = -game.evaluateMaterial(); // Invert for black
    game.undoMove(); // New helper method
    
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [moveKey];
    } else if (score === bestScore) {
      bestMoves.push(moveKey);
    }
  }
  
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
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
