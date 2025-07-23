import * as Blockly from 'blockly/core';

const createBlock = (name, outputType, color) => ({
  init() {
    this.appendDummyInput().appendField(name);
    this.setOutput(true, outputType);
    this.setColour(color);
  }
});

Blockly.Blocks['get_available_moves'] = createBlock('get available moves', 'Array', '#888888');
Blockly.Blocks['get_turn'] = createBlock('get current turn', 'String', '#888888');
Blockly.Blocks['evaluate_material'] = createBlock('evaluate material', 'Number', '#888888');
Blockly.Blocks['is_in_check'] = createBlock('is in check', 'Boolean', '#A65C81');
Blockly.Blocks['get_game_phase'] = createBlock('get game phase', 'String', '#A65C81');
Blockly.Blocks['is_checkmate'] = createBlock('is checkmate', 'Boolean', '#A65C81');
Blockly.Blocks['get_position_score'] = createBlock('get position score', 'Number', '#A65C81');

// Opening book blocks
Blockly.Blocks['get_book_moves'] = createBlock('get book moves', 'Array', '#5C81A6');
Blockly.Blocks['play_book_move'] = {
  init() {
    this.appendDummyInput().appendField("play book move");
    this.setOutput(true, "String");
    this.setColour('#5C81A6');
  }
};

 // Statement blocks
Blockly.Blocks['return_move'] = {
  init() {
    this.appendValueInput("MOVE").setCheck("String")
      .appendField("return move");
    this.setPreviousStatement(true);
    this.setNextStatement(false); // This is a terminal block.
    this.setColour('#5C81A6'); // Use a color that indicates a return/end action.
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

// --- New blocks for advanced API ---
Blockly.Blocks['get_verbose_moves'] = createBlock('get verbose moves', 'Array', '#888888');
Blockly.Blocks['is_stalemate'] = createBlock('is stalemate', 'Boolean', '#A65C81');
Blockly.Blocks['is_draw'] = createBlock('is draw', 'Boolean', '#A65C81');
Blockly.Blocks['is_game_over'] = createBlock('is game over', 'Boolean', '#A65C81');
Blockly.Blocks['get_fen'] = createBlock('get FEN', 'String', '#888888');
Blockly.Blocks['get_move_count'] = createBlock('get move count', 'Number', '#888888');

Blockly.Blocks['is_attacked'] = {
  init: function() {
    this.appendValueInput("SQUARE").setCheck("String").appendField("is square");
    this.appendValueInput("COLOR").setCheck("String").appendField("attacked by color");
    this.setOutput(true, "Boolean");
    this.setColour('#A65C81');
    this.setInputsInline(true);
  }
};

Blockly.Blocks['prioritize_strategy'] = {
  init: function() {
    this.appendDummyInput().appendField("get best move by strategy");
    this.appendValueInput("MATERIAL").setCheck("Number").appendField("material weight");
    this.appendValueInput("DEVELOPMENT").setCheck("Number").appendField("development weight");
    this.appendValueInput("CENTER_CONTROL").setCheck("Number").appendField("center control weight");
    this.appendValueInput("KING_SAFETY").setCheck("Number").appendField("king safety weight");
    this.setOutput(true, "String");
    this.setColour('#5C81A6');
    this.setInputsInline(false);
  }
};

Blockly.Blocks['stockfish_move'] = {
  init() {
    this.appendValueInput("DEPTH")
      .appendField("get Stockfish move at depth");
    this.setOutput(true, "String");
    this.setColour('#3388DD');
  }
};
