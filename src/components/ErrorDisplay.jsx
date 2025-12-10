import React from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Error display component with different severity levels
 */
export function ErrorDisplay({
    error,
    severity = 'error',
    title,
    onDismiss,
    className = ''
}) {
    if (!error) return null;

    const severityConfig = {
        error: {
            icon: XCircle,
            variant: 'destructive',
            defaultTitle: 'Error',
        },
        warning: {
            icon: AlertTriangle,
            variant: 'default',
            defaultTitle: 'Warning',
        },
        info: {
            icon: Info,
            variant: 'default',
            defaultTitle: 'Information',
        },
    };

    const config = severityConfig[severity] || severityConfig.error;
    const Icon = config.icon;
    const displayTitle = title || config.defaultTitle;

    return (
        <Alert variant={config.variant} className={`relative ${className}`}>
            <Icon className="h-4 w-4" />
            <AlertTitle>{displayTitle}</AlertTitle>
            <AlertDescription className="mt-2">
                {typeof error === 'string' ? error : error.message || 'An error occurred'}
            </AlertDescription>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute top-2 right-2 p-1 rounded-md hover:bg-accent transition-colors"
                    aria-label="Dismiss"
                >
                    <XCircle className="h-4 w-4" />
                </button>
            )}
        </Alert>
    );
}

/**
 * Inline error message for form fields
 */
export function FieldError({ error, className = '' }) {
    if (!error) return null;

    return (
        <p className={`text-sm text-destructive mt-1 flex items-center gap-1 ${className}`}>
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
        </p>
    );
}

/**
 * Error boundary fallback component
 */
export function ErrorFallback({ error, resetError }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="max-w-md w-full space-y-4">
                <div className="text-center">
                    <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                    <p className="text-muted-foreground mb-4">
                        {error?.message || 'An unexpected error occurred'}
                    </p>
                </div>

                {resetError && (
                    <button
                        onClick={resetError}
                        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Try again
                    </button>
                )}

                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                >
                    Go to home
                </button>
            </div>
        </div>
    );
}
