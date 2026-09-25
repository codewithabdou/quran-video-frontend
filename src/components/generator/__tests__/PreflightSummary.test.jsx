import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PreflightSummary from '../PreflightSummary';
import { ThemeLanguageProvider } from '../../../contexts/ThemeLanguageContext';

const renderWithTheme = (component) => {
    return render(
        <ThemeLanguageProvider>
            {component}
        </ThemeLanguageProvider>
    );
};

describe('PreflightSummary', () => {
    const mockPlan = {
        planHash: 'abc123456789',
        screens: [
            { id: 0, ayah: 1, text: 'بِسْمِ اللَّهِ', layout: { fits: true } },
            { id: 1, ayah: 2, text: 'الْحَمْدُ لِلَّهِ', layout: { fits: true } },
        ],
    };

    const mockTimedPlan = {
        planHash: 'abc123456789',
        screens: mockPlan.screens,
        duration: {
            recitationMs: 25000, // 25 seconds
        },
    };

    it('renders duration and screen count correctly', () => {
        renderWithTheme(
            <PreflightSummary
                plan={mockPlan}
                timedPlan={mockTimedPlan}
                loadingPreflight={false}
                loading={false}
                onGenerate={vi.fn()}
            />
        );

        expect(screen.getByText('25s / 180s')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // 2 screens
        expect(screen.getByText(/~30s/i)).toBeInTheDocument(); // 25s + 5s outro
    });

    it('disables generate button when duration exceeds 180s', () => {
        const longTimedPlan = {
            planHash: 'long123',
            screens: mockPlan.screens,
            duration: {
                recitationMs: 190000, // 190 seconds > 180s limit
            },
        };

        const onGenerate = vi.fn();
        renderWithTheme(
            <PreflightSummary
                plan={mockPlan}
                timedPlan={longTimedPlan}
                loadingPreflight={false}
                loading={false}
                onGenerate={onGenerate}
            />
        );

        const generateBtn = screen.getByRole('button', { name: /Generate Video/i });
        expect(generateBtn).toBeDisabled();
        expect(screen.getByText(/Recitation duration exceeds 180s limit/i)).toBeInTheDocument();
    });

    it('calls onGenerate when clicked on valid plan', () => {
        const onGenerate = vi.fn();
        renderWithTheme(
            <PreflightSummary
                plan={mockPlan}
                timedPlan={mockTimedPlan}
                loadingPreflight={false}
                loading={false}
                onGenerate={onGenerate}
            />
        );

        const generateBtn = screen.getByRole('button', { name: /Generate Video/i });
        expect(generateBtn).not.toBeDisabled();
        fireEvent.click(generateBtn);
        expect(onGenerate).toHaveBeenCalledTimes(1);
    });

    it('gracefully handles wrapped timedPlan object from API', () => {
        const wrappedTimedPlan = {
            timedPlan: mockTimedPlan,
            totalRecitationSeconds: 25,
            status: 'prepared',
        };

        renderWithTheme(
            <PreflightSummary
                plan={mockPlan}
                timedPlan={wrappedTimedPlan}
                loadingPreflight={false}
                loading={false}
                onGenerate={vi.fn()}
            />
        );

        expect(screen.getByText('25s / 180s')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // 2 screens
        expect(screen.getByText('Layout fits safe zone perfectly')).toBeInTheDocument();
    });

    it('falls back to plan screens and estimates duration when timedPlan is null', () => {
        renderWithTheme(
            <PreflightSummary
                plan={mockPlan}
                timedPlan={null}
                loadingPreflight={false}
                loading={false}
                onGenerate={vi.fn()}
            />
        );

        expect(screen.getByText('2')).toBeInTheDocument(); // 2 screens from plan
        expect(screen.getByText('8s / 180s')).toBeInTheDocument(); // 2 screens * 4s estimate
        expect(screen.getByText('Layout fits safe zone perfectly')).toBeInTheDocument();
    });
});

