import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import GenerationResult from '../GenerationResult';
import { ThemeLanguageProvider } from '../../../contexts/ThemeLanguageContext';

const renderWithTheme = (component) => {
    return render(
        <ThemeLanguageProvider>
            {component}
        </ThemeLanguageProvider>
    );
};

describe('GenerationResult', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns null when neither loading nor videoUrl is present', () => {
        const { container } = renderWithTheme(
            <GenerationResult loading={false} videoUrl={null} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders loading progress state when loading is true', () => {
        renderWithTheme(
            <GenerationResult
                loading={true}
                videoUrl={null}
                progress={45}
                statusMessage="status_rendering"
            />
        );

        expect(screen.getByText('45%')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders cancel button when showCancel is true during loading', () => {
        const handleCancel = vi.fn();
        renderWithTheme(
            <GenerationResult
                loading={true}
                showCancel={true}
                onCancel={handleCancel}
                progress={30}
            />
        );

        const cancelBtn = screen.getByRole('button');
        expect(cancelBtn).toBeInTheDocument();
        fireEvent.click(cancelBtn);
        expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('renders completed video player, download button, and share button when videoUrl is provided', () => {
        const handleDismiss = vi.fn();
        renderWithTheme(
            <GenerationResult
                loading={false}
                videoUrl="blob:http://localhost:5173/mock-video.mp4"
                onDismiss={handleDismiss}
                platform="reel"
                formValues={{ surah: '1', ayah_start: 1, ayah_end: 1, resolution: '720', platform: 'reel' }}
            />
        );

        // Video element exists
        const video = document.querySelector('video');
        expect(video).toBeInTheDocument();
        expect(video).toHaveAttribute('src', 'blob:http://localhost:5173/mock-video.mp4');

        // Download and Share buttons exist
        expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();

        // Dismiss button exists and calls onDismiss
        const dismissBtn = screen.getByRole('button', { name: /dismiss|close|إغلاق/i });
        expect(dismissBtn).toBeInTheDocument();
        fireEvent.click(dismissBtn);
        expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
});
