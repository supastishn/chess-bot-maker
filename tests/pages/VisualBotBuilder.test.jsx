import { render, screen, fireEvent } from '@testing-library/react';
import VisualBotBuilder from '../../src/pages/VisualBotBuilder';

describe('VisualBotBuilder', () => {
  const mockRegister = jest.fn();
  
  test('renders visual builder interface', () => {
    render(<VisualBotBuilder onRegisterBot={mockRegister} />);
    
    expect(screen.getByText(/Visual Bot Builder/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Bot name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Code/i })).toBeInTheDocument();
  });

  test('switches between visual and code views', async () => {
    render(<VisualBotBuilder onRegisterBot={mockRegister} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Generate Code/i }));
    expect(await screen.findByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register Bot/i })).toBeInTheDocument();
  });
});
