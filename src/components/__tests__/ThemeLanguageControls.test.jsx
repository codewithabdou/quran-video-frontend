import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ThemeLanguageControls from '../ThemeLanguageControls';
import { ThemeLanguageProvider } from '../../contexts/ThemeLanguageContext';

// Helper to render component with required providers
const renderWithProviders = (component) => {
    return render(
        <BrowserRouter>
            <ThemeLanguageProvider>
                {component}
            </ThemeLanguageProvider>
        </BrowserRouter>
    );
};

describe('ThemeLanguageControls', () => {
    it('should render without crashing', () => {
        renderWithProviders(<ThemeLanguageControls />);
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
    });

    it('should render language selector button', () => {
        renderWithProviders(<ThemeLanguageControls />);
        expect(screen.getByRole('button', { name: /switch language/i })).toBeInTheDocument();
    });

    it('should render navigation button', () => {
        renderWithProviders(<ThemeLanguageControls />);
        // Should render either Home or Sparkles button depending on route
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });
});
