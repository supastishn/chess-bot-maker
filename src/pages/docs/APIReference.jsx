import React from 'react';
import { Puzzle, Library } from 'lucide-react';

const APIReference = () => {
  return (
    <div className="docs-section">
      <h1 className="page-title"><Puzzle size={24} /> API Reference</h1>
      
      <div className="docs-card glass-card">
        <h2><Library size={20} /> Game Helper API v2.1</h2>
        <div className="method-list">
          <div className="method-item">
            <h3><code>getAvailableMoves(): string[]</code></h3>
            <p>Returns all legal moves in UCI format</p>
            <pre>const moves = game.getAvailableMoves();</pre>
          </div>
          <div className="method-item">
            <h3><code>lookAhead(move: string, depth: number): {"{ score: number }"}</code></h3>
            <p>Simulates a move and evaluates position up to 'depth' plies ahead</p>
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
        </div>
      </div>
      <div className="docs-card glass-card">
        <h2><Library size={20} /> Position Evaluation Formula</h2>
        <code className="formula">
          Score = Material + Center Control + King Safety
        </code>
        <div className="math-breakdown">
          <p><strong>Material:</strong> ∑(Piece values) | Center Control: 0.1 per central square</p>
          <p><strong>King Safety:</strong> Penalty for exposed king in middlegame</p>
        </div>
      </div>
    </div>
  );
};

export default APIReference;
