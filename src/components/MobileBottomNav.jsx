import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
    Home,
    BookOpen,
    Video,
    Clock,
    Grid,
    Radio,
    Heart,
    History,
    Shield,
    Sun,
    Moon,
    Globe,
    LogOut,
    X,
    User,
    Download,
} from 'lucide-react';
import { triggerPwaInstall } from './PwaInstallPrompt';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';

const MobileBottomNav = ({ onAuthRequired }) => {
    const { t, language, setLanguage, theme, setTheme, dir } = useThemeLanguage();
    const { isAuthenticated, user, isAdmin, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const isSecondaryRouteActive = ['/quran', '/azkar', '/history', '/admin'].includes(location.pathname);

    const languages = [
        { code: 'ar', label: 'العربية', flag: '🇸🇦' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
    ];

    const handleNavigate = (path) => {
        setIsDrawerOpen(false);
        navigate(path);
    };

    return (
        <>
            {/* Bottom Navigation Bar — Mobile Only */}
            <nav
                className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-card/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-t border-border/20 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.45)] pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1 px-2 transition-colors duration-300"
                dir={dir}
                aria-label="Mobile Navigation"
            >
                <div className="grid grid-cols-5 items-center justify-items-center h-[58px] max-w-lg mx-auto">
                    {/* Tab 1: Home */}
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center w-full h-full py-0.5 transition-all duration-200 select-none group",
                                isActive
                                    ? "text-primary font-bold"
                                    : "text-muted-foreground hover:text-foreground font-medium"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    "flex items-center justify-center transition-transform duration-200",
                                    isActive ? "scale-110" : "group-hover:scale-105"
                                )}>
                                    <Home className="w-5 h-5" strokeWidth={isActive ? 2.4 : 1.75} />
                                </div>
                                <span className={cn(
                                    "text-[11px] leading-tight tracking-tight truncate max-w-[64px] transition-colors duration-200 mt-0.5",
                                    isActive ? "font-bold text-primary" : "font-medium"
                                )}>
                                    {t('navHome')}
                                </span>
                                <div className="h-1 flex items-center justify-center mt-0.5">
                                    <span
                                        className={cn(
                                            "h-1 rounded-full bg-primary transition-all duration-300 ease-out",
                                            isActive
                                                ? "w-2.5 opacity-100 shadow-xs shadow-primary/40"
                                                : "w-0 opacity-0"
                                        )}
                                    />
                                </div>
                            </>
                        )}
                    </NavLink>

                    {/* Tab 2: Mushaf */}
                    <NavLink
                        to="/mushaf"
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center w-full h-full py-0.5 transition-all duration-200 select-none group",
                                isActive
                                    ? "text-primary font-bold"
                                    : "text-muted-foreground hover:text-foreground font-medium"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    "flex items-center justify-center transition-transform duration-200",
                                    isActive ? "scale-110" : "group-hover:scale-105"
                                )}>
                                    <BookOpen className="w-5 h-5" strokeWidth={isActive ? 2.4 : 1.75} />
                                </div>
                                <span className={cn(
                                    "text-[11px] leading-tight tracking-tight truncate max-w-[64px] transition-colors duration-200 mt-0.5",
                                    isActive ? "font-bold text-primary" : "font-medium"
                                )}>
                                    {t('navMushaf')}
                                </span>
                                <div className="h-1 flex items-center justify-center mt-0.5">
                                    <span
                                        className={cn(
                                            "h-1 rounded-full bg-primary transition-all duration-300 ease-out",
                                            isActive
                                                ? "w-2.5 opacity-100 shadow-xs shadow-primary/40"
                                                : "w-0 opacity-0"
                                        )}
                                    />
                                </div>
                            </>
                        )}
                    </NavLink>

                    {/* Tab 3 (Center HERO): Video Generator */}
                    <NavLink
                        to="/generate"
                        className={({ isActive }) =>
                            cn(
                                "relative -top-5 flex flex-col items-center justify-center group focus:outline-none select-none transition-all duration-300",
                                isActive ? "scale-105" : "hover:scale-105"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "w-14 h-14 rounded-full bg-gradient-to-tr from-primary via-amber-500 to-primary text-primary-foreground flex items-center justify-center shadow-lg transition-all duration-300 border-4 border-background dark:border-zinc-950",
                                        isActive
                                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-primary/50"
                                            : "shadow-primary/30 group-active:scale-95"
                                    )}
                                >
                                    <Video className="w-6 h-6 fill-current" strokeWidth={2} />
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-bold tracking-tight mt-1 whitespace-nowrap",
                                        isActive ? "text-primary font-black" : "text-foreground font-bold"
                                    )}
                                >
                                    {t('navGenerator')}
                                </span>
                            </div>
                        )}
                    </NavLink>

                    {/* Tab 4: Prayers */}
                    <NavLink
                        to="/prayer-times"
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center w-full h-full py-0.5 transition-all duration-200 select-none group",
                                isActive
                                    ? "text-primary font-bold"
                                    : "text-muted-foreground hover:text-foreground font-medium"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    "flex items-center justify-center transition-transform duration-200",
                                    isActive ? "scale-110" : "group-hover:scale-105"
                                )}>
                                    <Clock className="w-5 h-5" strokeWidth={isActive ? 2.4 : 1.75} />
                                </div>
                                <span className={cn(
                                    "text-[11px] leading-tight tracking-tight truncate max-w-[64px] transition-colors duration-200 mt-0.5",
                                    isActive ? "font-bold text-primary" : "font-medium"
                                )}>
                                    {t('navPrayers')}
                                </span>
                                <div className="h-1 flex items-center justify-center mt-0.5">
                                    <span
                                        className={cn(
                                            "h-1 rounded-full bg-primary transition-all duration-300 ease-out",
                                            isActive
                                                ? "w-2.5 opacity-100 shadow-xs shadow-primary/40"
                                                : "w-0 opacity-0"
                                        )}
                                    />
                                </div>
                            </>
                        )}
                    </NavLink>

                    {/* Tab 5: More Drawer Trigger */}
                    <button
                        type="button"
                        onClick={() => setIsDrawerOpen(true)}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full py-0.5 transition-all duration-200 select-none focus:outline-none group",
                            isSecondaryRouteActive || isDrawerOpen
                                ? "text-primary font-bold"
                                : "text-muted-foreground hover:text-foreground font-medium"
                        )}
                        aria-label={t('navMore')}
                    >
                        <div className={cn(
                            "relative flex items-center justify-center transition-transform duration-200",
                            (isSecondaryRouteActive || isDrawerOpen) ? "scale-110" : "group-hover:scale-105"
                        )}>
                            <Grid className="w-5 h-5" strokeWidth={isSecondaryRouteActive || isDrawerOpen ? 2.4 : 1.75} />
                            {isSecondaryRouteActive && (
                                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-background" />
                            )}
                        </div>
                        <span className={cn(
                            "text-[11px] leading-tight tracking-tight truncate max-w-[64px] transition-colors duration-200 mt-0.5",
                            (isSecondaryRouteActive || isDrawerOpen) ? "font-bold text-primary" : "font-medium"
                        )}>
                            {t('navMore')}
                        </span>
                        <div className="h-1 flex items-center justify-center mt-0.5">
                            <span
                                className={cn(
                                    "h-1 rounded-full bg-primary transition-all duration-300 ease-out",
                                    isSecondaryRouteActive || isDrawerOpen
                                        ? "w-2.5 opacity-100 shadow-xs shadow-primary/40"
                                        : "w-0 opacity-0"
                                )}
                            />
                        </div>
                    </button>
                </div>
            </nav>

            {/* Native-Feel Bottom Sheet (More Menu) */}
            <Dialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DialogContent
                    dir={dir}
                    hideCloseButton={true}
                    className="fixed inset-x-0 bottom-0 top-auto translate-x-0 translate-y-0 w-full max-w-lg mx-auto rounded-t-[2rem] rounded-b-none border-t border-border/20 bg-card dark:bg-zinc-950 p-5 pb-[max(env(safe-area-inset-bottom),1.75rem)] shadow-2xl data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom duration-300 md:hidden max-h-[88vh] overflow-y-auto outline-none"
                >
                    {/* Pull Handle */}
                    <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 mx-auto -mt-1 mb-3 shrink-0" />

                    <div className="flex items-center justify-between pb-2 shrink-0">
                        <DialogTitle className="text-lg font-black text-foreground">
                            {t('navMore')}
                        </DialogTitle>
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(false)}
                            className="w-8 h-8 rounded-full bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors focus:outline-none"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <DialogDescription className="sr-only">
                            {t('navMore')}
                        </DialogDescription>
                    </div>

                    <div className="space-y-3.5">
                        {/* Secondary Feature Grid */}
                        <div className="grid grid-cols-2 gap-2.5">
                            {/* Quran & Radio */}
                            <button
                                type="button"
                                onClick={() => handleNavigate('/quran')}
                                className={cn(
                                    "flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-start group select-none",
                                    location.pathname === '/quran'
                                        ? "bg-primary/10 border-primary/35 text-primary font-bold shadow-xs"
                                        : "bg-muted/25 border-border/10 text-foreground hover:bg-muted/40"
                                )}
                            >
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-active:scale-95",
                                    location.pathname === '/quran' ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                                )}>
                                    <Radio className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-xs sm:text-sm text-foreground truncate">{t('navQuran')}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">
                                        {language === 'ar' ? 'إذاعات وتلاوة' : (language === 'fr' ? 'Récitations & Radio' : 'Audio & Radio')}
                                    </p>
                                </div>
                            </button>

                            {/* Azkar */}
                            <button
                                type="button"
                                onClick={() => handleNavigate('/azkar')}
                                className={cn(
                                    "flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-start group select-none",
                                    location.pathname === '/azkar'
                                        ? "bg-primary/10 border-primary/35 text-primary font-bold shadow-xs"
                                        : "bg-muted/25 border-border/10 text-foreground hover:bg-muted/40"
                                )}
                            >
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-active:scale-95",
                                    location.pathname === '/azkar' ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                                )}>
                                    <Heart className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-xs sm:text-sm text-foreground truncate">{t('navAzkar')}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">
                                        {language === 'ar' ? 'حصن المسلم' : (language === 'fr' ? 'Invocations' : 'Daily Azkar')}
                                    </p>
                                </div>
                            </button>

                            {/* History */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        setIsDrawerOpen(false);
                                        if (onAuthRequired) onAuthRequired();
                                    } else {
                                        handleNavigate('/history');
                                    }
                                }}
                                className={cn(
                                    "flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-start group select-none",
                                    location.pathname === '/history'
                                        ? "bg-primary/10 border-primary/35 text-primary font-bold shadow-xs"
                                        : "bg-muted/25 border-border/10 text-foreground hover:bg-muted/40"
                                )}
                            >
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-active:scale-95",
                                    location.pathname === '/history' ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                                )}>
                                    <History className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-xs sm:text-sm text-foreground truncate">{t('myHistory')}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">
                                        {language === 'ar' ? 'مقاطعي السابقة' : (language === 'fr' ? 'Mes vidéos' : 'My Videos')}
                                    </p>
                                </div>
                            </button>

                            {/* Admin (Only if Admin) */}
                            {isAuthenticated && isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => handleNavigate('/admin')}
                                    className={cn(
                                        "flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-start group select-none",
                                        location.pathname === '/admin'
                                            ? "bg-primary/10 border-primary/35 text-primary font-bold shadow-xs"
                                            : "bg-muted/25 border-border/10 text-foreground hover:bg-muted/40"
                                    )}
                                >
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-active:scale-95",
                                        location.pathname === '/admin' ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                                    )}>
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-xs sm:text-sm text-foreground truncate">{t('navAdmin')}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {language === 'ar' ? 'لوحة التحكم' : (language === 'fr' ? 'Administration' : 'Admin Portal')}
                                        </p>
                                    </div>
                                </button>
                            )}
                        </div>

                        {/* Install App Prompt Trigger */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsDrawerOpen(false);
                                triggerPwaInstall();
                            }}
                            className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl border border-primary/30 bg-primary/10 hover:bg-primary/15 transition-all text-start group select-none"
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs transition-transform group-active:scale-95">
                                    <Download className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-xs sm:text-sm text-foreground truncate">{t('installAppTitle')}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">
                                        {language === 'ar' ? 'تثبيت سريع كتطبيق أصلي' : (language === 'fr' ? 'Installer sur votre téléphone' : 'Add to home screen')}
                                    </p>
                                </div>
                            </div>
                            <span className="shrink-0 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs">
                                {t('installBtn')}
                            </span>
                        </button>

                        {/* System Controls: Language Switcher */}
                        <div className="flex items-center gap-1.5 p-1 bg-muted/20 rounded-2xl border border-border/10">
                            {languages.map((l) => (
                                <button
                                    key={l.code}
                                    type="button"
                                    onClick={() => setLanguage(l.code)}
                                    className={cn(
                                        "flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 select-none",
                                        language === l.code
                                            ? "bg-card dark:bg-zinc-800 text-foreground shadow-xs border border-border/20"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span className="text-sm">{l.flag}</span>
                                    <span>{l.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* System Controls: Theme Switcher */}
                        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/20 border border-border/10">
                            <div className="flex items-center gap-2.5 ms-1">
                                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-primary" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                                </div>
                                <span className="text-xs font-bold text-foreground">
                                    {language === 'ar' ? 'مظهر التطبيق' : (language === 'fr' ? 'Thème visuel' : 'Appearance')}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 p-0.5 bg-muted/30 rounded-xl border border-border/10">
                                <button
                                    type="button"
                                    onClick={() => setTheme('light')}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all select-none",
                                        theme === 'light'
                                            ? "bg-card dark:bg-zinc-800 text-foreground shadow-xs"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                                    <span>{t('light')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTheme('dark')}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all select-none",
                                        theme === 'dark'
                                            ? "bg-card dark:bg-zinc-800 text-foreground shadow-xs"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Moon className="w-3.5 h-3.5 text-primary" />
                                    <span>{t('dark')}</span>
                                </button>
                            </div>
                        </div>

                        {/* User Account / Auth Section */}
                        <div className="pt-1 border-t border-border/10">
                            {isAuthenticated ? (
                                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/20 border border-border/10">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden ring-2 ring-primary/20">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                                            ) : (
                                                user?.display_name?.charAt(0) || <User className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-xs sm:text-sm text-foreground truncate">
                                                {user?.display_name || user?.email?.split('@')[0]}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDrawerOpen(false);
                                            logout();
                                        }}
                                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold transition-colors"
                                        title={t('signOut')}
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>{t('signOut')}</span>
                                    </button>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setIsDrawerOpen(false);
                                        if (onAuthRequired) onAuthRequired();
                                    }}
                                    className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-bold shadow-md hover:scale-[1.01] transition-all text-xs"
                                >
                                    {t('signIn') || 'Sign In'}
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MobileBottomNav;
