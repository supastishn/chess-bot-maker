import { render, screen } from '@testing-library/react';
import BlocklyGuide from '../../../../src/pages/docs/BlocklyGuide';

describe('BlocklyGuide', () => {
  test('renders Blockly documentation', () => {
    render(<BlocklyGuide />);
    
    expect(screen.getByText(/Visual Bot Builder/i)).toBeInTheDocument();
    expect(screen.getByText(/New blocks for advanced strategies/i)).toBeInTheDocument();
    expect(screen.getByText(/Example workflow/i)).toBeInTheDocument();
  });
});
