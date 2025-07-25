import React from 'react';
import { Wrench } from 'lucide-react';

const blockCategories = {
  'Game State': [
    { name: 'get available moves', description: 'Returns an array of all legal moves for the current player in UCI format (e.g., "e2e4").' },
    { name: 'get verbose moves', description: 'Returns an array of detailed move objects for all legal moves.' },
    { name: 'get current turn', description: 'Returns the color of the current player (\'w\' for white, \'b\' for black).' },
    { name: 'get move count', description: 'Returns the total number of half-moves (plies) made so far.' },
    { name: 'get FEN', description: 'Returns the Forsyth-Edwards Notation (FEN) string for the current board position.' },
    { name: 'get game phase', description: 'Returns the current phase of the game: \'opening\', \'middlegame\', or \'endgame\'.' },
    { name: 'is in check', description: 'Returns true if the current player is in check, false otherwise.' },
    { name: 'is checkmate', description: 'Returns true if the current player has been checkmated, false otherwise.' },
    { name: 'is stalemate', description: 'Returns true if the game is a stalemate, false otherwise.' },
    { name: 'is draw', description: 'Returns true if the game is a draw due to threefold repetition, insufficient material, or the 50-move rule.' },
    { name: 'is game over', description: 'Returns true if the game has ended (checkmate, stalemate, draw, etc.).' },
  ],
  'Analysis': [
    { name: 'evaluate material', description: 'Calculates and returns the material balance of the board. Positive is good for white, negative is good for black.' },
    { name: 'get position score', description: 'Returns a simple evaluation of the position, combining material and center control.' },
    { name: 'is attacked', description: 'Checks if a specific square is under attack by a given color. Returns true or false.' },
    { name: 'get threatened squares', description: 'Returns an array of squares that are attacked by a specific color.' },
    { name: 'look ahead', description: 'Simulates a given move to a certain depth and returns an evaluation score for the resulting position.' },
  ],
  'Decision Making': [
    { name: 'prioritize strategy', description: 'Evaluates all available moves based on a weighted combination of strategies (material, development, etc.) and returns the best move.' },
    { name: 'get book moves', description: 'Returns an array of standard opening moves for the current position from the opening book.' },
    { name: 'play book move', description: 'Randomly selects and returns one of the available opening book moves for the current position.' },
    { name: 'stockfish move', description: 'Uses the powerful Stockfish engine to find the best move at a specified search depth. This is an asynchronous operation.' },
    { name: 'return move', description: 'The final action in your bot. Use this to return your chosen move and end the bot\'s turn.' },
  ]
};

const BlocklyGuide = () => {
  return (
    <div className="docs-section">
      <h1 className="page-title"><Wrench size={24} /> Blockly Visual Builder</h1>
      <div className="docs-card glass-card">
        <h2>All Blocks</h2>
        <p>Hover over a block name to see its definition:</p>
        <div className="blocks-grid">
          {Object.entries(blockCategories).map(([category, blocks]) => (
            <div className="block-category" key={category}>
              <h3>{category}</h3>
              <ul className="method-summary">
                {blocks.map(block => (
                  <li key={block.name} className="tooltip-container">
                    {block.name}
                    <span className="tooltip-text">{block.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlocklyGuide;
