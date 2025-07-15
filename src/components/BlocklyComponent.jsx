import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import 'blockly/blocks';
import toolbox from '../blockly/toolbox';

// Load custom blocks & generators
import '../blockly/blocks/game';
import '../blockly/generators/game';

const BlocklyComponent = forwardRef(({ onCodeChange }, ref) => {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    workspace.current = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      trashcan: true,
      grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      }
    });

    javascriptGenerator.addReservedWords('game');
    workspace.current.addChangeListener(() => {
      const code = javascriptGenerator.workspaceToCode(workspace.current);
      if (onCodeChange) onCodeChange(code);
    });
  }, [onCodeChange]);

  useImperativeHandle(ref, () => ({
    workspaceToCode: () => javascriptGenerator.workspaceToCode(workspace.current)
  }));

  return <div ref={blocklyDiv} style={{
    height: '50vh',
    minHeight: '300px',
    width: '100%'
  }} />;
});

export default BlocklyComponent;
