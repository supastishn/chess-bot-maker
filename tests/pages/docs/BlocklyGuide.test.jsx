import { describe, test, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import BlocklyGuide from '../../../src/pages/docs/BlocklyGuide.jsx';

describe('BlocklyGuide', () => {
  test('renders Blockly documentation', () => {
    render(<BlocklyGuide />);
    
    expect(screen.getByText(/Visual Bot Builder/i)).toBeInTheDocument();
    expect(screen.getByText(/New Advanced Blocks/i)).toBeInTheDocument();
    expect(screen.getByText(/A Smarter Bot/i)).toBeInTheDocument();
  });
});
