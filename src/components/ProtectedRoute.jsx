import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute — wraps routes that require authentication.
 * If adminOnly is true, also checks for admin role.
 */
const ProtectedRoute = ({ children, adminOnly = false, onAuthRequired }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !isAuthenticated && onAuthRequired) {
            onAuthRequired();
        }
    }, [loading, isAuthenticated, onAuthRequired]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location, needsAuth: true }} replace />;
    }

    if (adminOnly && !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-muted-foreground mb-6">
                        You don't have permission to access the admin dashboard.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
