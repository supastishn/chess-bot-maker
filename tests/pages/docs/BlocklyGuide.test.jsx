import { describe, test, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import BlocklyGuide from '../../../src/pages/docs/BlocklyGuide.jsx';

describe('BlocklyGuide', () => {
  test('renders Blockly documentation', () => {
    render(<BlocklyGuide />);
    
    expect(screen.getByText(/All Blocks/i)).toBeInTheDocument();
    expect(screen.getByText(/Game State/i)).toBeInTheDocument();
    expect(screen.getByText(/Decision Making/i)).toBeInTheDocument();
  });
});
