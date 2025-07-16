import React from 'react';
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import DocLayout from '../../src/pages/Docs';

const Wrapper = ({ children }) => <HashRouter>{children}</HashRouter>;

describe('DocLayout', () => {
  test('renders documentation sidebar', () => {
    render(
      <Wrapper>
        <DocLayout />
      </Wrapper>
    );
    
    expect(screen.getByText(/Introduction/i)).toBeInTheDocument();
    expect(screen.getByText(/API Reference/i)).toBeInTheDocument();
    expect(screen.getByText(/Examples/i)).toBeInTheDocument();
    expect(screen.getByText(/Blockly Guide/i)).toBeInTheDocument();
  });
});
