import React from 'react';
import { Wrench } from 'lucide-react';

const BlocklyGuide = () => {
  return (
    <div className="docs-section">
      <h1 className="page-title"><Wrench size={24} /> Blockly Visual Builder</h1>
      <div className="docs-card glass-card">
        <h2>All Blocks</h2>
        <p>All available blocks are listed below, grouped by category:</p>
        <ul className="method-summary">
          <li><strong>Logic &amp; Math:</strong> Standard blocks for conditional logic (<code>if/else</code>), comparisons, numbers, and arithmetic.</li>
          <li><strong>Game State:</strong> Get information about the current game, like <code>get available moves</code>, <code>get turn</code>, <code>is checkmate</code>, <code>is stalemate</code>, and <code>get game phase</code>.</li>
          <li><strong>Analysis:</strong> Evaluate the position with blocks like <code>evaluate material</code>, <code>get position score</code>, <code>is attacked</code>, and <code>look ahead</code>.</li>
          <li><strong>Decision Making:</strong> Choose a move using <code>prioritize strategy</code>, <code>play book move</code>, or the async <code>stockfish move</code>. Use <code>return move</code> to submit your final choice.</li>
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
