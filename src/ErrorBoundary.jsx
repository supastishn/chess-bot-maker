import React from 'react';

const errorStyles = {
  boundary: {
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
  },
  title: {
    color: '#eeeeee',
    fontSize: '2rem',
    marginBottom: '1rem'
  },
  message: {
    backgroundColor: '#222222',
    padding: '1rem',
    borderRadius: '8px',
    maxWidth: '800px',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    border: '1px solid #444'
  },
  button: {
    marginTop: '2rem',
    padding: '0.8rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#444444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={errorStyles.boundary}>
          <h1 style={errorStyles.title}>Something went wrong.</h1>
          <pre style={errorStyles.message}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <button 
            style={errorStyles.button} 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
