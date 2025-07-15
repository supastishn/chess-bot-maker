import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';  // Add this import

// Custom generators using javascriptGenerator directly
javascriptGenerator['get_available_moves'] = function() {
  return ['game.getAvailableMoves()', javascriptGenerator.ORDER_FUNCTION_CALL];
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

javascriptGenerator['look_ahead'] = function(block) {
  const move = javascriptGenerator.valueToCode(block, 'MOVE', 
    javascriptGenerator.ORDER_NONE) || "''";
  const depth = javascriptGenerator.valueToCode(block, 'DEPTH', 
    javascriptGenerator.ORDER_ATOMIC) || 2;
  return [`game.lookAhead(${move}, ${depth}).score`, javascriptGenerator.ORDER_FUNCTION_CALL];
};

javascriptGenerator['get_game_phase'] = function() {
  return ['game.getGamePhase()', javascriptGenerator.ORDER_FUNCTION_CALL];
};

// --- Stockfish Generator ---
javascriptGenerator['stockfish_move'] = function(block) {
  const depth = javascriptGenerator.valueToCode(block, 'DEPTH', 
    javascriptGenerator.ORDER_ATOMIC) || 15;
  return [`await game.stockfish.getBestMove(game.getFEN(), ${depth})`, javascriptGenerator.ORDER_FUNCTION_CALL];
};
