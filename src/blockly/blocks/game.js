import * as Blockly from 'blockly/core';

const createBlock = (name, outputType, color) => ({
  init() {
    this.appendDummyInput().appendField(name);
    this.setOutput(true, outputType);
    this.setColour(color);
  }
});

Blockly.Blocks['get_available_moves'] = createBlock('getAvailableMoves', 'Array', '#888888');
Blockly.Blocks['get_turn'] = createBlock('getTurn', 'String', '#888888');
Blockly.Blocks['evaluate_material'] = createBlock('evaluateMaterial', 'Number', '#888888');
Blockly.Blocks['is_in_check'] = createBlock('isInCheck', 'Boolean', '#A65C81');
Blockly.Blocks['get_game_phase'] = createBlock('get game phase', 'String', '#A65C81');
Blockly.Blocks['is_checkmate'] = createBlock('isCheckmate', 'Boolean', '#A65C81');
Blockly.Blocks['get_position_score'] = createBlock('getPositionScore', 'Number', '#A65C81');

// Opening book blocks
Blockly.Blocks['get_book_moves'] = createBlock('getBookMoves', 'Array', '#5C81A6');
Blockly.Blocks['play_book_move'] = {
  init() {
    this.appendDummyInput().appendField("playBookMove");
    this.setOutput(true, "String");
    this.setColour('#5C81A6');
  }
};

// Statement blocks
Blockly.Blocks['move_action'] = {
  init() {
    this.appendValueInput("MOVE").setCheck("String")
      .appendField("move");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#888888');
  }
};

Blockly.Blocks['undo_move'] = {
  init() {
    this.appendDummyInput().appendField("undoMove");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#888888');
  }
};

Blockly.Blocks['look_ahead'] = {
  init() {
    this.appendValueInput("MOVE")
      .appendField("look ahead for move");
    this.appendValueInput("DEPTH")
      .appendField("depth");
    this.setOutput(true, "Number");
    this.setColour('#A65C81');
  }
};

Blockly.Blocks['get_threatened_squares'] = {
  init: function() {
    this.appendValueInput("COLOR")
      .setCheck("String")
      .appendField("get threatened squares by");
    this.setOutput(true, "Array");
    this.setColour('#A65C81');
  }
};

Blockly.Blocks['stockfish_move'] = {
  init() {
    this.appendValueInput("DEPTH")
      .appendField("get Stockfish move depth");
    this.setOutput(true, "Object");
    this.setColour('#3388DD');
  }
};
