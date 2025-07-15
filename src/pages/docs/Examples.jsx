import React from 'react';
import { Zap } from 'lucide-react';

const Examples = () => {
  return (
    <div className="docs-section">
      <h1 className="page-title"><Zap size={24} /> Bot Examples</h1>
      <div className="docs-card glass-card">
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
  );
};

export default Examples;
