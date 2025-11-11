import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>
            ⚠️ Something went wrong
          </h1>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            maxWidth: '600px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3>Error Details:</h3>
            <pre style={{ 
              textAlign: 'left', 
              backgroundColor: '#f5f5f5', 
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.error?.toString()}
            </pre>
            {this.state.errorInfo && (
              <details style={{ marginTop: '20px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Stack Trace
                </summary>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '15px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '11px',
                  marginTop: '10px'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '30px',
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
