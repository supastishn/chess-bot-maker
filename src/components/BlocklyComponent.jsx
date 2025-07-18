import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import 'blockly/blocks';
import toolbox from '../blockly/toolbox';
import { useTheme } from '../context/useTheme';

import '../blockly/blocks/game';
// Import the exported generators object
import { gameGenerators } from '../blockly/generators/game';

Blockly.setLocale(En);

const BlocklyComponent = forwardRef(({ onCodeChange, initialXml }, ref) => {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    // Guard against the ref not being ready.
    if (!blocklyDiv.current) return;

    // Register all custom game generators explicitly.
    Object.assign(javascriptGenerator, gameGenerators);

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

    if (initialXml) {
      const xmlDom = Blockly.Xml.textToDom(initialXml);
      Blockly.Xml.domToWorkspace(xmlDom, workspace.current);
    }

    javascriptGenerator.addReservedWords('game');
    workspace.current.addChangeListener(() => {
      const code = javascriptGenerator.workspaceToCode(workspace.current);
      if (onCodeChange) onCodeChange(code);
    });

    // Cleanup function to dispose of the workspace on unmount.
    return () => {
      workspace.current?.dispose();
    };
  }, [onCodeChange, initialXml]);

  useImperativeHandle(ref, () => ({
    workspaceToCode: () => javascriptGenerator.workspaceToCode(workspace.current),
    workspaceToXml: () => {
      const xml = Blockly.Xml.workspaceToDom(workspace.current);
      return Blockly.Xml.domToText(xml);
    },
  }));

  return (
    <div
      ref={blocklyDiv}
      className={`blockly-container ${isDark ? 'dark' : 'light'}`}
      style={{
        height: '50vh',
        minHeight: '300px',
        width: '100%',
        position: 'relative'
      }}
    />
  );
});

export default BlocklyComponent;
