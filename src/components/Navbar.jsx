import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
    Shield,
    LogOut
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
    const { isAuthenticated, user, isAdmin, logout, loading: authLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

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
        <>
            <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60" dir={dir}>
                <div className="container mx-auto flex h-20 items-center justify-between px-6">
                    {/* Logo Section */}
                    <NavLink to="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="Quran Video Logo" className="h-16 w-auto object-contain transition-transform group-hover:scale-105 duration-300" />
                    </NavLink>

                    {/* Desktop Navigation - Pill Shaped */}
                    <div className="hidden lg:flex items-center bg-muted/30 backdrop-blur-md rounded-full px-2 py-1.5 border border-border/20 shadow-sm transition-all duration-300 hover:shadow-md">
                        {filteredLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-10 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActive
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
                                    `flex items-center gap-3 px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActive
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
                    <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse">
                        {/* Language Selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 px-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 gap-3 font-medium">
                                    <Globe className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
                                    <span className="text-sm">{languages.find(l => l.code === language)?.label}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" dir={dir} className="z-110 rounded-2xl p-2 border-border/10 shadow-premium bg-card/95 backdrop-blur-xl">
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
                                className="h-10 px-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 gap-3 font-medium"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                            <div className="relative h-[1.1rem] w-[1.1rem]">
                                <Sun className="absolute inset-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" strokeWidth={1.5} />
                                <Moon className="absolute inset-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" strokeWidth={1.5} />
                            </div>
                            <span className="text-sm">{theme === 'dark' ? t('dark') : t('light')}</span>
                        </Button>

                        <div className="w-px h-6 bg-border/40 mx-2" />

                        {/* Auth Controls */}
                        <div className="px-1">
                            {!isCallbackPage && !authLoading && (
                                isAuthenticated ? <UserMenu /> : <LoginButton onClick={onAuthRequired} className="h-10 px-6 rounded-full shadow-premium hover-glow bg-primary text-primary-foreground border-none" />
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <Button variant="ghost" size="icon" onClick={toggleMenu} className="h-10 w-10 rounded-xl hover:bg-primary/10 transition-colors">
                            {isOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay - Refined UX & Aesthetics */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 top-[80px] z-[100] bg-background/95 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden overscroll-none" dir={dir}>
                    <div className="container mx-auto py-8 px-6 space-y-8 flex flex-col h-full overflow-hidden">
                        {/* Navigation Links */}
                        <div className="flex flex-col space-y-2 flex-grow overflow-hidden">
                            {filteredLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-5 p-5 rounded-3xl transition-all duration-300 ${isActive 
                                            ? "bg-primary/10 text-primary font-bold shadow-sm" 
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        }`
                                    }
                                >
                                    <link.icon className="h-6 w-6 shrink-0" strokeWidth={1.5} />
                                    <span className="text-xl font-medium">{link.label}</span>
                                </NavLink>
                            ))}
                            {isAuthenticated && isAdmin && (
                                <NavLink
                                    to="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-5 p-5 rounded-3xl transition-all duration-300 ${isActive 
                                            ? "bg-primary/10 text-primary font-bold shadow-sm" 
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        }`
                                    }
                                >
                                    <Shield className="h-6 w-6 shrink-0" strokeWidth={1.5} />
                                    <span className="text-xl font-medium">{t('navAdmin')}</span>
                                </NavLink>
                            )}
                        </div>

                        {/* User Actions & System Controls */}
                        <div className="pt-8 border-t border-border/10 space-y-8">
                            {/* Integrated User Section - No Redundant Trigger */}
                            {!isCallbackPage && !authLoading && (
                                isAuthenticated ? (
                                    <div className="bg-muted/30 p-6 rounded-[2.5rem] border border-border/10 space-y-6">
                                        <div className="flex items-center gap-4 px-2">
                                            <div className="h-14 w-14 rounded-full border border-border/20 shadow-premium overflow-hidden">
                                                {user?.avatar ? (
                                                    <img src={user.avatar} alt={user.display_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                                                        {user?.display_name?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="font-bold text-xl text-foreground truncate">{user?.display_name || user?.email?.split('@')[0]}</span>
                                                <span className="text-sm text-muted-foreground truncate">{user?.email}</span>
                                            </div>
                                        </div>

                                        <div className="h-px bg-border/10 w-full" />

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button 
                                                variant="ghost" 
                                                className="h-12 rounded-2xl gap-3 justify-start px-4 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    navigate('/history');
                                                }}
                                            >
                                                <History className="h-5 w-5" strokeWidth={1.5} />
                                                <span className="font-medium">{t('myHistory')}</span>
                                            </Button>

                                            <Button 
                                                variant="ghost" 
                                                className="h-12 rounded-2xl gap-3 justify-start px-4 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    logout();
                                                }}
                                            >
                                                <LogOut className="h-5 w-5" strokeWidth={1.5} />
                                                <span className="font-medium">{t('signOut')}</span>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <LoginButton 
                                        onClick={() => {
                                            setIsOpen(false);
                                            onAuthRequired();
                                        }} 
                                        className="w-full h-16 rounded-[2rem] text-xl shadow-premium bg-primary text-primary-foreground border-none font-bold" 
                                    />
                                )
                            )}

                            {/* System Settings (Language & Theme) */}
                            <div className="flex items-center justify-between gap-4 pb-12">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="flex-1 gap-3 rounded-[1.5rem] h-14 border-border/20 bg-muted/30 hover:bg-muted/50 transition-all duration-300">
                                            <Globe className="h-5 w-5" strokeWidth={1.5} />
                                            <span className="text-base font-semibold">{languages.find(l => l.code === language)?.label}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent dir={dir} className="z-110 rounded-[1.5rem] w-[var(--radix-dropdown-menu-trigger-width)] p-2">
                                        {languages.map((lang) => (
                                            <DropdownMenuItem key={lang.code} onClick={() => {
                                                setLanguage(lang.code);
                                                setIsOpen(false);
                                            }} className="rounded-xl p-4 gap-4 transition-all duration-200">
                                                <span className="text-2xl">{lang.flag}</span>
                                                <span className="font-medium">{lang.label}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                    variant="outline"
                                    className="flex-1 gap-3 rounded-[1.5rem] h-14 border-border/20 bg-muted/30 hover:bg-muted/50 transition-all duration-300"
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                >
                                    {theme === 'dark' ? <Moon className="h-5 w-5" strokeWidth={1.5} /> : <Sun className="h-5 w-5" strokeWidth={1.5} />}
                                    <span className="text-base font-semibold capitalize">{theme === 'dark' ? t('dark') : t('light')}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
