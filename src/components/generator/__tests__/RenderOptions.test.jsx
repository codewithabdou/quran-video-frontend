import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RenderOptions from '../RenderOptions';
import { ThemeLanguageProvider } from '../../../contexts/ThemeLanguageContext';

// Mock BackgroundSelector so tests focus on RenderOptions logic
vi.mock('../../BackgroundSelector', () => ({
    default: ({ value, onChange }) => (
        <div data-testid="mock-background-selector" onClick={() => onChange('https://example.com/bg.mp4')}>
            Background: {value}
        </div>
    ),
}));

const renderWithTheme = (component) => {
    return render(
        <ThemeLanguageProvider>
            {component}
        </ThemeLanguageProvider>
    );
};

describe('RenderOptions', () => {
    it('renders format toggles and switches platform on click', () => {
        const onChangePlatform = vi.fn();
        const onChangeTextMode = vi.fn();

        renderWithTheme(
            <RenderOptions
                platform="reel"
                onChangePlatform={onChangePlatform}
                textMode="bilingual"
                onChangeTextMode={onChangeTextMode}
                reciterId="ar.alafasy"
                onChangeReciter={vi.fn()}
                resolution="720"
                onChangeResolution={vi.fn()}
                backgroundUrl="default"
                onChangeBackground={vi.fn()}
            />
        );

        expect(screen.getByText('9:16 Reel')).toBeInTheDocument();
        expect(screen.getByText('16:9 Video')).toBeInTheDocument();

        // Click on 16:9 Video button
        fireEvent.click(screen.getByText('16:9 Video'));
        expect(onChangePlatform).toHaveBeenCalledWith('youtube');
    });

    it('toggles text display mode between bilingual and arabic_only', () => {
        const onChangeTextMode = vi.fn();

        renderWithTheme(
            <RenderOptions
                platform="reel"
                onChangePlatform={vi.fn()}
                textMode="bilingual"
                onChangeTextMode={onChangeTextMode}
                reciterId="ar.alafasy"
                onChangeReciter={vi.fn()}
                resolution="720"
                onChangeResolution={vi.fn()}
                backgroundUrl="default"
                onChangeBackground={vi.fn()}
            />
        );

        const arabicOnlyBtn = screen.getByText(/Arabic Only/i);
        fireEvent.click(arabicOnlyBtn);
        expect(onChangeTextMode).toHaveBeenCalledWith('arabic_only');
    });
});
