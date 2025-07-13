import React from 'react';

const errorBoundaryStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  padding: '2rem',
  backgroundColor: '#111111',
  color: '#eeeeee',
  fontFamily: 'monospace',
  textAlign: 'center',
  boxSizing: 'border-box'
};

const errorTitleStyle = {
  color: '#eeeeee',
  fontSize: '2rem',
  marginBottom: '1rem'
};

const errorMessageStyle = {
  backgroundColor: '#222222',
  padding: '1rem',
  borderRadius: '8px',
  maxWidth: '800px',
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  border: '1px solid #444'
};

const resetButton = {
    marginTop: '2rem',
    padding: '0.8rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#444444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
};


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={errorBoundaryStyle}>
          <h1 style={errorTitleStyle}>Something went wrong.</h1>
          <p>An unexpected error occurred. Please see the details below.</p>
          <pre style={errorMessageStyle}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <button style={resetButton} onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
