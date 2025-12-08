import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../lib/translations';

const ThemeLanguageContext = createContext();

export const ThemeLanguageProvider = ({ children }) => {
    // Language State
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

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

    const t = (key) => {
        return translations[language][key] || key;
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

export const useThemeLanguage = () => useContext(ThemeLanguageContext);
