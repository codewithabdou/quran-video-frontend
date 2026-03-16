import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_NODE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Fetch user on mount if token exists
    const fetchUser = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${API_URL}/api/v1/auth/me`);
            setUser(res.data.user);
        } catch (err) {
            console.error('Failed to fetch user:', err);
            // Token is invalid — clear it
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Login: redirect to Google OAuth
    const login = () => {
        window.location.href = `${API_URL}/api/v1/auth/google`;
    };

    // Handle callback: extract token from URL
    const handleCallback = (newToken) => {
        if (newToken) {
            localStorage.setItem('auth_token', newToken);
            setToken(newToken);
        }
    };

    // Logout: clear token and user
    const logout = () => {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const isAdmin = user?.role === 'ADMIN';
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated,
                isAdmin,
                login,
                logout,
                handleCallback,
                refreshUser: fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
