import { javascriptGenerator } from 'blockly/javascript';

export const gameGenerators = {
  'get_available_moves': function() {
    return ['game.getAvailableMoves()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'get_book_moves': function() {
    return ['game.getBookMoves()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'play_book_move': function() {
    return ['game.playBookMove()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'get_turn': function() {
    return ['game.getTurn()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'return_move': function(block) {
    const moveCode = javascriptGenerator.valueToCode(block, 'MOVE', javascriptGenerator.ORDER_NONE) || 'null';
    return `return ${moveCode};\n`;
  },
  'evaluate_material': function() {
    return ['game.evaluateMaterial()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'is_in_check': function() {
    return ['game.isInCheck()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'is_checkmate': function() {
    return ['game.isCheckmate()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'get_position_score': function() {
    return ['game.getPositionScore()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'look_ahead': function(block) {
    const move = javascriptGenerator.valueToCode(block, 'MOVE', javascriptGenerator.ORDER_NONE) || "''";
    const depth = javascriptGenerator.valueToCode(block, 'DEPTH', javascriptGenerator.ORDER_ATOMIC) || 2;
    const topics = javascriptGenerator.valueToCode(block, 'TOPICS', javascriptGenerator.ORDER_NONE) || "['all']";
    return [`game.lookAhead(${move}, ${depth}, ${topics}).score`, javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'get_game_phase': function() {
    return ['game.getGamePhase()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'get_threatened_squares': function(block) {
    const color = javascriptGenerator.valueToCode(block, 'COLOR', javascriptGenerator.ORDER_NONE) || "'w'";
    return [`game.getThreatenedSquares(${color})`, javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'get_verbose_moves': function() {
    return ['game.getVerboseMoves()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'is_stalemate': function() {
    return ['game.isStalemate()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'is_draw': function() {
    return ['game.isDraw()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'is_game_over': function() {
    return ['game.isGameOver()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'get_fen': function() {
    return ['game.getFEN()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'get_move_count': function() {
    return ['game.getMoveCount()', javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'is_attacked': function(block) {
    const square = javascriptGenerator.valueToCode(block, 'SQUARE', javascriptGenerator.ORDER_NONE) || "''";
    const color = javascriptGenerator.valueToCode(block, 'COLOR', javascriptGenerator.ORDER_NONE) || "'w'";
    return [`game.isAttacked(${square}, ${color})`, javascriptGenerator.ORDER_FUNCTION_CALL];
  },
  'prioritize_strategy': function(block) {
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
  },
  'stockfish_move': function(block) {
    const depth = javascriptGenerator.valueToCode(block, 'DEPTH', 
      javascriptGenerator.ORDER_ATOMIC) || 15;
    return [`await game.stockfish.getBestMove(game.getFEN(), ${depth})`, javascriptGenerator.ORDER_FUNCTION_CALL];
  }
};
