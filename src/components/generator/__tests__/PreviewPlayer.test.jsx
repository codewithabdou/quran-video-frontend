import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import PreviewPlayer from '../PreviewPlayer';
import { ThemeLanguageProvider } from '../../../contexts/ThemeLanguageContext';
import * as videoApi from '../../../api/video';

vi.mock('../../../api/video', () => ({
    getPreviewFrame: vi.fn(),
}));

const renderWithTheme = (component) => {
    return render(
        <ThemeLanguageProvider>
            {component}
        </ThemeLanguageProvider>
    );
};

describe('PreviewPlayer', () => {
    const mockPlan = {
        planHash: 'hash_test_123',
        selection: { surah: 1 },
        screens: [
            { id: 0, ayah: 1, page: 1, pageCount: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', durationMs: 4000 },
            { id: 1, ayah: 2, page: 1, pageCount: 1, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', durationMs: 4000 },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        videoApi.getPreviewFrame.mockResolvedValue('blob:http://localhost:5173/mock-frame-url');
    });

    it('renders current screen and calls getPreviewFrame for frame buffer', async () => {
        renderWithTheme(
            <PreviewPlayer
                plan={mockPlan}
                backgroundUrl="default"
                platform="reel"
                resolution={720}
                loadingPlan={false}
                onRefreshPlan={vi.fn()}
            />
        );

        expect(screen.getByText(/Screen 1 of 2/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(videoApi.getPreviewFrame).toHaveBeenCalledWith({
                screen: mockPlan.screens[0],
                screenId: 0,
                platform: 'reel',
                resolution: 720,
            });
        });
    });

    it('navigates to next and previous screens on button clicks', async () => {
        renderWithTheme(
            <PreviewPlayer
                plan={mockPlan}
                backgroundUrl="default"
                platform="reel"
                resolution={720}
                loadingPlan={false}
                onRefreshPlan={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(screen.getByText(/Screen 1 of 2/i)).toBeInTheDocument();
        });

        // Next button has title Next Screen
        const nextButton = screen.getByTitle(/Next Screen/i);
        
        await act(async () => {
            fireEvent.click(nextButton);
        });

        expect(screen.getByText(/Screen 2 of 2/i)).toBeInTheDocument();
    });
});
