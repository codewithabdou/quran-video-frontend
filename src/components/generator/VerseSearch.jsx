import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, BookOpen, Check, ArrowRight, CornerDownLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchVerses } from '@/api/video';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

const VerseSearch = ({ onSelectRange, onSelectSurah, currentSurah }) => {
    const { t, language, dir } = useThemeLanguage();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [totalMatches, setTotalMatches] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const containerRef = useRef(null);
    const debounceTimerRef = useRef(null);

    // Debounced search
    const executeSearch = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.trim().length < 1) {
            setResults([]);
            setTotalMatches(0);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await searchVerses({ q: searchQuery.trim(), limit: 12 });
            setResults(data.results || []);
            setTotalMatches(data.total || 0);
            setSelectedIndex(0);
            setIsOpen(true);
        } catch (err) {
            console.error('Verse search error:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!val.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        debounceTimerRef.current = setTimeout(() => {
            executeSearch(val);
        }, 280);
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation (Arrow keys + Enter + Escape)
    const handleKeyDown = (e) => {
        if (!isOpen || !results.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const selected = results[selectedIndex];
            if (selected) {
                handleSelectAyah(selected);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const handleSelectAyah = (result) => {
        onSelectRange({
            surah: String(result.surah),
            startAyah: result.numberInSurah,
            endAyah: result.numberInSurah,
        });
        setIsOpen(false);
    };

    const handleUseAsStart = (e, result) => {
        e.stopPropagation();
        onSelectRange({
            surah: String(result.surah),
            startAyah: result.numberInSurah,
            endAyah: result.numberInSurah,
        });
        setIsOpen(false);
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative w-full z-30" dir={dir}>
            <div className="relative flex items-center">
                <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-primary/60">
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                        <Search className="w-5 h-5 transition-colors group-hover:text-primary" />
                    )}
                </div>

                <Input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (results.length) setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={t('searchPlaceholder')}
                    className="w-full h-14 ps-12 pe-12 rounded-2xl bg-muted/40 border border-border/10 focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/20 text-base font-medium text-foreground placeholder:text-muted-foreground/70 shadow-inner transition-all duration-300"
                />

                {query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Results Dropdown Card */}
            {isOpen && (
                <div className="absolute top-full start-0 end-0 mt-3 p-3 bg-card/95 backdrop-blur-2xl border border-border/20 rounded-3xl shadow-2xl overflow-hidden max-h-[460px] flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="px-3 py-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border/10">
                        <span className="font-semibold uppercase tracking-wider text-[11px] text-primary/80">
                            {t('matchesFound').replace('{{count}}', totalMatches)}
                        </span>
                        <span className="text-[10px] opacity-70">
                            ↑↓ {language === 'ar' ? 'للتنقل' : 'to navigate'} • ↵ {language === 'ar' ? 'للاختيار' : 'to select'}
                        </span>
                    </div>

                    <div className="overflow-y-auto space-y-2 mt-2 pe-1 scrollbar-thin">
                        {results.length === 0 && !loading && (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                                <p>{t('noVersesFound')}</p>
                            </div>
                        )}

                        {results.map((result, idx) => {
                            const isSelected = idx === selectedIndex;
                            const isArabicMatch = result.matchType === 'arabic_phrase' || result.matchType === 'arabic_words';
                            const isRefMatch = result.matchType === 'reference';

                            return (
                                <div
                                    key={`${result.surah}:${result.numberInSurah}`}
                                    onClick={() => handleSelectAyah(result)}
                                    className={cn(
                                        "p-4 rounded-2xl cursor-pointer transition-all duration-200 border",
                                        isSelected
                                            ? "bg-primary/10 border-primary/30 shadow-md translate-y-[-1px]"
                                            : "bg-muted/20 hover:bg-muted/40 border-transparent"
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm text-foreground">
                                                {language === 'ar' ? result.surahArabicName : result.surahName}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-mono font-bold">
                                                {result.surah}:{result.numberInSurah}
                                            </span>
                                            {isRefMatch && (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-bold">
                                                    {t('verseMatchRef')}
                                                </span>
                                            )}
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => handleUseAsStart(e, result)}
                                            className="h-8 px-3 rounded-full text-xs font-bold text-primary hover:bg-primary/20"
                                        >
                                            {t('selectAyah')}
                                            <CornerDownLeft className="w-3.5 h-3.5 ms-1.5" />
                                        </Button>
                                    </div>

                                    {/* Arabic Scripture Preview */}
                                    <p className="font-quran text-lg leading-relaxed text-foreground/90 text-right my-1 select-none" dir="rtl">
                                        {result.arabic}
                                    </p>

                                    {/* English Translation */}
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed text-left rtl:text-right mt-1">
                                        {result.english}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerseSearch;
