import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import useBotTester from '../hooks/useBotTester.js';
import BotPerformanceWidget from '../components/BotPerformanceWidget';
import BotLibrary from '../components/BotLibrary';
import { getBotSource, getBotType, getBotElo } from '../bot/botInterface';

const CUSTOM_BOT_PLACEHOLDER = `(game) => {
  // Returns UCI string: 'e2e4' or 'e7e8q'
  const moves = game.getAvailableMoves();
  return moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)] : null;
}`;

const CreateBot = ({ onRegisterBot, onDeleteBot }) => {
  const [customBotName, setCustomBotName] = useState('');
  const [customBotCode, setCustomBotCode] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const { runBotTests } = useBotTester();
  const navigate = useNavigate();
  const [showLibrary, setShowLibrary] = useState(false);

  const handleEditBot = (botName) => {
    const type = getBotType(botName);
    if (type === 'blockly') {
      navigate('/visual-bot-builder', { state: { botName } });
    } else {
      const source = getBotSource(botName);
      setCustomBotName(botName);
      setCustomBotCode(source);
      setShowLibrary(false);
    }
  };

  const handleDeleteBot = (botName) => {
    if (window.confirm(`Are you sure you want to delete "${botName}"?`)) {
      if (onDeleteBot(botName)) {
        if (customBotName === botName) {
          setCustomBotName('');
          setCustomBotCode('');
        }
      }
    }
  };

  const handleRegisterClick = () => {
    if (!customBotName || !customBotCode) {
      alert('Please provide a name and code for the bot.');
      return;
    }
    const existingElo = getBotElo(customBotName);
    const success = onRegisterBot(
      customBotName,
      customBotCode,
      customBotCode,
      null,
      testResults?.rating || existingElo
    );
    if (success) {
      navigate('/');
    }
  };

  const testBot = async () => {
    setIsTesting(true);
    const results = await runBotTests(customBotName, customBotCode);
    setTestResults(results);
    setIsTesting(false);
  };

  const isLibraryTab = showLibrary === true;

  return (
    <div className="page-container">
      <div className="create-bot-content fade-in">
        <div className="tabs">
          {['Create New Bot', 'Bot Library'].map((tab, index) => (
            <button 
              key={tab}
              className={`btn ${isLibraryTab === !!index ? 'primary-button' : ''}`}
              onClick={() => setShowLibrary(!!index)}
            >
              {tab}
            </button>
          ))}
        </div>
        {isLibraryTab ? (
          <BotLibrary onEdit={handleEditBot} onDelete={handleDeleteBot} />
        ) : (
          <>
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
              <div className="bot-performance-container">
                <BotPerformanceWidget results={testResults} isTesting={isTesting} />
              </div>
              <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={testBot}
                        className="btn test-button"
                        disabled={isTesting || !customBotName || !customBotCode}>
                  <Zap size={20} />
                  {isTesting ? 'Testing...' : 'Test Performance'}
                </button>
                <button onClick={handleRegisterClick} className="btn primary-button">
                  <Zap size={20} />
                  Register Bot and Play
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateBot;
