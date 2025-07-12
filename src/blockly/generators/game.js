import * as Blockly from 'blockly/core';
import 'blockly/javascript';

Blockly.JavaScript['get_available_moves'] = function() {
  return ['game.getAvailableMoves()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['get_turn'] = function() {
  return ['game.getTurn()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['move_action'] = function(block) {
  const moveCode = Blockly.JavaScript.valueToCode(block, 'MOVE', Blockly.JavaScript.ORDER_NONE) || "''";
  return `game.move(${moveCode});\n`;
};

Blockly.JavaScript['evaluate_material'] = function() {
  return ['game.evaluateMaterial()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['undo_move'] = function() {
  return 'game.undoMove();\n';
};
