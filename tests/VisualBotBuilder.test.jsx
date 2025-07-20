import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import VisualBotBuilder from '../src/pages/VisualBotBuilder';
import { getBotBlocklyXml } from '../src/bot/botInterface';

import { vi } from 'vitest';

vi.mock('../src/bot/botInterface');
vi.mock('../src/components/BlocklyComponent', () => ({
  default: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      workspaceToCode: vi.fn(() => 'generated code'),
      workspaceToXml: vi.fn(() => '<xml></xml>')
    }));
    return <div data-testid="mock-blockly" />;
  })
}));

const mockRegister = vi.fn();

describe('VisualBotBuilder', () => {
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
      '<xml></xml>'
    );
  });

  test('edits existing bot', async () => {
    const existingXml = '<xml><block type="get_available_moves"></block></xml>';
    getBotBlocklyXml.mockReturnValue(existingXml);

    render(
      <HashRouter>
        <VisualBotBuilder 
          onRegisterBot={mockRegister} 
          location={{ state: { botName: 'Existing Bot' } }} 
        />
      </HashRouter>
    );

    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText('Bot name');
      expect(nameInput).toHaveValue('Existing Bot');
      expect(nameInput).toBeDisabled();
    });
  });

  test('handles Blockly errors', () => {
    const originalError = console.error;
    console.error = vi.fn();

    vi.doMock('../../src/components/BlocklyComponent', () => ({
      default: React.forwardRef((props, ref) => {
        React.useImperativeHandle(ref, () => ({
          workspaceToCode: () => { throw new Error('Blockly error') },
          workspaceToXml: () => '<xml></xml>'
        }));
        return <div data-testid="mock-blockly" />;
      })
    }));

    render(<VisualBotBuilder onRegisterBot={vi.fn()} />, { wrapper: HashRouter });
    fireEvent.click(screen.getByText('Generate Code'));

    expect(console.error).toHaveBeenCalledWith('Error generating code:', expect.any(Error));
    console.error = originalError;
  });
});
