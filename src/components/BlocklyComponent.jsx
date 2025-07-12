import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript'; // Add this import
import 'blockly/blocks';
import toolbox from '../blockly/toolbox';

// load custom blocks & generators
import '../blockly/blocks/game';
import '../blockly/generators/game';

const BlocklyComponent = forwardRef((_, ref) => {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    workspace.current = Blockly.inject(blocklyDiv.current, {
      toolbox,
      trashcan: true,
      grid: { spacing: 20, length: 3, colour: '#ccc', snap: true }
    });
    
    // Register JavaScript generator
    Blockly.JavaScript = javascriptGenerator;
    Blockly.JavaScript.addReservedWords('game');
  }, []);

  useImperativeHandle(ref, () => ({
    workspaceToCode: () => Blockly.JavaScript.workspaceToCode(workspace.current)
  }));

  return <div ref={blocklyDiv} style={{ height: '480px', width: '100%' }} />;
});

export default BlocklyComponent;
