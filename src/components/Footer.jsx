import React from 'react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Github, Linkedin } from 'lucide-react';

const Footer = () => {
    const { t, dir } = useThemeLanguage();

    return (
        <footer className="w-full bg-background border-t border-border mt-auto" dir={dir}>
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center gap-4 text-center">

                {/* Main Credit */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-foreground font-medium text-base sm:text-lg">
                    <span>{t('footerMadeWith')}</span>
                    <span className="text-primary font-bold">
                        {t('footerName')}
                    </span>
                </div>

                {/* Dua Message */}
                <p className="text-lg md:text-xl text-primary font-bold tracking-wide mt-2" dir="rtl">
                    {t('footerDua')}
                </p>

                {/* Social Links */}
                <div className="flex items-center gap-4 mt-4">
                    <a
                        href="https://github.com/codewithabdou"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                        aria-label="GitHub Profile"
                    >
                        <Github className="w-5 h-5" />
                        <span className="sr-only">GitHub</span>
                    </a>
                    <a
                        href="https://www.linkedin.com/in/khaled-abderrahmène-habouche-82605626b/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                        aria-label="LinkedIn Profile"
                    >
                        <Linkedin className="w-5 h-5" />
                        <span className="sr-only">LinkedIn</span>
                    </a>
                </div>

                {/* Copyright */}
                <p className="text-sm text-muted-foreground mt-4">
                    &copy; {new Date().getFullYear()} {t('footerName')}. {t('footerRights')}
                </p>

            </div>
        </footer>
    );
};

export default Footer;
