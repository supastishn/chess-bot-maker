import React from 'react';
import { Bot } from 'lucide-react';

const Introduction = () => {
  return (
    <div className="docs-section">
      <h1 className="page-title"><Bot size={24} /> Bot Scripting Introduction</h1>
      
      <div className="docs-card glass-card">
        <h2>Bot Function Structure</h2>
        <p>Each bot must be a JavaScript function that takes a <code>game</code> object and returns a move:</p>
        <div className="syntax-highlighting">
          <pre>
{`function myBot(game) {
  // Bot logic here
  return 'e2e4'; // or { from: 'e2', to: 'e4' }
}`}
          </pre>
        </div>
      </div>

      <div className="docs-card glass-card">
        <h2>Persistence</h2>
        <p>Bots you create via the "Create Bot" or "Visual Bot Builder" pages are automatically saved in your browser's local storage. They will be available whenever you revisit the site from the same browser.</p>
      </div>
    </div>
  );
};

export default Introduction;
