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
