import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';

// Centralized core block generators
const coreGenerators = {
  'get_available_moves': `game.getAvailableMoves()`,
  'get_verbose_moves': `game.getVerboseMoves()`,
  'get_turn': `game.getTurn()`,
  'evaluate_material': `game.evaluateMaterial()`,
  'get_book_moves': `game.getBookMoves()`,
  'play_book_move': `game.playBookMove()`,
  'get_game_phase': `game.getGamePhase()`,
  'is_in_check': `game.isInCheck()`,
  'is_checkmate': `game.isCheckmate()`,
  'is_stalemate': `game.isStalemate()`,
  'is_draw': `game.isDraw()`,
  'is_game_over': `game.isGameOver()`,
  'get_fen': `game.getFEN()`,
  'get_move_count': `game.getMoveCount()`,
  'get_position_score': `game.getPositionScore()`
};

Object.entries(coreGenerators).forEach(([block, code]) => {
  javascriptGenerator[block] = () => [code, javascriptGenerator.ORDER_FUNCTION_CALL];
});

// Statement block for returning a move
javascriptGenerator['return_move'] = function(block) {
  const moveCode = javascriptGenerator.valueToCode(block, 'MOVE', javascriptGenerator.ORDER_NONE) || 'null';
  return `return ${moveCode};\n`;
};

// Advanced generators
javascriptGenerator['look_ahead'] = function(block) {
  const move = javascriptGenerator.valueToCode(block, 'MOVE', javascriptGenerator.ORDER_NONE) || "''";
  const depth = javascriptGenerator.valueToCode(block, 'DEPTH', javascriptGenerator.ORDER_ATOMIC) || 2;
  // topics parameter removed for compatibility
  return [`game.lookAhead(${move}, ${depth}).score`, javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['get_threatened_squares'] = function(block) {
  const color = javascriptGenerator.valueToCode(block, 'COLOR', javascriptGenerator.ORDER_NONE) || "'w'";
  return [`game.getThreatenedSquares(${color})`, javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['is_attacked'] = function(block) {
  const square = javascriptGenerator.valueToCode(block, 'SQUARE', javascriptGenerator.ORDER_NONE) || "''";
  const color = javascriptGenerator.valueToCode(block, 'COLOR', javascriptGenerator.ORDER_NONE) || "'w'";
  return [`game.isAttacked(${square}, ${color})`, javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['prioritize_strategy'] = function(block) {
  const material = javascriptGenerator.valueToCode(block, 'MATERIAL', javascriptGenerator.ORDER_ATOMIC) || null;
  const development = javascriptGenerator.valueToCode(block, 'DEVELOPMENT', javascriptGenerator.ORDER_ATOMIC) || null;
  const centerControl = javascriptGenerator.valueToCode(block, 'CENTER_CONTROL', javascriptGenerator.ORDER_ATOMIC) || null;
  const kingSafety = javascriptGenerator.valueToCode(block, 'KING_SAFETY', javascriptGenerator.ORDER_ATOMIC) || null;
  const weights = `{
    material: ${material},
    development: ${development},
    centerControl: ${centerControl},
    kingSafety: ${kingSafety}
  }`;
  return [`game.prioritizeStrategy(${weights})`, javascriptGenerator.ORDER_FUNCTION_CALL];
};

// Stockfish generator
javascriptGenerator['stockfish_move'] = function(block) {
  const depth = javascriptGenerator.valueToCode(block, 'DEPTH', javascriptGenerator.ORDER_ATOMIC) || 15;
  return [`await game.stockfish().getBestMove(game.getFEN(), ${depth})`, javascriptGenerator.ORDER_FUNCTION_CALL];
};
