import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import ScrollToTop from '../ScrollToTop';

describe('ScrollToTop', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.scrollTo = vi.fn();
        document.documentElement.scrollTop = 500;
        document.body.scrollTop = 500;
    });

    it('scrolls to (0, 0) and resets document scrollTop on mount and route change', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <ScrollToTop />
            </MemoryRouter>
        );

        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
        expect(document.documentElement.scrollTop).toBe(0);
        expect(document.body.scrollTop).toBe(0);
    });

    it('sets history.scrollRestoration to manual if supported', () => {
        Object.defineProperty(window.history, 'scrollRestoration', {
            writable: true,
            configurable: true,
            value: 'auto'
        });

        render(
            <MemoryRouter initialEntries={['/']}>
                <ScrollToTop />
            </MemoryRouter>
        );

        expect(window.history.scrollRestoration).toBe('manual');
    });
});
