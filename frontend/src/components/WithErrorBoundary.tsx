import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { useToast } from '../contexts/ToastContext';

interface WithErrorBoundaryProps {
}

const WithErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & WithErrorBoundaryProps> => {
  const ComponentWithErrorBoundary: React.FC<P & WithErrorBoundaryProps> = (props) => {
    const { showError } = useToast();

    return (
      <ErrorBoundary showError={showError}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  ComponentWithErrorBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ComponentWithErrorBoundary;
};

export default WithErrorBoundary;