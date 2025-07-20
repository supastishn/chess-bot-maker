import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import '../src/blockly/blocks/game';
import '../src/blockly/generators/game';

describe('Blockly game block generators', () => {
  const blockTypes = [
    'get_available_moves', 'get_verbose_moves', 'get_turn', 'evaluate_material',
    'is_in_check', 'get_game_phase', 'is_checkmate', 'is_stalemate',
    'is_draw', 'is_game_over', 'get_fen', 'get_move_count', 'get_book_moves',
    'play_book_move', 'return_move', 'look_ahead', 'get_threatened_squares',
    'is_attacked', 'get_position_score', 'prioritize_strategy', 'stockfish_move'
  ];

  blockTypes.forEach(type => {
    test(`generator for block ${type} is defined`, () => {
      expect(typeof javascriptGenerator[type]).toBe('function');
    });

    test(`generator for block ${type} returns code and order`, () => {
      // Create a minimal stub block:
      const block = { type };
      block.getFieldValue = () => null;
      block.getInputTargetBlock = () => null;
      // Stub valueToCode to avoid missing inputs:
      javascriptGenerator.valueToCode = () => `'x'`;
      const result = javascriptGenerator[type](block);
      expect(Array.isArray(result)).toBe(true);
      expect(typeof result[0]).toBe('string');
    });
  });
});
