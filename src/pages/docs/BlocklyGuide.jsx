import React from 'react';
import { Wrench } from 'lucide-react';

const BlocklyGuide = () => {
  return (
    <div className="docs-section">
      <h1 className="page-title"><Wrench size={24} /> Blockly Visual Builder</h1>
      <div className="docs-card glass-card">
        <h2>Visual Bot Builder Features</h2>
        <div className="blockly-diagram">
          <p>New blocks for advanced strategies:</p>
          <pre>
{`+-------------+     +------------------+
| is in check |     | get game phase   |
+-------------+     +------------------+
       ↓                     ↓
+-------------+     +------------------+
| if true →   |     | case statements  |
+-------------+     +------------------+`}
          </pre>
        </div>
        <p>Example workflow using lookahead blocks:</p>
        <div className="syntax-highlighting">
          <pre>
{`1. [For each move] → 
2. [Look ahead depth 2] → 
3. [Compare scores] → 
4. [Select highest score]`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default BlocklyGuide;
