import React from 'react';
import { Puzzle, Library, Bot } from 'lucide-react';

const APIReference = () => {
  return (
    <div className="docs-section">
      <h1 className="page-title"><Puzzle size={24} /> API Reference</h1>
      
      <div className="docs-card glass-card">
        <h2><Library size={20} /> Core Actions</h2>
        <div className="method-list">
          <div className="method-item">
            <h3><code>move(uci: string): object|null</code></h3>
            <p>Applies a move to the board. Returns move object on success.</p>
            <pre>game.move('e2e4');</pre>
          </div>
          <div className="method-item">
            <h3><code>undoMove(): object|null</code></h3>
            <p>Takes back the last move. Returns the undone move object.</p>
            <pre>game.undoMove();</pre>
          </div>
        </div>
      </div>
      
      <div className="docs-card glass-card">
        <h2><Library size={20} /> Game State & Queries</h2>
        <div className="method-list">
          <div className="method-item">
            <h3><code>getAvailableMoves(): string[]</code></h3>
            <p>Returns all legal moves for the current player in UCI format.</p>
            <pre>const moves = game.getAvailableMoves();</pre>
          </div>
          <div className="method-item">
            <h3><code>getVerboseMoves(): object[]</code></h3>
            <p>Returns all legal moves as detailed objects.</p>
            <pre>const verboseMoves = game.getVerboseMoves();</pre>
          </div>
          <div className="method-item">
            <h3><code>evaluateMaterial(): number</code></h3>
            <p>Returns the board's material balance. Positive for white, negative for black.</p>
            <pre>const material = game.evaluateMaterial();</pre>
          </div>
          <div className="method-item">
            <h3><code>getGameResult(): string</code></h3>
            <p>Returns the game status: 'checkmate', 'stalemate', 'repetition', or 'ongoing'.</p>
            <pre>if (game.getGameResult() === 'checkmate') ...</pre>
          </div>
          <div className="method-item">
            <h3><code>isInCheck(): boolean</code></h3>
            <p>Returns true if the current player is in check.</p>
            <pre>if (game.isInCheck()) ...</pre>
          </div>
          <div className="method-item">
            <h3><code>isCheckmate(): boolean</code></h3>
            <p>Returns true if the current player is in checkmate.</p>
            <pre>if (game.isCheckmate()) { /* resign */ }</pre>
          </div>
          <div className="method-item">
            <h3><code>isAttacked(square: string, byColor: 'w'|'b'): boolean</code></h3>
            <p>Returns true if the given square is attacked by the specified color.</p>
            <pre>const isAttacked = game.isAttacked('e4', 'b');</pre>
          </div>
          <div className="method-item">
            <h3><code>getThreatenedSquares(opponentColor: 'w' | 'b'): string[]</code></h3>
            <p>Returns all squares attacked by the current player. Note: you must pass the opponent's color.</p>
            <pre>{`const opponent = game.getTurn() === 'w' ? 'b' : 'w';\nconst attacks = game.getThreatenedSquares(opponent);`}</pre>
          </div>
          <div className="method-item">
            <h3><code>getMoveCount(): number</code></h3>
            <p>Returns the number of half-moves (plies) made in the game.</p>
            <pre>const ply = game.getMoveCount();</pre>
          </div>
          <div className="method-item">
            <h3><code>getPositionScore(): number</code></h3>
            <p>Returns a score for the current position (material + center control).</p>
            <pre>const score = game.getPositionScore();</pre>
          </div>
          <div className="method-item">
            <h3><code>getGamePhase(): 'opening' | 'middlegame' | 'endgame'</code></h3>
            <pre>if (game.getGamePhase() === 'endgame') {/* King activation logic */}</pre>
          </div>
          <div className="method-item">
            <h3><code>lookAhead(move: string, depth: number): {"{ score: number }"}</code></h3>
            <p>Simulates a move and evaluates position up to 'depth' plies ahead.</p>
            <pre>const score = game.lookAhead('e2e4', 3).score;</pre>
          </div>

          {/* New methods */}
          <div className="method-item">
            <h3><code>getBoardState(): Square[]</code></h3>
            <p>Returns 64-square board representation with file, rank and piece details.</p>
            <pre>{`const board = game.getBoardState();
// Example output:
// [ { file: 'a', rank: 1, piece: { type: 'rook', side: 'w' } }, ... ]`}</pre>
          </div>
          <div className="method-item">
            <h3><code>getFEN(): string</code></h3>
            <p>Returns current position in Forsyth-Edwards Notation.</p>
            <pre>const fen = game.getFEN();</pre>
          </div>
          <div className="method-item">
            <h3><code>getPositionAfterMove(move: string): PositionData</code></h3>
            <p>Simulates a move and returns resulting board state without altering game state.</p>
            <pre>{`const pos = game.getPositionAfterMove('e2e4');
// Returns { piecePosition: 'e4', allPositions: [...] }`}</pre>
          </div>
        </div>
      </div>

      <div className="docs-card glass-card">
        <h2><Library size={20} /> Strategic Decision Making</h2>
        <div className="method-list">
          <div className="method-item">
            <h3><code>prioritizeStrategy(weights: object, depth?: number): string</code></h3>
            <p>Evaluates moves using weighted strategic priorities. Returns the best move in UCI format.</p>
            
            <h4>Weight Parameters:</h4>
            <ul className="method-summary">
              <li><strong>material</strong> (0-1) - Focus on piece values and captures</li>
              <li><strong>development</strong> (0-1) - Prioritize piece mobilization</li>
              <li><strong>centerControl</strong> (0-1) - Value central square occupation</li>
              <li><strong>kingSafety</strong> (0-1) - Minimize king vulnerability</li>
            </ul>

            <h4>Example Usage:</h4>
            <div className="syntax-highlighting">
              <pre>
{`// Positional player bot
const move = game.prioritizeStrategy({
  centerControl: 0.8,
  development: 0.7,
  kingSafety: 0.4,
  material: 0.3
});

// Aggressive attacker bot  
game.prioritizeStrategy({
  material: 0.9,
  kingSafety: 0.1,
  centerControl: 0.5
}, 3); // Deeper lookahead`}
              </pre>
            </div>

            <h4>Default Weights (if unspecified):</h4>
            <pre>{`{
  material: 0.6,
  development: 0.4,
  centerControl: 0.5, 
  kingSafety: 0.4
}`}</pre>
          </div>
        </div>
      </div>
      
       <div className="docs-card glass-card">
        <h2><Library size={20} /> Opening Book</h2>
        <div className="method-list">
          <div className="method-item">
            <h3><code>getBookMoves(): string[]</code></h3>
            <p>Returns opening book moves for current position.</p>
            <pre>const bookMoves = game.getBookMoves();</pre>
          </div>
          <div className="method-item">
            <h3><code>playBookMove(): string|null</code></h3>
            <p>Plays a random move from opening book if available.</p>
            <pre>const move = game.playBookMove();</pre>
          </div>
        </div>
      </div>

      <div className="docs-card glass-card">
        <h2><Bot size={20} /> Stockfish API</h2>
        <div className="method-list">
          <div className="method-item">
            <h3><code>await stockfish.getBestMove(fen, depth): string</code></h3>
            <p>Asynchronously gets the best move from the Stockfish engine.</p>
            <pre>const bestMove = await game.stockfish.getBestMove(game.getFEN(), 15);</pre>
          </div>
          <div className="method-item">
            <h3><code>setSkillLevel(level: number)</code></h3>
            <p>Sets Stockfish's skill level (0-20). Lower values induce more errors.</p>
            <pre>game.setSkillLevel(10);</pre>
          </div>
          <div className="method-item">
            <h3><code>await getPositionEvaluation(fen): object</code></h3>
            <p>Asynchronously gets a detailed evaluation from Stockfish.</p>
            <pre>const eval = await game.getPositionEvaluation();</pre>
          </div>

          {/* New Stockfish methods */}
          <div className="method-item">
            <h3><code>setHashSize(size: number)</code></h3>
            <p>Configures memory allocation for engine in MB. Higher values enable deeper analysis.</p>
            <pre>game.setHashSize(512); // 512 MB allocation</pre>
          </div>
          <div className="method-item">
            <h3><code>setContempt(value: number)</code></h3>
            <p>Adjusts behavioral bias (range: -100 to 100). Positive values encourage aggression.</p>
            <pre>game.setContempt(24); // More aggressive play</pre>
          </div>
          <div className="method-item">
            <h3><code>await getPositionEvaluation(fen): object</code></h3>
            <p>Asynchronously gets a detailed evaluation from Stockfish.</p>
            <pre>const eval = await game.getPositionEvaluation();</pre>
          </div>
          <div className="method-item">
            <h3><code>await benchmark(depth: number): object</code></h3>
            <p>Runs engine performance diagnostics at specified depth.</p>
            <pre>const stats = await game.benchmark(16);</pre>
          </div>
        </div>
      </div>

    </div>
  );
};

export default APIReference;
