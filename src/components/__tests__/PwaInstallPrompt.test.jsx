import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import PwaInstallPrompt, { triggerPwaInstall } from '../PwaInstallPrompt';
import { ThemeLanguageProvider } from '../../contexts/ThemeLanguageContext';

const renderWithProviders = (component) => {
    return render(
        <ThemeLanguageProvider>
            {component}
        </ThemeLanguageProvider>
    );
};

describe('PwaInstallPrompt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders on beforeinstallprompt event and allows installing', async () => {
        const promptMock = vi.fn().mockResolvedValue(undefined);
        const userChoiceMock = Promise.resolve({ outcome: 'accepted' });

        renderWithProviders(<PwaInstallPrompt />);

        // Simulate beforeinstallprompt event
        const installEvent = new Event('beforeinstallprompt');
        installEvent.prompt = promptMock;
        installEvent.userChoice = userChoiceMock;

        act(() => {
            window.dispatchEvent(installEvent);
            vi.advanceTimersByTime(3000);
        });

        // Prompt should be visible with Install button
        expect(screen.getByText(/Install App/i)).toBeInTheDocument();
        const installBtn = screen.getByRole('button', { name: /^Install$/i });
        expect(installBtn).toBeInTheDocument();

        // Clicking install should invoke prompt
        await act(async () => {
            fireEvent.click(installBtn);
        });

        expect(promptMock).toHaveBeenCalled();
    });

    it('opens manually via triggerPwaInstall()', () => {
        renderWithProviders(<PwaInstallPrompt />);

        act(() => {
            triggerPwaInstall();
        });

        expect(screen.getByText(/Install App|Install on iPhone/i)).toBeInTheDocument();
    });

    it('can be dismissed and snoozed in localStorage', () => {
        renderWithProviders(<PwaInstallPrompt />);

        act(() => {
            triggerPwaInstall();
        });

        const dismissBtn = screen.getByRole('button', { name: /Dismiss/i });
        fireEvent.click(dismissBtn);

        expect(localStorage.getItem('quran_pwa_prompt_dismissed_until')).toBeTruthy();
        expect(screen.queryByText(/Install App/i)).not.toBeInTheDocument();
    });
});
