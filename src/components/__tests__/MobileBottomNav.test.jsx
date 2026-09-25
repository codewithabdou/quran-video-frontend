import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import MobileBottomNav from '../MobileBottomNav';
import { ThemeLanguageProvider } from '../../contexts/ThemeLanguageContext';
import { AuthProvider } from '../../contexts/AuthContext';

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

describe('MobileBottomNav', () => {
    it('renders all 5 primary bottom navigation entries', () => {
        renderWithProviders(<MobileBottomNav onAuthRequired={vi.fn()} />);

        // Tab 1: Home
        expect(screen.getByText(/Home/i)).toBeInTheDocument();
        // Tab 2: Mushaf
        expect(screen.getByText(/Mushaf/i)).toBeInTheDocument();
        // Tab 3: Generator (Center)
        expect(screen.getByText(/Generator/i)).toBeInTheDocument();
        // Tab 4: Prayers
        expect(screen.getByText(/Prayers/i)).toBeInTheDocument();
        // Tab 5: More
        expect(screen.getByText(/More/i)).toBeInTheDocument();
    });

    it('center generator button links to /generate', () => {
        renderWithProviders(<MobileBottomNav onAuthRequired={vi.fn()} />);

        const generatorLink = screen.getByRole('link', { name: /Generator/i });
        expect(generatorLink).toHaveAttribute('href', '/generate');
    });

    it('opens the bottom sheet drawer when More tab is clicked', () => {
        renderWithProviders(<MobileBottomNav onAuthRequired={vi.fn()} />);

        const moreBtn = screen.getByRole('button', { name: /More/i });
        fireEvent.click(moreBtn);

        // Drawer should open and display secondary destinations
        expect(screen.getAllByText(/Radio/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Azkar/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/History/i).length).toBeGreaterThan(0);
    });
});
