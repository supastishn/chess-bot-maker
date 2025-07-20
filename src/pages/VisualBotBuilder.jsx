import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, HashRouter } from 'react-router-dom';
import BlocklyComponent from '../components/BlocklyComponent';
import { getBotBlocklyXml } from '../bot/botInterface';

const VisualBotBuilder = ({ onRegisterBot }) => {
  const [botName, setBotName] = useState('');
  const [code, setCode] = useState('');
  const [xml, setXml] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const workspaceRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.botName) {
      const name = location.state.botName;
      const blocklyXml = getBotBlocklyXml(name);
      if (blocklyXml) {
        setBotName(name);
        setXml(blocklyXml);
        setIsEditing(true);
      }
    }
  }, [location.state]);

  const handleGenerate = () => {
    const js = workspaceRef.current.workspaceToCode();
    const newXml = workspaceRef.current.workspaceToXml();
    setCode(js);
    setXml(newXml);
  };

  const handleRegister = () => {
    const wrapped = `(game) => {\n${code}\n}`;
    if (onRegisterBot(botName, wrapped, wrapped, xml)) {
      navigate('/create-bot');
    }
  };

  return (
    <div className="page-container">
      <div className="create-bot-content">
        <h1 className="page-title">{isEditing ? 'Edit Visual Bot' : 'Visual Bot Builder'}</h1>
        <input
          type="text"
          placeholder="Bot name"
          value={botName}
          onChange={e => setBotName(e.target.value)}
          className="form-input"
          disabled={isEditing}
        />
        
        {code ? (
          // Show ONLY generated code and action buttons
          <>
            <textarea
              className="form-textarea"
              readOnly
              rows={10}
              value={code}
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={handleRegister} className="btn primary-button">
                {isEditing ? 'Update Bot' : 'Register Bot'}
              </button>
              <button 
                onClick={() => setCode('')}
                className="btn reset-button"
              >
                Return to Editor
              </button>
            </div>
          </>
        ) : (
          // Show ONLY Blockly and Generate button
          <>
            <BlocklyComponent ref={workspaceRef} initialXml={xml} />
            <button onClick={handleGenerate} className="btn primary-button" style={{ marginTop: '1rem' }}>
              Generate Code
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default function VisualBotBuilderWithRouter(props) {
  return (
    <HashRouter>
      <VisualBotBuilder {...props} />
    </HashRouter>
  );
}
