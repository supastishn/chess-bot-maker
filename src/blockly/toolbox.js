const toolbox = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="Program" colour="290">
    <block type="bot_main"></block>
  </category>
  <category name="Logic" colour="#5C81A6">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
  </category>
  <category name="Math" colour="#5CA65C">
    <block type="math_number"></block>
    <block type="math_arithmetic"></block>
  </category>
  <category name="Game State" colour="#A65C81">
    <block type="get_available_moves"></block>
    <block type="get_verbose_moves"></block>
    <block type="get_turn"></block>
    <block type="get_move_count"></block>
    <block type="get_fen"></block>
    <block type="get_game_phase"></block>
    <block type="is_in_check"></block>
    <block type="is_checkmate"></block>
    <block type="is_stalemate"></block>
    <block type="is_draw"></block>
    <block type="is_game_over"></block>
  </category>
  <category name="Analysis" colour="#888888">
    <block type="evaluate_material"></block>
    <block type="get_position_score"></block>
    <block type="is_attacked">
      <value name="SQUARE"><shadow type="text"><field name="TEXT">e4</field></shadow></value>
      <value name="COLOR"><shadow type="text"><field name="TEXT">b</field></shadow></value>
    </block>
    <block type="get_threatened_squares">
      <value name="COLOR">
        <shadow type="text"><field name="TEXT">w</field></shadow>
      </value>
    </block>
    <block type="look_ahead">
      <value name="DEPTH">
        <block type="math_number"><field name="NUM">2</field></block>
      </value>
    </block>
  </category>
  <category name="Decision Making" colour="#5C81A6">
    <block type="prioritize_strategy">
      <value name="MATERIAL"><shadow type="math_number"><field name="NUM">0.6</field></shadow></value>
      <value name="DEVELOPMENT"><shadow type="math_number"><field name="NUM">0.4</field></shadow></value>
      <value name="CENTER_CONTROL"><shadow type="math_number"><field name="NUM">0.5</field></shadow></value>
      <value name="KING_SAFETY"><shadow type="math_number"><field name="NUM">0.4</field></shadow></value>
    </block>
    <block type="get_book_moves"></block>
    <block type="play_book_move"></block>
    <block type="stockfish_move">
      <value name="DEPTH">
        <block type="math_number"><field name="NUM">15</field></block>
      </value>
    </block>
    <block type="return_move">
      <value name="MOVE">
        <shadow type="text"><field name="TEXT">e2e4</field></shadow>
      </value>
    </block>
  </category>
</xml>
`;
export default toolbox;
