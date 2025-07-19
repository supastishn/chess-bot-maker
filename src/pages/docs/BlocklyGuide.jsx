import React from 'react';
import { Wrench } from 'lucide-react';

const BlocklyGuide = () => {
  return (
    <div className="docs-section">
      <h1 className="page-title"><Wrench size={24} /> Blockly Visual Builder</h1>
      <div className="docs-card glass-card">
        <h2>All Blocks</h2>
        <p>Complete list of available blocks:</p>
        <div className="blocks-grid">
          <div className="block-category">
            <h3>Game State</h3>
            <ul className="method-summary">
              <li>get available moves</li>
              <li>get verbose moves</li>
              <li>get current turn</li>
              <li>get move count</li>
              <li>get FEN</li>
              <li>get game phase</li>
              <li>is in check</li>
              <li>is checkmate</li>
              <li>is stalemate</li>
              <li>is draw</li>
              <li>is game over</li>
            </ul>
          </div>
          <div className="block-category">
            <h3>Analysis</h3>
            <ul className="method-summary">
              <li>evaluate material</li>
              <li>get position score</li>
              <li>is attacked</li>
              <li>get threatened squares</li>
              <li>look ahead</li>
            </ul>
          </div>
          <div className="block-category">
            <h3>Decision Making</h3>
            <ul className="method-summary">
              <li>prioritize strategy</li>
              <li>get book moves</li>
              <li>play book move</li>
              <li>stockfish move</li>
              <li>return move</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlocklyGuide;
