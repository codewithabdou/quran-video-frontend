import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Minus, Layers, Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SURAHS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getVerses } from '@/api/video';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

const VerseRangeReview = ({
    surah,
    ayahStart,
    ayahEnd,
    onChangeSurah,
    onChangeStart,
    onChangeEnd,
}) => {
    const { t, language, dir } = useThemeLanguage();
    const [versesData, setVersesData] = useState([]);
    const [loadingVerses, setLoadingVerses] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const scrollContainerRef = useRef(null);

    const checkScroll = () => {
        const el = scrollContainerRef.current;
        if (el) {
            const hasMore = el.scrollHeight - el.scrollTop - el.clientHeight > 15;
            setCanScrollDown(hasMore);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(checkScroll, 150);
        return () => clearTimeout(timeout);
    }, [versesData]);

    const surahNum = parseInt(surah, 10) || 1;
    const currentSurahObj = SURAHS.find(s => s.number === surahNum) || SURAHS[0];
    const maxAyahs = currentSurahObj ? currentSurahObj.ayahs : 7;

    const start = Math.max(1, Math.min(maxAyahs, parseInt(ayahStart, 10) || 1));
    const end = Math.max(start, Math.min(maxAyahs, parseInt(ayahEnd, 10) || start));

    // Fetch full text of selected ayahs for review
    useEffect(() => {
        let isMounted = true;
        const fetchSelectedPassage = async () => {
            setLoadingVerses(true);
            try {
                const data = await getVerses({ surah: surahNum, start, end });
                if (isMounted) {
                    setVersesData(data.ayahs || []);
                }
            } catch (err) {
                console.error('Failed to fetch passage verses:', err);
            } finally {
                if (isMounted) setLoadingVerses(false);
            }
        };

        fetchSelectedPassage();
        return () => { isMounted = false; };
    }, [surahNum, start, end]);

    const handleSurahChange = (val) => {
        const nextSurahNum = parseInt(val, 10);
        const nextSurahObj = SURAHS.find(s => s.number === nextSurahNum);
        const nextMax = nextSurahObj ? nextSurahObj.ayahs : 7;

        // Adjust ayah ranges if outside bounds of the new surah before setting surah
        if (start > nextMax) {
            onChangeStart(1);
            onChangeEnd(Math.min(3, nextMax));
        } else if (end > nextMax) {
            onChangeEnd(nextMax);
        }

        onChangeSurah(val);
    };

    const handleStepStart = (delta) => {
        const next = Math.max(1, Math.min(end, start + delta));
        onChangeStart(next);
    };

    const handleStepEnd = (delta) => {
        const next = Math.max(start, Math.min(maxAyahs, end + delta));
        onChangeEnd(next);
    };

    // Calculate passage statistics
    const totalWords = versesData.reduce((sum, v) => sum + (v.arabic ? v.arabic.trim().split(/\s+/).length : 0), 0);
    const estimatedSeconds = Math.max(3, Math.round(totalWords * 0.8));

    return (
        <div className="space-y-6" dir={dir}>
            {/* Surah & Ayah Range Controls */}
            <div className="grid sm:grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4">
                {/* Surah Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        {t('surah')}
                    </label>

                    <Select value={String(surahNum)} onValueChange={handleSurahChange}>
                        <SelectTrigger className="h-13 rounded-2xl bg-muted/30 border border-border/10 focus:bg-background focus:ring-2 focus:ring-primary/20 text-sm font-semibold">
                            <SelectValue placeholder={t('selectSurah')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border/20 shadow-2xl max-h-[380px]">
                            {SURAHS.map((s) => (
                                <SelectItem key={s.number} value={String(s.number)} className="rounded-xl p-3 focus:bg-primary/10">
                                    <div className="flex items-center w-full gap-3">
                                        <span className="text-[10px] font-bold w-6 h-6 shrink-0 flex items-center justify-center bg-muted rounded-full">
                                            {s.number}
                                        </span>
                                        <span className="flex-1 font-medium text-sm text-left rtl:text-right">
                                            {language === 'ar' ? s.arabicName : s.name} {language !== 'ar' && `(${s.englishName})`}
                                        </span>
                                        <span className="font-arabic text-base text-primary/70 shrink-0">
                                            {s.arabicName}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Ayah Range Steppers */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-muted/20 border border-border/10">
                    {/* Start Ayah */}
                    <div className="space-y-1.5 text-center">
                        <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/80 block">
                            {t('startAyah')}
                        </label>
                        <div className="flex items-center justify-center gap-1.5">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStepStart(-1)}
                                disabled={start <= 1}
                                className="w-8 h-8 rounded-full hover:bg-primary/20"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </Button>
                            <Input
                                type="number"
                                min="1"
                                max={maxAyahs}
                                value={start}
                                dir="ltr"
                                onChange={(e) => onChangeStart(parseInt(e.target.value, 10) || 1)}
                                className="w-16 h-10 !px-1 text-center font-mono font-bold text-base text-foreground bg-background border border-border/20 shadow-sm rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStepStart(1)}
                                disabled={start >= end}
                                className="w-8 h-8 rounded-full hover:bg-primary/20"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* End Ayah */}
                    <div className="space-y-1.5 text-center">
                        <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/80 block">
                            {t('endAyah')}
                        </label>
                        <div className="flex items-center justify-center gap-1.5">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStepEnd(-1)}
                                disabled={end <= start}
                                className="w-8 h-8 rounded-full hover:bg-primary/20"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </Button>
                            <Input
                                type="number"
                                min={start}
                                max={maxAyahs}
                                value={end}
                                dir="ltr"
                                onChange={(e) => onChangeEnd(parseInt(e.target.value, 10) || start)}
                                className="w-16 h-10 !px-1 text-center font-mono font-bold text-base text-foreground bg-background border border-border/20 shadow-sm rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStepEnd(1)}
                                disabled={end >= maxAyahs}
                                className="w-8 h-8 rounded-full hover:bg-primary/20"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Verses Passage Card */}
            <div className="rounded-3xl p-5 bg-card/60 backdrop-blur-xl border border-border/10 shadow-premium space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-border/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold tracking-tight text-foreground whitespace-nowrap">
                                {t('readingPreview')}
                            </h4>
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold shrink-0">
                                {surahNum}:{start}{end > start ? `-${end}` : ''}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border/10 font-medium whitespace-nowrap">
                            <Layers className="w-3.5 h-3.5 text-primary" />
                            <span>
                                {versesData.length} {language === 'ar' ? (versesData.length === 1 ? 'آية' : 'آيات') : (versesData.length === 1 ? 'Ayah' : 'Ayahs')}
                            </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border/10 font-medium font-mono whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>~{estimatedSeconds}s</span>
                        </span>
                    </div>
                </div>

                {loadingVerses ? (
                    <div className="py-6 text-center text-sm text-muted-foreground animate-pulse">
                        {t('loading')}
                    </div>
                ) : (
                    <div className="relative">
                        <div
                            ref={scrollContainerRef}
                            onScroll={checkScroll}
                            className="space-y-3.5 max-h-[260px] overflow-y-auto pe-2 scrollbar-thin scrollbar-thumb-border/80 hover:scrollbar-thumb-primary/40 scrollbar-track-transparent rounded-2xl"
                        >
                            {versesData.map((v) => (
                                <div key={v.numberInSurah} className="p-3.5 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors space-y-2 border border-border/5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold font-mono">
                                            {v.numberInSurah}
                                        </span>
                                    </div>
                                    <p className="font-quran text-xl leading-relaxed text-foreground text-right" dir="rtl">
                                        {v.arabic}
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed text-left rtl:text-right">
                                        {v.english}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Gradient Fade-out & Interactive Scroll Hint */}
                        {canScrollDown && (
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card via-card/85 to-transparent pointer-events-none rounded-b-2xl flex items-end justify-center pb-1 transition-opacity duration-300">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (scrollContainerRef.current) {
                                            scrollContainerRef.current.scrollBy({ top: 120, behavior: 'smooth' });
                                        }
                                    }}
                                    className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/95 hover:bg-background border border-border/20 shadow-md text-[11px] font-semibold text-foreground/80 hover:text-foreground transition-all hover:scale-105 active:scale-95"
                                >
                                    <ChevronDown className="w-3.5 h-3.5 text-primary animate-bounce" />
                                    <span>
                                        {language === 'ar'
                                            ? `مرر لعرض باقي الآيات (${versesData.length} آيات)`
                                            : `Scroll for more (${versesData.length} ayahs)`}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerseRangeReview;
