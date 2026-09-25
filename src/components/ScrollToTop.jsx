import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that whenever the user navigates between pages
 * (via navbar, mobile tabs, CTA buttons, links, or browser back/forward),
 * the viewport and document root always scroll immediately to top: 0.
 */
const ScrollToTop = () => {
    const { pathname, search } = useLocation();

    // Disable browser's automatic scroll restoration on history navigation
    useEffect(() => {
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    useEffect(() => {
        const scrollToTop = () => {
            try {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            } catch {
                window.scrollTo(0, 0);
            }
            if (document.documentElement) {
                document.documentElement.scrollTop = 0;
            }
            if (document.body) {
                document.body.scrollTop = 0;
            }
        };

        // Scroll immediately
        scrollToTop();

        // Secondary check via RAF to account for any lazy-loaded/Suspense layout shifts
        const rafId = requestAnimationFrame(scrollToTop);

        return () => cancelAnimationFrame(rafId);
    }, [pathname, search]);

    return null;
};

export default ScrollToTop;
