import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import VerseSearch from '../VerseSearch';
import { ThemeLanguageProvider } from '../../../contexts/ThemeLanguageContext';
import * as videoApi from '../../../api/video';

vi.mock('../../../api/video', () => ({
    searchVerses: vi.fn(),
}));

const renderWithTheme = (component) => {
    return render(
        <ThemeLanguageProvider>
            {component}
        </ThemeLanguageProvider>
    );
};

describe('VerseSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders input with placeholder', () => {
        renderWithTheme(<VerseSearch onSelectRange={vi.fn()} />);
        const input = screen.getByPlaceholderText(/Search word, phrase, or reference/i);
        expect(input).toBeInTheDocument();
    });

    it('triggers debounced search on input change', async () => {
        videoApi.searchVerses.mockResolvedValueOnce({
            total: 1,
            results: [
                {
                    surah: 2,
                    surahName: 'Al-Baqarah',
                    numberInSurah: 255,
                    text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
                    translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.',
                    matchType: 'reference',
                },
            ],
        });

        const handleSelectRange = vi.fn();
        renderWithTheme(<VerseSearch onSelectRange={handleSelectRange} />);

        const input = screen.getByPlaceholderText(/Search word, phrase, or reference/i);
        fireEvent.change(input, { target: { value: '2:255' } });

        await waitFor(() => {
            expect(videoApi.searchVerses).toHaveBeenCalledWith({ q: '2:255', limit: 12 });
        });

        await waitFor(() => {
            expect(screen.getByText('Al-Baqarah')).toBeInTheDocument();
            expect(screen.getByText('2:255')).toBeInTheDocument();
        });

        // Click the Select Ayah button
        const selectBtn = screen.getByRole('button', { name: /Select Ayah/i });
        fireEvent.click(selectBtn);

        expect(handleSelectRange).toHaveBeenCalledWith({
            surah: '2',
            startAyah: 255,
            endAyah: 255,
        });
    });
});
