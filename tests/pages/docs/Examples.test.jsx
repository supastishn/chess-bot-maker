import React from 'react';
import { render, screen } from '@testing-library/react';
import Examples from '../../../../src/pages/docs/Examples';

describe('Examples', () => {
  test('renders bot examples', () => {
    render(<Examples />);
    
    expect(screen.getByText(/Bot Examples/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced Positional Bot/i)).toBeInTheDocument();
    expect(screen.getByText(/Threat-Aware Bot/i)).toBeInTheDocument();
  });
});
