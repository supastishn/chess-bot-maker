import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';  // Add this import
import 'blockly/blocks';
import toolbox from '../blockly/toolbox';

// Load custom blocks & generators
import '../blockly/blocks/game';
import '../blockly/generators/game';

const BlocklyComponent = forwardRef((_, ref) => {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    // Proper initialization using inject()
    workspace.current = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox, // Pass toolbox object directly
      trashcan: true,
      grid: { spacing: 20, length: 3, colour: '#ccc', snap: true }
    });
    
    javascriptGenerator.addReservedWords('game');  // Update this line
  }, []);

  useImperativeHandle(ref, () => ({
    workspaceToCode: () => javascriptGenerator.workspaceToCode(workspace.current)  // Update this line
  }));

  return <div ref={blocklyDiv} style={{
    height: '50vh',
    minHeight: '300px',
    width: '100%'
  }} />;
});

export default BlocklyComponent;
