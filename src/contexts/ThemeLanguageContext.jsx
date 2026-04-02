// @refresh reset
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../lib/translations';

const ThemeLanguageContext = createContext({
    language: 'en',
    setLanguage: () => {},
    theme: 'system',
    setTheme: () => {},
    t: (key) => key,
    dir: 'ltr'
});

export const ThemeLanguageProvider = ({ children }) => {
    // Language State
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
        
        // Update root attributes for global CSS targeting
        const root = window.document.documentElement;
        root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
        root.setAttribute('lang', language);
    }, [language]);

    // Theme State
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'system';
        }
        return 'system';
    });

    // Handle Theme Change
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(theme);
    }, [theme]);

    useEffect(() => {
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
                const root = window.document.documentElement;
                root.classList.remove('light', 'dark');
                root.classList.add(mediaQuery.matches ? 'dark' : 'light');
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    const setThemeState = (newTheme) => {
        setTheme(newTheme);
    };

    const t = (key, params = {}) => {
        let translation = translations[language]?.[key] || translations['en']?.[key] || key;
        if (params && typeof translation === 'string') {
            Object.keys(params).forEach(paramKey => {
                translation = translation.replace(`{{${paramKey}}}`, params[paramKey]);
            });
        }
        return translation;
    };

    return (
        <ThemeLanguageContext.Provider value={{
            language,
            setLanguage,
            theme,
            setTheme: setThemeState,
            t,
            dir: language === 'ar' ? 'rtl' : 'ltr'
        }}>
            {children}
        </ThemeLanguageContext.Provider>
    );
};

export const useThemeLanguage = () => {
    const context = useContext(ThemeLanguageContext);
    if (context === undefined) {
        throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
    }
    return context;
};
