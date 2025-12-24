import React, { ComponentType, Component, ErrorInfo } from 'react';
import { ErrorState } from '@/components/feedback/ErrorState';

export interface WithErrorHandlerOptions {
  FallbackComponent?: React.FC<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export function withErrorHandler<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorHandlerOptions = {}
) {
  const { FallbackComponent, onError } = options;

  class ErrorBoundaryWrapper extends Component<P, ErrorBoundaryState> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      console.error('Error caught by withErrorHandler:', error, errorInfo);
      onError?.(error, errorInfo);
    }

    resetError = () => {
      this.setState({ hasError: false, error: null });
    };

    render() {
      if (this.state.hasError && this.state.error) {
        if (FallbackComponent) {
          return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
        }
        return (
          <ErrorState
            title="Algo deu errado"
            description={this.state.error.message}
            onRetry={this.resetError}
          />
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  }

  (ErrorBoundaryWrapper as any).displayName = `withErrorHandler(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ErrorBoundaryWrapper;
}

export default withErrorHandler;
