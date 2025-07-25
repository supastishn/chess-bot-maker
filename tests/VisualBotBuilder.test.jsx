import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import VisualBotBuilder from '../src/pages/VisualBotBuilder';
import { getBotBlocklyJson } from '../src/bot/botInterface';

import { vi } from 'vitest';

vi.mock('../src/bot/botInterface');

let shouldThrowBlocklyError = false;
vi.mock('../src/components/BlocklyComponent', () => ({
  default: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      workspaceToCode: vi.fn(() => {
        if (shouldThrowBlocklyError) {
          throw new Error('Blockly error');
        }
        return 'generated code';
      }),
      workspaceToJson: vi.fn(() => '{"blocks":{}}')
    }));
    return <div data-testid="mock-blockly" />;
  })
}));

const mockRegister = vi.fn();

describe('VisualBotBuilder', () => {
  beforeEach(() => {
    shouldThrowBlocklyError = false;
  });

  test('full flow from creation to registration', async () => {
    const onRegisterBot = vi.fn();
    render(<VisualBotBuilder onRegisterBot={onRegisterBot} />);
    
    // Input bot name
    const nameInput = screen.getByPlaceholderText('Bot name');
    fireEvent.change(nameInput, { target: { value: 'New Bot' } });
    
    // Generate code
    fireEvent.click(screen.getByText('Generate Code'));
    
    // Register bot
    fireEvent.click(screen.getByText(/Register Bot/i));
    
    expect(onRegisterBot).toHaveBeenCalledWith(
      'New Bot', 
      expect.stringContaining('generated code'),
      expect.stringContaining('generated code'),
      '{"blocks":{}}'
    );
  });

  test('edits existing bot', async () => {
    const existingJson = '{"blocks":{"languageVersion":0,"blocks":[{"type":"get_available_moves"}]}}';
    getBotBlocklyJson.mockReturnValue(existingJson);

    render(
      <VisualBotBuilder 
        onRegisterBot={mockRegister} 
        location={{ state: { botName: 'Existing Bot' } }} 
      />
    );

    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText('Bot name');
      expect(nameInput).toHaveValue('Existing Bot');
      expect(nameInput).toBeDisabled();
    });
  });

  test('handles Blockly errors', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    shouldThrowBlocklyError = true;

    render(<VisualBotBuilder onRegisterBot={vi.fn()} />);
    fireEvent.click(screen.getByText('Generate Code'));

    expect(errorSpy).toHaveBeenCalledWith('Error generating code:', expect.any(Error));
    errorSpy.mockRestore();
  });
});
