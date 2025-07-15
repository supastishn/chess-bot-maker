import React from 'react';
import { render, screen } from '@testing-library/react';
import APIReference from '../../../../src/pages/docs/APIReference';

describe('APIReference', () => {
  test('renders API documentation', () => {
    render(<APIReference />);
    
    expect(screen.getByText(/Game Helper API v2.1/i)).toBeInTheDocument();
    expect(screen.getByText(/getAvailableMoves/i)).toBeInTheDocument();
    expect(screen.getByText(/Position Evaluation Formula/i)).toBeInTheDocument();
  });
});
