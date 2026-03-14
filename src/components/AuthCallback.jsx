import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Handles the OAuth callback redirect from the backend.
 * Extracts the JWT token from URL params and stores it.
 */
const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const { handleCallback } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            console.error('Auth error:', error);
            navigate('/', { replace: true });
            return;
        }

        if (token) {
            handleCallback(token);
            // Small delay to allow state to update before navigating
            setTimeout(() => {
                navigate('/generate', { replace: true });
            }, 100);
        } else {
            navigate('/', { replace: true });
        }
    }, [searchParams, handleCallback, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Signing you in...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
