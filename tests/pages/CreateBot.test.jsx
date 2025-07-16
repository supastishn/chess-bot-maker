import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import CreateBot from '../../src/pages/CreateBot';
import useBotTester from '../../src/hooks/useBotTester.js';

vi.mock('../../src/hooks/useBotTester.js');

describe('CreateBot', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    useBotTester.mockReturnValue({
      isTesting: false,
      runBotTests: vi.fn().mockResolvedValue({}),
    });
  });
  
  test('renders bot creation form', () => {
    render(
      <HashRouter>
        <CreateBot onRegisterBot={mockRegister} />
      </HashRouter>
    );
    
    expect(screen.getByLabelText(/Bot Name/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Bot Code/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Test Performance/i })).toBeInTheDocument();
  });

  test('validates form submission', () => {
    window.alert = vi.fn();
    render(
      <BrowserRouter>
        <CreateBot onRegisterBot={mockRegister} />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Register Bot/i }));
    expect(window.alert).toHaveBeenCalledWith('Please provide a name and code for the bot.');
  });
});
