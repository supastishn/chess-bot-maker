import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import APIReference from '../../../src/pages/docs/APIReference.jsx';

describe('APIReference', () => {
  test('renders API documentation', () => {
    render(<APIReference />);
    
    expect(screen.getByRole('heading', { name: /API Reference/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Core Actions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /getAvailableMoves/i })).toBeInTheDocument();
  });
});
