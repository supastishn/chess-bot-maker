import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';  // Add this import

// Custom generators using javascriptGenerator directly
javascriptGenerator['get_available_moves'] = function() {
  return ['game.getAvailableMoves()', javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['get_book_moves'] = function() {
  return ['game.getBookMoves()', javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['play_book_move'] = function() {
  return ['game.playBookMove()', javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['get_turn'] = function() {
  return ['game.getTurn()', javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['move_action'] = function(block) {
  const moveCode = javascriptGenerator.valueToCode(block, 'MOVE', javascriptGenerator.ORDER_NONE) || "''";
  return `game.move(${moveCode});\n`;
};

javascriptGenerator['evaluate_material'] = function() {
  return ['game.evaluateMaterial()', javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['undo_move'] = function() {
  return 'game.undoMove();\n';
};

// --- Advanced Generators ---

javascriptGenerator['is_in_check'] = function() {
  return ['game.isInCheck()', javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['is_checkmate'] = function() {
  return ['game.isCheckmate()', javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['get_position_score'] = function() {
  return ['game.getPositionScore()', javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['look_ahead'] = function(block) {
  const move = javascriptGenerator.valueToCode(block, 'MOVE', javascriptGenerator.ORDER_NONE) || "''";
  const depth = javascriptGenerator.valueToCode(block, 'DEPTH', javascriptGenerator.ORDER_ATOMIC) || 2;
  const topics = javascriptGenerator.valueToCode(block, 'TOPICS', javascriptGenerator.ORDER_NONE) || "['all']";
  return [`game.lookAhead(${move}, ${depth}, ${topics}).score`, javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['get_game_phase'] = function() {
  return ['game.getGamePhase()', javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['get_threatened_squares'] = function(block) {
  const color = javascriptGenerator.valueToCode(block, 'COLOR', javascriptGenerator.ORDER_NONE) || "'w'";
  return [`game.getThreatenedSquares(${color})`, javascriptGenerator.ORDER_FUNCTION_CALL];
};

// --- Stockfish Generator ---
javascriptGenerator['stockfish_move'] = function(block) {
  const depth = javascriptGenerator.valueToCode(block, 'DEPTH', 
    javascriptGenerator.ORDER_ATOMIC) || 15;
  return [`await game.stockfish.getBestMove(game.getFEN(), ${depth})`, javascriptGenerator.ORDER_FUNCTION_CALL];
};
