import React from 'react';
import { Wrench } from 'lucide-react';

const BlocklyGuide = () => {
  return (
    <div className="docs-section">
      <h1 className="page-title"><Wrench size={24} /> Blockly Visual Builder</h1>
      <div className="docs-card glass-card">
        <h2>New Advanced Blocks</h2>
        <p>We've added several new blocks to give your bots more strategic capabilities:</p>
        <ul className="method-summary">
          <li><strong>is checkmate:</strong> A boolean block that returns true if the game is over by checkmate.</li>
          <li><strong>get position score:</strong> Returns a numerical score of the board, considering material and center control. Useful for direct comparisons.</li>
          <li><strong>get threatened squares:</strong> Takes a color ('w' or 'b') and returns an array of squares under attack by that color.</li>
          <li><strong>look ahead:</strong> Simulates a move and returns a score, allowing your bot to think multiple steps into the future.</li>
        </ul>
        
        <h2>Example: A Smarter Bot</h2>
        <p>Here's how you might combine these blocks to create a bot that avoids simple blunders:</p>
        <div className="syntax-highlighting">
          <pre>
{`1. Get a list of all [available moves].
2. For each move in the list:
   a. Use the [look ahead] block to get a score for the resulting position.
3. Keep track of the move with the highest score.
4. After checking all moves, play the best move found.`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default BlocklyGuide;
