import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Blockly from 'blockly/core';
import 'blockly/blocks';
import 'blockly/javascript';
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
  }, []);

  useImperativeHandle(ref, () => ({
    workspaceToCode: () => Blockly.JavaScript.workspaceToCode(workspace.current)
  }));

  return <div ref={blocklyDiv} style={{ height: '480px', width: '100%' }} />;
});

export default BlocklyComponent;
