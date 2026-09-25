import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Layers, AlertTriangle, CheckCircle2, RotateCw, Video as VideoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getPreviewFrame } from '@/api/video';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

const PreviewPlayer = ({
    plan,
    backgroundUrl,
    platform = 'reel',
    resolution = 720,
    loadingPlan = false,
    onRefreshPlan,
}) => {
    const { t, language, dir } = useThemeLanguage();
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    const [frameUrl, setFrameUrl] = useState(null);
    const [loadingFrame, setLoadingFrame] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const playTimerRef = useRef(null);
    const frameCacheRef = useRef(new Map());

    const screens = plan?.screens || [];
    const totalScreens = screens.length;
    const currentScreen = screens[currentScreenIndex] || screens[0];

    // Reset screen index if out of bounds when plan updates
    useEffect(() => {
        if (currentScreenIndex >= totalScreens) {
            setCurrentScreenIndex(0);
        }
    }, [totalScreens, currentScreenIndex]);

    // Fetch transparent PNG frame for current screen
    useEffect(() => {
        if (!currentScreen) {
            setFrameUrl(null);
            return;
        }

        const cacheKey = `${plan.planHash}_${currentScreen.id}_${resolution}`;
        if (frameCacheRef.current.has(cacheKey)) {
            setFrameUrl(frameCacheRef.current.get(cacheKey));
            return;
        }

        let isCurrent = true;
        setLoadingFrame(true);

        const fetchFrame = async () => {
            try {
                const url = await getPreviewFrame({
                    screen: currentScreen,
                    screenId: currentScreen.id,
                    platform,
                    resolution,
                });

                if (isCurrent) {
                    frameCacheRef.current.set(cacheKey, url);
                    setFrameUrl(url);
                }
            } catch (err) {
                console.error('Failed to load preview frame:', err);
            } finally {
                if (isCurrent) setLoadingFrame(false);
            }
        };

        fetchFrame();

        return () => {
            isCurrent = false;
        };
    }, [currentScreen, plan?.planHash, platform, resolution]);

    // Play simulation: cycles through screens according to estimated duration or fixed 4s interval
    useEffect(() => {
        if (!isPlaying || totalScreens <= 1) {
            if (playTimerRef.current) clearTimeout(playTimerRef.current);
            return;
        }

        const durationMs = currentScreen?.durationMs || 3800;

        playTimerRef.current = setTimeout(() => {
            setCurrentScreenIndex((prev) => (prev + 1) % totalScreens);
        }, durationMs);

        return () => {
            if (playTimerRef.current) clearTimeout(playTimerRef.current);
        };
    }, [isPlaying, currentScreenIndex, totalScreens, currentScreen]);

    const handlePrev = () => {
        setIsPlaying(false);
        setCurrentScreenIndex((prev) => (prev - 1 + totalScreens) % totalScreens);
    };

    const handleNext = () => {
        setIsPlaying(false);
        setCurrentScreenIndex((prev) => (prev + 1) % totalScreens);
    };

    const togglePlay = () => {
        setIsPlaying((prev) => !prev);
    };

    const isReel = platform === 'reel';

    return (
        <div className="w-full flex flex-col items-center gap-4" dir={dir}>
            {/* Aspect Ratio Video / Frame Canvas Container */}
            <div className={cn(
                "relative w-full rounded-3xl overflow-hidden shadow-2xl border border-border/10 bg-black flex items-center justify-center transition-all duration-500",
                isReel ? "aspect-[9/16] max-h-[560px]" : "aspect-video max-w-2xl"
            )}>
                {/* 1. Background Layer (Selected Video or Aesthetic Backdrop) */}
                {backgroundUrl && backgroundUrl !== 'default' && (backgroundUrl.startsWith('http://') || backgroundUrl.startsWith('https://')) ? (
                    <video
                        src={backgroundUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-neutral-950 to-black">
                        {/* Elegant luxury subtle geometric grid */}
                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
                    </div>
                )}

                {/* Subtle dark gradient overlay to ensure subtitle text pop */}
                <div className="absolute inset-0 bg-black/35 pointer-events-none"></div>

                {!currentScreen && !loadingPlan && (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground p-6 text-center z-10">
                        <VideoIcon className="w-10 h-10 text-primary/40 mb-1" />
                        <p className="text-sm font-medium">{t('previewTitle')}</p>
                        <p className="text-xs text-muted-foreground/70 max-w-[200px]">{t('previewText')}</p>
                    </div>
                )}

                {/* 2. Subtitle PNG Overlay Layer (Exact parity with FFmpeg) */}
                {frameUrl && (
                    <img
                        src={frameUrl}
                        alt="Preview Frame Subtitles"
                        className={cn(
                            "absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300",
                            loadingFrame ? "opacity-60" : "opacity-100"
                        )}
                    />
                )}

                {/* Loading state indicator */}
                {(loadingPlan || loadingFrame) && (
                    <div className="absolute top-4 end-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-semibold flex items-center gap-2 z-20">
                        <RotateCw className="w-3.5 h-3.5 animate-spin text-primary" />
                        <span>{t('loadingFrame')}</span>
                    </div>
                )}

                {/* Safe zone boundary visualizer hint (subtle corner marks) */}
                <div className="absolute inset-x-8 top-16 bottom-20 border border-white/5 rounded-2xl pointer-events-none"></div>
            </div>

            {/* Playback & Screen Navigation Controls */}
            {totalScreens > 1 && (
                <div className="w-full flex items-center justify-center pt-3 pb-2">
                    <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-full bg-card/95 backdrop-blur-xl border border-border/25 shadow-md" dir="ltr">
                        {/* Play / Pause simulation */}
                        <Button
                            type="button"
                            variant={isPlaying ? "default" : "outline"}
                            size="sm"
                            onClick={togglePlay}
                            className={cn(
                                "h-8 px-3 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0",
                                isPlaying
                                    ? "bg-primary text-primary-foreground shadow-primary/25"
                                    : "border-primary/25 hover:bg-primary/10 text-primary"
                            )}
                        >
                            {isPlaying ? (
                                <>
                                    <Pause className="w-3 h-3" />
                                    <span className="whitespace-nowrap">{t('pausePreview')}</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-3 h-3 fill-current" />
                                    <span className="whitespace-nowrap">{t('playPreview')}</span>
                                </>
                            )}
                        </Button>

                        <div className="w-px h-4 bg-border/40 mx-1 shrink-0" />

                        {/* Navigation Group: [ < ]  1 / 3  [ > ] */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            {/* Previous Screen Button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handlePrev}
                                disabled={totalScreens <= 1}
                                className="w-8 h-8 rounded-full hover:bg-primary/10 text-foreground shrink-0 disabled:opacity-30"
                                title={language === 'ar' ? 'الشاشة السابقة' : 'Previous Screen'}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            {/* Screen Counter: Always 1 / 3 in LTR */}
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/60 border border-border/10 select-none text-xs font-bold text-foreground">
                                <span className="font-mono text-xs">{currentScreenIndex + 1}</span>
                                <span className="text-muted-foreground/60 font-sans mx-0.5 text-xs">/</span>
                                <span className="font-mono text-xs text-muted-foreground">{totalScreens}</span>
                                <span className="sr-only">
                                    {t('screenOf')
                                        .replace('{{current}}', currentScreenIndex + 1)
                                        .replace('{{total}}', totalScreens)}
                                </span>
                            </div>

                            {/* Next Screen Button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleNext}
                                disabled={totalScreens <= 1}
                                className="w-8 h-8 rounded-full hover:bg-primary/10 text-foreground shrink-0 disabled:opacity-30"
                                title={language === 'ar' ? 'الشاشة التالية' : 'Next Screen'}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Multi-screen Reassurance Notice / Warnings */}
            {plan?.warnings?.length > 0 && (
                <div className="w-full space-y-2">
                    {plan.warnings.map((w, idx) => (
                        <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium flex items-center gap-2.5 leading-relaxed"
                        >
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                            <span>
                                {w.type === 'multi_screen_ayah'
                                    ? t('multiScreenNotice').replace('{{count}}', totalScreens)
                                    : w.message}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PreviewPlayer;
