import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VisualBotBuilder from '../../src/pages/VisualBotBuilder';

vi.mock('../../src/components/BlocklyComponent', () => ({
  default: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      workspaceToCode: () => 'console.log("mock code");'
    }));
    return <div data-testid="mock-blockly" />;
  })
}));

describe('VisualBotBuilder', () => {
  const mockRegister = vi.fn();
  
  test('renders visual builder interface', () => {
    render(<VisualBotBuilder onRegisterBot={mockRegister} />);
    
    expect(screen.getByText(/Visual Bot Builder/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Bot name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Code/i })).toBeInTheDocument();
  });

  test('switches between visual and code views', async () => {
    render(<VisualBotBuilder onRegisterBot={mockRegister} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Generate Code/i }));
    expect(await screen.findByDisplayValue(/mock code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register Bot/i })).toBeInTheDocument();
  });
});
