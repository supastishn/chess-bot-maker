import React from 'react';
import { Bot, Puzzle, Library } from 'lucide-react';

const DocsPage = () => {
  return (
    <div className="page-container">
      <div className="docs-content">
        <h1 className="page-title">Bot Scripting API Documentation</h1>
        
        <div className="docs-grid">
          <div className="docs-card glass-card">
            <h2><Bot size={24} /> Bot Function Structure</h2>
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
            <h2><Puzzle size={24} /> Game Helper API v2.1</h2>
            <div className="method-list">
              
              {/* Core API Methods */}
              <div className="method-item">
                <h3><code>getAvailableMoves(): string[]</code></h3>
                <p>Returns all legal moves in UCI format</p>
                <pre>const moves = game.getAvailableMoves();</pre>
              </div>

              {/* Advanced API Methods */}
              <div className="method-item">
                <h3><code>lookAhead(move: string, depth: number): {"{ score: number }"}</code></h3>
                <p>Simulates a move and evaluates position {depth} plies ahead</p>
                <pre>const score = game.lookAhead('e2e4', 3).score;</pre>
              </div>

              <div className="method-item">
                <h3><code>getGamePhase(): 'opening' | 'middlegame' | 'endgame'</code></h3>
                <pre>if (game.getGamePhase() === 'endgame') {/* King activation logic */}</pre>
              </div>

              <div className="method-item">
                <h3><code>getThreatenedSquares(color: 'w' | 'b'): string[]</code></h3>
                <pre>const threats = game.getThreatenedSquares(game.getTurn());</pre>
              </div>

              {/* Blockly Integration Section */}
              <div className="method-item">
                <h3><Zap size={18} /> New Blockly Features</h3>
                <ul className="blockly-features">
                  <li><code>is in check</code> - Boolean check detection</li>
                  <li><code>look ahead for move</code> - Move scoring with depth</li>
                  <li><code>get game phase</code> - Phase detection block</li>
                  <li><code>get threatened squares</code> - Positional analysis</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="docs-card glass-card">
            <h2><Library size={24} /> Bot Examples</h2>
            
            <div className="example-card">
              <h3>Advanced Positional Bot</h3>
              <div className="syntax-highlighting">
                <pre>
{`function advancedBot(game) {
  const phase = game.getGamePhase();
  const moves = game.getAvailableMoves();
  
  // Use different logic per game phase
  if (phase === 'opening') {
    return prioritizeCenterControl(game, moves);
  }
  
  // Evaluate moves with 3-ply lookahead
  return moves.reduce((best, move) => {
    const result = game.lookAhead(move, 3);
    return result.score > best.score ? {move, score: result.score} : best;
  }, {score: -Infinity}).move;
}`}
                </pre>
              </div>
            </div>
            
            <div className="example-card">
              <h3>Threat-Aware Bot</h3>
              <div className="syntax-highlighting">
                <pre>
{`function threatAwareBot(game) {
  const safeMoves = game.getAvailableMoves()
    .filter(move => {
      // Check if move escapes threats
      game.move(move);
      const inDanger = game.getThreatenedSquares(game.getTurn())
        .includes(move.to);
      game.undoMove();
      return !inDanger;
    });
    
  return safeMoves.length > 0 
    ? safeMoves[Math.floor(Math.random() * safeMoves.length)]
    : null; // Resign if no safe moves
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Bot Builder Section */}
        <div className="docs-card glass-card">
          <h2><Wrench size={24} /> Visual Bot Builder Features</h2>
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

        {/* Position Scoring Formula Section */}
        <div className="docs-card glass-card">
          <h2><Library size={24} /> Position Evaluation Formula</h2>
          <code className="formula">
            Score = Material + Center Control + King Safety
          </code>
          <div className="math-breakdown">
            <p><strong>Material:</strong> ∑(Piece values) | Center Control: 0.1 per central square</p>
            <p><strong>King Safety:</strong> Penalty for exposed king in middlegame</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
