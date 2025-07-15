import { describe, test, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateBot from '../../src/pages/CreateBot';

describe('CreateBot', () => {
  const mockRegister = vi.fn();
  
  test('renders bot creation form', () => {
    render(
      <BrowserRouter>
        <CreateBot onRegisterBot={mockRegister} />
      </BrowserRouter>
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
