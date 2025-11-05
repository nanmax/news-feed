import React from 'react';
import { useToast } from '../contexts/ToastContext';

export const useGlobalErrorHandler = () => {
  const { showError } = useToast();

  const handleError = React.useCallback((error: Error, errorInfo?: any) => {
    console.error('Global error:', error, errorInfo);
    
    if (error.message.includes('Loading chunk') || 
        error.message.includes('ChunkLoadError') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Authentication failed') ||
        error.message.includes('Invalid credentials') ||
        error.message.includes('Network Error')) {
      return;
    }

    showError(
      `Something went wrong: ${error.message}. Please try refreshing the page.`,
      8000
    );
  }, [showError]);

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      
      const error = event.reason;
      if (error instanceof Error) {
        handleError(error);
      } else {
        showError('An unexpected error occurred. Please try again.', 5000);
      }
    };

    const handleGlobalError = (event: ErrorEvent) => {
      event.preventDefault();
      handleError(event.error || new Error(event.message));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, [showError, handleError]);
};