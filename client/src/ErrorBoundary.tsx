import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Title1, Body1, Button } from '@fluentui/react-components';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', textAlign: 'center' }}>
          <Title1 block style={{ color: '#d32f2f', marginBottom: 16 }}>Something went wrong</Title1>
          <Body1 block style={{ color: '#666', marginBottom: 20 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Body1>
          <Button
            appearance="primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Reload Page
          </Button>
          <details style={{ marginTop: 20, textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', color: '#6366f1' }}>Error Details</summary>
            <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto' }}>
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
