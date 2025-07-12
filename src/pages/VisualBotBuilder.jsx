import React, { useState, useRef } from 'react';
import BlocklyComponent from '../components/BlocklyComponent';

const VisualBotBuilder = ({ onRegisterBot }) => {
  const [botName, setBotName] = useState('');
  const [code, setCode] = useState('');
  const workspaceRef = useRef(null);

  const handleGenerate = () => {
    const js = workspaceRef.current.workspaceToCode();
    setCode(js);
  };

  const handleRegister = () => {
    const wrapped = `(game) => {\n${code}\n}`;
    if (onRegisterBot(botName, wrapped)) {
      // clear name/code if desired
      setBotName('');
      setCode('');
    }
  };

  return (
    <div className="page-container">
      <div className="create-bot-content">
        <h1 className="page-title">Visual Bot Builder</h1>
        <input
          type="text"
          placeholder="Bot name"
          value={botName}
          onChange={e => setBotName(e.target.value)}
          className="form-input"
        />
        <BlocklyComponent ref={workspaceRef} />
        <button onClick={handleGenerate} className="btn primary-button">
          Generate Code
        </button>
        {code && (
          <>
            <textarea
              className="form-textarea"
              readOnly
              rows={10}
              value={code}
            />
            <button onClick={handleRegister} className="btn primary-button">
              Register Bot
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VisualBotBuilder;
