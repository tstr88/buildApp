/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send error to logging service (Sentry, LogRocket, etc.)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: spacing[6],
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: colors.error[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing[4],
            }}
          >
            <Icons.AlertTriangle size={32} color={colors.error[600]} />
          </div>

          <h2
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            Something went wrong
          </h2>

          <p
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
              marginBottom: spacing[6],
              maxWidth: '500px',
            }}
          >
            We're sorry, but something unexpected happened. Please try refreshing the page or contact
            support if the problem persists.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details
              style={{
                marginBottom: spacing[4],
                padding: spacing[4],
                backgroundColor: colors.neutral[100],
                borderRadius: borderRadius.md,
                textAlign: 'left',
                maxWidth: '600px',
                width: '100%',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.error[700],
                  marginBottom: spacing[2],
                }}
              >
                Error Details (Development Only)
              </summary>
              <pre
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.primary,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.toString()}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: spacing[3] }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: `${spacing[3]} ${spacing[6]}`,
                backgroundColor: colors.primary[600],
                color: colors.neutral[0],
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              <Icons.RotateCcw size={20} />
              Try Again
            </button>

            <button
              onClick={() => window.location.reload()}
              style={{
                padding: `${spacing[3]} ${spacing[6]}`,
                backgroundColor: colors.neutral[0],
                color: colors.text.primary,
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              <Icons.RefreshCw size={20} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
