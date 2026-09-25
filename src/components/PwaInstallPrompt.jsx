import React, { useState, useEffect } from 'react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Download, X, Share2, PlusSquare, Smartphone, Check } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const DISMISS_STORAGE_KEY = 'quran_pwa_prompt_dismissed_until';
const DISMISS_DURATION_DAYS = 7;

export const triggerPwaInstall = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-pwa-install'));
    }
};

const PwaInstallPrompt = () => {
    const { t, dir } = useThemeLanguage();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [installedSuccess, setInstalledSuccess] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if already running in standalone mode (installed PWA)
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://');

        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
        setIsIOS(isIosDevice);

        // Check if dismissed recently
        const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
        const isDismissed = dismissedUntil && Number(dismissedUntil) > Date.now();

        // 1. Android / Chrome / Desktop event listener
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            if (!isDismissed) {
                // Show after brief polite delay
                const timer = setTimeout(() => setIsVisible(true), 2500);
                return () => clearTimeout(timer);
            }
        };

        // 2. iOS Safari detection (Safari does not fire beforeinstallprompt)
        if (isIosDevice && !isDismissed) {
            const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios/.test(userAgent);
            if (isSafari) {
                const timer = setTimeout(() => setIsVisible(true), 3000);
                return () => clearTimeout(timer);
            }
        }

        // 3. Listen for manual trigger from "More" drawer
        const handleManualOpen = () => {
            setIsVisible(true);
        };

        // 4. App installed listener
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsVisible(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        window.addEventListener('open-pwa-install', handleManualOpen);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('open-pwa-install', handleManualOpen);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                setInstalledSuccess(true);
                setTimeout(() => {
                    setIsVisible(false);
                    setDeferredPrompt(null);
                }, 1500);
            } else {
                handleDismiss();
            }
        } catch {
            handleDismiss();
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        // Snooze for 7 days
        const snoozeDate = Date.now() + DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000;
        localStorage.setItem(DISMISS_STORAGE_KEY, snoozeDate.toString());
    };

    if (isInstalled || !isVisible) return null;

    return (
        <div
            dir={dir}
            className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        >
            <div className="bg-card/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-primary/20 dark:border-primary/30 p-4 sm:p-5 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] relative overflow-hidden">
                {/* Subtle Decorative Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                {/* Close Button */}
                <button
                    type="button"
                    onClick={handleDismiss}
                    className="absolute top-3 end-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3.5">
                    {/* App Logo */}
                    <div className="w-12 h-12 rounded-2xl border border-border/40 bg-muted/30 p-1 flex items-center justify-center shrink-0 shadow-sm">
                        <img src="/logo.png" alt="Quran Video" className="w-full h-full object-contain" />
                    </div>

                    {/* App Info */}
                    <div className="flex-1 min-w-0 pe-4">
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-foreground truncate">
                                {isIOS ? t('iosInstallTitle') : t('installAppTitle')}
                            </h3>
                            <Smartphone className="w-3.5 h-3.5 text-primary shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                            {t('installAppDesc')}
                        </p>
                    </div>
                </div>

                {/* iOS Instructions vs Android Direct Install Button */}
                {isIOS ? (
                    <div className="mt-3.5 pt-3 border-t border-border/20 space-y-2 text-xs">
                        <div className="flex items-center gap-2.5 text-foreground/90 bg-muted/30 p-2 rounded-xl">
                            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                <Share2 className="w-3.5 h-3.5" />
                            </div>
                            <span className="leading-tight">{t('iosInstallStep1')}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-foreground/90 bg-muted/30 p-2 rounded-xl">
                            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                <PlusSquare className="w-3.5 h-3.5" />
                            </div>
                            <span className="leading-tight">{t('iosInstallStep2')}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDismiss}
                            className="w-full mt-2 h-9 rounded-xl text-xs font-semibold"
                        >
                            {t('installLater')}
                        </Button>
                    </div>
                ) : (
                    <div className="mt-3.5 flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handleInstallClick}
                            disabled={installedSuccess}
                            className="flex-1 h-9.5 rounded-full font-bold text-xs bg-primary text-primary-foreground shadow-sm hover:opacity-90 gap-1.5"
                        >
                            {installedSuccess ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>{t('appInstalled')}</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{t('installBtn')}</span>
                                </>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDismiss}
                            className="h-9.5 px-3 rounded-full text-xs text-muted-foreground hover:text-foreground"
                        >
                            {t('installLater')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PwaInstallPrompt;
