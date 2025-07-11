import React from 'react';

const DocsPage = () => {
  return (
    <div className="page-container">
      <div className="docs-content">
        <h1 className="page-title">Bot Scripting API Documentation</h1>
        
        <div className="docs-card">
          <h2>Bot Function Structure</h2>
          <p>Each bot must be a JavaScript function that takes a <code>game</code> object and returns a move:</p>
          <pre className="syntax-highlighting">
            {`function myBot(game) {
  // Your logic here
  return move; // String like 'e2e4' or object {from, to, promotion}
}`}
          </pre>

          <h2>Core Methods</h2>
          <div className="method-list">
            <div className="method-card">
              <h3>getAvailableMoves()</h3>
              <p>Returns array of legal moves in UCI format.</p>
              <pre>game.getAvailableMoves() // → ['e2e4', 'g1f3', ...]</pre>
            </div>

            <div className="method-card">
              <h3>getBoardState()</h3>
              <p>Returns 2D array of board squares with piece information.</p>
              <pre>{`[
  { file: 'a', rank: 1, piece: { type: 'r', side: 'black' } },
  // ...
]`}</pre>
            </div>

            <div className="method-card">
              <h3>evaluateMaterial()</h3>
              <p>Returns numerical material advantage (positive = white advantage).</p>
              <pre>game.evaluateMaterial() // → 2</pre>
            </div>
          </div>

          <h2>Game State Methods</h2>
          <ul className="method-summary">
            <li><code>getTurn()</code> - Returns 'w' or 'b'</li>
            <li><code>getGameResult()</code> - Returns 'checkmate', 'stalemate', etc.</li>
            <li><code>undoMove()</code> - Reverts last move</li>
          </ul>

          <h2>Move Execution</h2>
          <pre className="syntax-highlighting">
            {`// Test a move
game.move('e2e4');
const score = game.evaluateMaterial();
game.undoMove();`}
          </pre>

          <h2>Example Bot</h2>
          <pre className="syntax-highlighting">
            {`function materialBot(game) {
  const moves = game.getAvailableMoves();
  let bestScore = -Infinity;
  let bestMoves = [];
  
  for (const move of moves) {
    game.move(move);
    const score = game.evaluateMaterial();
    game.undoMove();
    
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
