import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import VisualBotBuilder from '../../src/pages/VisualBotBuilder';

 // Mock Blockly execution
const mockBlocklyInstance = {
  workspaceToCode: vi.fn(() => `console.log("Generated code")`),
  workspaceToXml: vi.fn(() => '<xml></xml>')
};

vi.mock('../../src/components/BlocklyComponent', () => ({
  default: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => mockBlocklyInstance);
    return <div data-testid="mock-blockly" />;
  })
}));

describe('VisualBotBuilder', () => {
  const mockRegister = vi.fn();
  
  test('renders visual builder interface', () => {
    render(
      <HashRouter>
        <VisualBotBuilder onRegisterBot={mockRegister} />
      </HashRouter>
    );
    
    expect(screen.getByText(/Visual Bot Builder/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Bot name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Code/i })).toBeInTheDocument();
  });

  test('switches between visual and code views', async () => {
    render(
      <HashRouter>
        <VisualBotBuilder onRegisterBot={mockRegister} />
      </HashRouter>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Generate Code/i }));
    expect(await screen.findByDisplayValue(/Generated code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register Bot/i })).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /Edit Code/i }));
    expect(screen.getByTestId('mock-blockly')).toBeInTheDocument();
  });
});
