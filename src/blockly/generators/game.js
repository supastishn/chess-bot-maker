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
