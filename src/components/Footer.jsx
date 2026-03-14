import React from 'react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Github, Linkedin } from 'lucide-react';

const Footer = () => {
    const { t, dir } = useThemeLanguage();

    return (
        <footer className="w-full bg-sacred-cream/50 dark:bg-sacred-obsidian/50 border-t border-border/10 py-12 transition-colors duration-300" dir={dir}>
            <div className="container mx-auto px-6 flex flex-col items-center justify-center gap-6 text-center">

                {/* Main Credit */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-foreground/80 font-medium text-lg lg:text-xl">
                    <span>{t('footerMadeWith')}</span>
                    <span className="text-primary font-serif italic font-bold">
                        {t('footerName')}
                    </span>
                </div>

                {/* Dua Message */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <p className="relative text-2xl md:text-3xl text-primary font-arabic leading-relaxed mt-2" dir="rtl">
                        {t('footerDua')}
                    </p>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-6 mt-4">
                    <a
                        href="https://github.com/codewithabdou"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center gap-2"
                        aria-label="GitHub Profile"
                    >
                        <div className="bg-muted/50 p-3 rounded-full group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300 group-hover:scale-110 shadow-sm">
                            <Github className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary">{t('github')}</span>
                    </a>
                    <a
                        href="https://www.linkedin.com/in/khaled-abderrahmène-habouche-82605626b/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center gap-2"
                        aria-label="LinkedIn Profile"
                    >
                        <div className="bg-muted/50 p-3 rounded-full group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300 group-hover:scale-110 shadow-sm">
                            <Linkedin className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary">{t('linkedin')}</span>
                    </a>
                </div>

                {/* Copyright */}
                <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="h-px w-12 bg-primary/20 rounded-full"></div>
                    <p className="text-sm text-muted-foreground/60 tracking-wide font-medium">
                        &copy; {new Date().getFullYear()} {t('footerName')}. {t('footerRights')}
                    </p>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
