import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateBot from '../../src/pages/CreateBot';

describe('CreateBot', () => {
  const mockRegister = jest.fn();
  
  test('renders bot creation form', () => {
    render(<CreateBot onRegisterBot={mockRegister} />);
    
    expect(screen.getByLabelText(/Bot Name/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Bot Code/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Test Performance/i })).toBeInTheDocument();
  });

  test('validates form submission', async () => {
    render(<CreateBot onRegisterBot={mockRegister} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Register Bot/i }));
    expect(await screen.findByText(/Please provide/i)).toBeInTheDocument();
  });
});
