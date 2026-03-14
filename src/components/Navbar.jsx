import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
    Menu,
    X,
    Home,
    Video,
    History,
    Moon,
    Sun,
    Globe,
    User,
    Shield
} from 'lucide-react';
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserMenu from './UserMenu';
import LoginButton from './LoginButton';

const Navbar = ({ onAuthRequired }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage, theme, setTheme, t, dir } = useThemeLanguage();
    const { isAuthenticated, user, isAdmin, loading: authLoading } = useAuth();
    const location = useLocation();

    const languages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'ar', label: 'العربية', flag: '🇸🇦' }
    ];

    const navLinks = [
        { to: '/', label: t('navHome'), icon: Home },
        { to: '/generate', label: t('navGenerator'), icon: Video },
        { to: '/history', label: t('navHistory'), icon: History, protected: true },
    ];

    const filteredLinks = navLinks.filter(link => !link.protected || isAuthenticated);

    const toggleMenu = () => setIsOpen(!isOpen);

    const isCallbackPage = location.pathname === '/auth/callback';

    return (
        <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60" dir={dir}>
            <div className="container mx-auto flex h-20 items-center justify-between px-6">
                {/* Logo Section */}
                <NavLink to="/" className="flex items-center gap-3 rtl:gap-3-reverse group">
                    <span className="text-2xl font-serif font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {t('appTitle') || "Quran Video"}
                    </span>
                </NavLink>

                {/* Desktop Navigation - Pill Shaped */}
                <div className="hidden lg:flex items-center bg-muted/30 backdrop-blur-md rounded-full px-2 py-1.5 border border-border/20 shadow-sm transition-all duration-300 hover:shadow-md">
                    {filteredLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `flex items-center space-x-2 rtl:gap-reverse px-10 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`
                            }
                        >
                            <link.icon className="h-4 w-4" strokeWidth={1.5} />
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                    {isAuthenticated && isAdmin && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                `flex items-center space-x-2 rtl:space-x-reverse px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`
                            }
                        >
                            <Shield className="h-4 w-4" strokeWidth={1.5} />
                            <span>{t('navAdmin')}</span>
                        </NavLink>
                    )}
                </div>

                {/* Desktop Controls */}
                <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
                    {/* Language Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                                <Globe className="h-[1.2rem] w-[1.2rem]" strokeWidth={1.5} />
                                <span className="sr-only">{t('switchLanguage')}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl p-2 border-border/20 shadow-xl">
                            {languages.map((lang) => (
                                <DropdownMenuItem
                                    key={lang.code}
                                    onClick={() => setLanguage(lang.code)}
                                    className={`flex items-center gap-3 cursor-pointer rounded-xl p-3 transition-colors ${language === lang.code ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted'}`}
                                >
                                    <span className="text-xl">{lang.flag}</span>
                                    <span className="text-sm">{lang.label}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" strokeWidth={1.5} />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" strokeWidth={1.5} />
                        <span className="sr-only">{t('toggleTheme')}</span>
                    </Button>

                    {/* Auth Controls */}
                    <div className="px-2">
                        {!isCallbackPage && !authLoading && (
                            isAuthenticated ? <UserMenu /> : <LoginButton onClick={onAuthRequired} className="h-10 px-6 rounded-full shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300" />
                        )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                    <Button variant="ghost" size="icon" onClick={toggleMenu} className="h-12 w-12 rounded-full hover:bg-primary/10">
                        {isOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-border/10 bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-4 duration-300 rounded-b-3xl shadow-2xl overflow-hidden">
                    <div className="container mx-auto py-6 px-6 space-y-6">
                        <div className="flex flex-col space-y-3">
                            {filteredLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center space-x-4 rtl:space-x-reverse p-4 rounded-2xl transition-all duration-300 ${isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02] font-bold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        }`
                                    }
                                >
                                    <link.icon className="h-5 w-5" strokeWidth={1.5} />
                                    <span className="text-base">{link.label}</span>
                                </NavLink>
                            ))}
                            {isAuthenticated && isAdmin && (
                                <NavLink
                                    to="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center space-x-4 rtl:space-x-reverse p-4 rounded-2xl transition-all duration-300 ${isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02] font-bold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        }`
                                    }
                                >
                                    <Shield className="h-5 w-5" strokeWidth={1.5} />
                                    <span className="text-base">{t('navAdmin')}</span>
                                </NavLink>
                            )}
                        </div>

                        <div className="pt-6 border-t border-border/10 flex items-center justify-between">
                            <div className="flex space-x-3 rtl:space-x-reverse">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2 rounded-full h-10 px-4 border-border/20">
                                            <Globe className="h-4 w-4" strokeWidth={1.5} />
                                            {languages.find(l => l.code === language)?.flag}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="rounded-2xl">
                                        {languages.map((lang) => (
                                            <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)} className="rounded-xl">
                                                {lang.flag} {lang.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full h-10 w-10 p-0 border-border/20"
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                >
                                    {theme === 'dark' ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
                                </Button>
                            </div>

                            <div className="scale-110">
                                {!isCallbackPage && !authLoading && (
                                    isAuthenticated ? <UserMenu /> : <LoginButton onClick={onAuthRequired} className="px-5 py-2 rounded-full" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
