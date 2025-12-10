import React from 'react';
import { ErrorFallback } from './ErrorDisplay';

/**
 * Error Boundary component to catch React errors
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error caught by boundary:', error, errorInfo);
        }

        // TODO: Send to error tracking service (Sentry)
        // logErrorToService(error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorFallback
                    error={this.state.error}
                    resetError={this.resetError}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
