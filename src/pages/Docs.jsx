import React from 'react';

const DocsPage = () => {
  return (
    <div className="page-container">
      <div className="docs-content">
        <h1 className="page-title">Bot Scripting API Documentation</h1>
        
        <div className="docs-grid">
          <div className="docs-card glass-card">
            <h2>🤖 Bot Function Structure</h2>
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
            <h2>🧩 Game Helper API</h2>
            <div className="method-list">
              <div className="method-item">
                <h3><code>getAvailableMoves()</code></h3>
                <p>Returns array of legal moves in UCI format</p>
                <pre>const moves = game.getAvailableMoves();</pre>
              </div>
              
              <div className="method-item">
                <h3><code>getBoardState()</code></h3>
                <p>Returns 2D board array with piece positions</p>
                <pre>{`const board = game.getBoardState();`}</pre>
              </div>
              
              <div className="method-item">
                <h3><code>evaluateMaterial()</code></h3>
                <p>Calculates material advantage (+ for white)</p>
                <pre>const score = game.evaluateMaterial();</pre>
              </div>
            </div>
          </div>
          
          <div className="docs-card glass-card">
            <h2>📚 Bot Examples</h2>
            
            <div className="example-card">
              <h3>Simple Material-Based Bot</h3>
              <div className="syntax-highlighting">
                <pre>
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
            
            <div className="example-card">
              <h3>Risk-Avoiding Bot</h3>
              <div className="syntax-highlighting">
                <pre>
{`function safeBot(game) {
  const moves = game.getAvailableMoves();
  const safeMoves = [];

  for (const move of moves) {
    game.move(move);
    
    // Skip moves that leave us in check
    if (!game.getGameResult().includes('check')) {
      safeMoves.push(move);
    }
    
    game.undoMove();
  }
  
  return safeMoves.length > 0
    ? safeMoves[Math.floor(Math.random() * safeMoves.length)]
    : moves[Math.floor(Math.random() * moves.length)];
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
