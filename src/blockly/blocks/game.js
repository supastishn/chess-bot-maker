import * as Blockly from 'blockly/core';

Blockly.Blocks['get_available_moves'] = {
  init() {
    this.appendDummyInput().appendField("getAvailableMoves");
    this.setOutput(true, "Array");
    this.setColour('#888888');
  }
};

Blockly.Blocks['get_turn'] = {
  init() {
    this.appendDummyInput().appendField("getTurn");
    this.setOutput(true, "String");
    this.setColour('#888888');
  }
};

Blockly.Blocks['move_action'] = {
  init() {
    this.appendValueInput("MOVE").setCheck("String")
        .appendField("move");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#888888');
  }
};

Blockly.Blocks['evaluate_material'] = {
  init() {
    this.appendDummyInput().appendField("evaluateMaterial");
    this.setOutput(true, "Number");
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

// --- Advanced Blocks ---

Blockly.Blocks['is_in_check'] = {
  init() {
    this.appendDummyInput()
        .appendField("is in check");
    this.setOutput(true, "Boolean");
    this.setColour('#A65C81');
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

Blockly.Blocks['get_game_phase'] = {
  init() {
    this.appendDummyInput()
        .appendField("get game phase");
    this.setOutput(true, "String");
    this.setColour('#A65C81');
  }
};

// --- Stockfish Block ---
Blockly.Blocks['stockfish_move'] = {
  init() {
    this.appendValueInput("DEPTH")
        .appendField("get Stockfish move depth");
    this.setOutput(true, "Object");
    this.setColour('#3388DD');
  }
};
