const toolbox = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="Logic" colour="#5C81A6">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
  </category>
  <category name="Math" colour="#5CA65C">
    <block type="math_number"></block>
    <block type="math_arithmetic"></block>
  </category>
  <category name="Game API" colour="#A65C81">
    <block type="get_available_moves"></block>
    <block type="get_turn"></block>
    <block type="move_action">
      <value name="MOVE">
        <block type="text"></block>
      </value>
    </block>
    <block type="evaluate_material"></block>
    <block type="undo_move"></block>
  </category>
</xml>
`;
export default toolbox;
