/**
 * Error Boundary for Smart Start components
 * Catches React errors and provides graceful recovery
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'critical' | 'recoverable';
  resetKeys?: any[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class SmartStartErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error('[SmartStartErrorBoundary] Caught error:', error);
    console.error('[SmartStartErrorBoundary] Error info:', errorInfo);

    // Store error info in state
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state if resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      this.props.resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])
    ) {
      this.resetError();
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on severity level
      const isCritical = this.props.level === 'critical';

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="max-w-md w-full bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  {isCritical ? 'Critical Error' : 'Something went wrong'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isCritical
                    ? 'A critical error occurred and the application cannot continue. Please refresh the page.'
                    : 'An error occurred, but you can try again.'}
                </p>

                {/* Show error details in development */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-4">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      Error details (dev only)
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                      {this.state.error.toString()}
                      {'\n\n'}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}

                <div className="flex gap-2">
                  {!isCritical && (
                    <button
                      onClick={this.resetError}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                  )}
                  <button
                    onClick={() => (window.location.href = '/')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors text-sm"
                  >
                    <Home className="w-4 h-4" />
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper
 * For functional components that need error boundary protection
 */
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  componentName?: string;
  level?: 'critical' | 'recoverable';
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    componentName?: string;
    level?: 'critical' | 'recoverable';
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  }
) {
  return function WrappedComponent(props: P) {
    return (
      <SmartStartErrorBoundary
        level={options?.level || 'recoverable'}
        onError={(error, errorInfo) => {
          console.error(
            `[${options?.componentName || Component.name}] Error:`,
            error,
            errorInfo
          );
          options?.onError?.(error, errorInfo);
        }}
      >
        <Component {...props} />
      </SmartStartErrorBoundary>
    );
  };
}

/**
 * Simple wrapper component for inline error boundary usage
 */
export function ErrorBoundary({
  children,
  componentName,
  level = 'recoverable',
}: ErrorBoundaryWrapperProps) {
  return (
    <SmartStartErrorBoundary
      level={level}
      onError={(error, errorInfo) => {
        console.error(`[${componentName || 'ErrorBoundary'}] Error:`, error, errorInfo);
      }}
    >
      {children}
    </SmartStartErrorBoundary>
  );
}
