import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { ThemeLanguageProvider } from '../../contexts/ThemeLanguageContext';
import { AuthProvider } from '../../contexts/AuthContext';

// Helper to render component with required providers
const renderWithProviders = (component) => {
    return render(
        <BrowserRouter>
            <ThemeLanguageProvider>
                <AuthProvider>
                    {component}
                </AuthProvider>
            </ThemeLanguageProvider>
        </BrowserRouter>
    );
};

describe('Navbar', () => {
    it('should render without crashing', () => {
        renderWithProviders(<Navbar />);
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
    });

    it('should render language selector button', () => {
        renderWithProviders(<Navbar />);
        expect(screen.getByRole('button', { name: /switch language/i })).toBeInTheDocument();
    });

    it('should render navigation links', () => {
        renderWithProviders(<Navbar />);
        // By default should have Home and Generator link
        expect(screen.getByText(/Home/i)).toBeInTheDocument();
        expect(screen.getByText(/Generator/i)).toBeInTheDocument();
    });
});
