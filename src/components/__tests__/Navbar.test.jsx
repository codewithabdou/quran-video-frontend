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
        // Expect either Sun or Moon label depending on theme (present on both desktop and mobile)
        expect(screen.getAllByText(/Light|Dark/i).length).toBeGreaterThan(0);
    });

    it('should render language selector button', () => {
        renderWithProviders(<Navbar />);
        expect(screen.getAllByText(/English|Français|العربية/i).length).toBeGreaterThan(0);
    });

    it('should render navigation links', () => {
        renderWithProviders(<Navbar />);
        // Use regex for flexible matching (handles spaces, children etc)
        const homeLinks = screen.getAllByText(/Home/i);
        const genLinks = screen.getAllByText(/Generator/i);
        expect(homeLinks.length).toBeGreaterThan(0);
        expect(genLinks.length).toBeGreaterThan(0);
    });
});
