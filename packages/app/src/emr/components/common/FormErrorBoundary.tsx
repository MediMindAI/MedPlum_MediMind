// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Component, type ReactNode } from 'react';
import { Alert, Button, Stack, Text, Group, Box, Code } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

/**
 * Props for FormErrorBoundary
 */
export interface FormErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Custom fallback UI */
  fallback?: ReactNode;
  /** Called when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Custom error title */
  errorTitle?: string;
  /** Custom error message */
  errorMessage?: string;
  /** Whether to show error details (for development) */
  showDetails?: boolean;
}

/**
 * State for FormErrorBoundary
 */
interface FormErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * FormErrorBoundary Component
 *
 * Error boundary specifically designed for form components.
 * Catches JavaScript errors in child component tree and displays
 * a fallback UI with recovery options.
 *
 * Features:
 * - Graceful error handling for form rendering errors
 * - Retry functionality to attempt re-rendering
 * - Error reporting callback for logging
 * - Accessible error messages with ARIA attributes
 * - Mobile-responsive design
 *
 * @example
 * ```tsx
 * <FormErrorBoundary
 *   onError={(error) => logError(error)}
 *   errorTitle="Form Error"
 * >
 *   <FormRenderer questionnaire={questionnaire} />
 * </FormErrorBoundary>
 * ```
 */
export class FormErrorBoundary extends Component<FormErrorBoundaryProps, FormErrorBoundaryState> {
  constructor(props: FormErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<FormErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error information
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log to console for debugging
    console.error('FormErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  /**
   * Reset error state to retry rendering
   */
  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { children, fallback, errorTitle, errorMessage, showDetails } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      // Custom fallback provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <Box
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ padding: 'var(--mantine-spacing-md)' }}
        >
          <Alert
            icon={<IconAlertTriangle size={24} />}
            title={errorTitle || 'Form Error'}
            color="red"
            variant="light"
          >
            <Stack gap="md">
              <Text size="sm">
                {errorMessage ||
                  'An error occurred while rendering this form. Please try again or contact support if the problem persists.'}
              </Text>

              {showDetails && error && (
                <Box>
                  <Text size="xs" c="dimmed" mb="xs">
                    Error Details:
                  </Text>
                  <Code block style={{ fontSize: '12px', maxHeight: '150px', overflow: 'auto' }}>
                    {error.message}
                    {errorInfo?.componentStack && (
                      <>
                        {'\n\nComponent Stack:'}
                        {errorInfo.componentStack}
                      </>
                    )}
                  </Code>
                </Box>
              )}

              <Group gap="sm">
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconRefresh size={16} />}
                  onClick={this.handleRetry}
                  aria-label="Retry rendering the form"
                >
                  Try Again
                </Button>
              </Group>
            </Stack>
          </Alert>
        </Box>
      );
    }

    return children;
  }
}

export default FormErrorBoundary;
