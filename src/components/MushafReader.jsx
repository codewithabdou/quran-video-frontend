import React, { useState, useEffect, useRef } from 'react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Book,
    Bookmark,
    Loader2,
    Settings2,
    Type,
    Maximize2,
    ChevronDown,
    Plus,
    Minus,
    History,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const SURAH_LIST = [
    { id: 1, name: "Al-Fatihah", ar: "الفاتحة", pages: [1, 1] },
    { id: 2, name: "Al-Baqarah", ar: "البقرة", pages: [2, 49] },
    // Simplified for now, we'll fetch full list if needed
];

const MushafReader = () => {
    const { t, dir, language } = useThemeLanguage();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(() => {
        return parseInt(localStorage.getItem('mushaf_last_page')) || 1;
    });
    const [isBookmarked, setIsBookmarked] = useState(() => {
        return parseInt(localStorage.getItem('mushaf_bookmark')) === currentPage;
    });
    const [fontSize, setFontSize] = useState(() => {
        return parseInt(localStorage.getItem('mushaf_font_size')) || (window.innerWidth < 768 ? 24 : 32);
    });
    const [surahList, setSurahList] = useState([]);
    const [surahSearch, setSurahSearch] = useState('');
    const [isSurahModalOpen, setIsSurahModalOpen] = useState(false);
    const [currentSurah, setCurrentSurah] = useState({ name: '...', ar: '...' });

    const containerRef = useRef(null);

    useEffect(() => {
        setIsBookmarked(parseInt(localStorage.getItem('mushaf_bookmark')) === currentPage);
    }, [currentPage]);

    const toggleBookmark = () => {
        if (isBookmarked) {
            localStorage.removeItem('mushaf_bookmark');
            setIsBookmarked(false);
        } else {
            localStorage.setItem('mushaf_bookmark', currentPage.toString());
            setIsBookmarked(true);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                const response = await fetch('https://api.alquran.cloud/v1/surah');
                const data = await response.json();
                setSurahList(data.data);
            } catch (error) {
                console.error('Failed to fetch surahs:', error);
            }
        };
        fetchSurahs();
    }, []);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                const response = await fetch(`https://api.alquran.cloud/v1/page/${currentPage}/quran-uthmani`);
                const data = await response.json();
                setPageData(data.data);
                localStorage.setItem('mushaf_last_page', currentPage.toString());
            } catch (error) {
                console.error('Failed to fetch page:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
        if (containerRef.current) {
            containerRef.current.scrollTo(0, 0);
        }
    }, [currentPage]);

    // Update current surah info when page data changes
    useEffect(() => {
        if (pageData && pageData.ayahs && pageData.ayahs.length > 0) {
            const firstAyah = pageData.ayahs[0];
            setCurrentSurah({
                name: firstAyah.surah.englishName,
                ar: firstAyah.surah.name
            });
        }
    }, [pageData]);

    useEffect(() => {
        localStorage.setItem('mushaf_font_size', fontSize.toString());
    }, [fontSize]);

    const goToNextPage = () => {
        if (currentPage < 604) setCurrentPage(prev => prev + 1);
    };

    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const lastReadPage = parseInt(localStorage.getItem('mushaf_last_page'));
    const showResume = lastReadPage && lastReadPage !== currentPage;

    const jumpToSurah = (surahNumber) => {
        // AlQuran Cloud can return the first page of a surah
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`)
            .then(res => res.json())
            .then(data => {
                const firstAyah = data.data.ayahs[0];
                // Approximate page calculation or fetch metadata
                // For now, we fetch the page the surah starts on
                setCurrentPage(data.data.ayahs[0].page);
            });
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-32 overflow-x-hidden" dir={dir}>
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Hero Header Section */}
                <div className="flex flex-col items-center text-center gap-10 mb-16 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-4 max-w-4xl">
                        <h1 className={`${language === 'en' ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'} font-black uppercase tracking-tighter leading-none text-black dark:text-white`}>
                            {t('navMushaf')}
                        </h1>
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-xl md:text-2xl font-black text-primary uppercase tracking-wider">
                                {language === 'ar' ? currentSurah.ar : currentSurah.name}
                            </p>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 opacity-80">
                                {t('page')} {currentPage} {t('of')} 604
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                        {/* Surah Selector Dialog */}
                        <Dialog open={isSurahModalOpen} onOpenChange={setIsSurahModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-14 px-8 rounded-2xl bg-white dark:bg-zinc-900 border-none text-black dark:text-white font-bold text-lg shadow-premium hover:scale-[1.02] transition-all gap-3 group">
                                    <Search className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors" />
                                    <span>{language === 'ar' ? currentSurah.ar : currentSurah.name}</span>
                                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 border-none rounded-4xl p-0 overflow-hidden shadow-2xl">
                                <DialogHeader className="p-8 pb-0 text-center">
                                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter mb-4 text-black dark:text-white">{t('jumpToSurah')}</DialogTitle>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                                        <Input
                                            placeholder={t('searchReciter')}
                                            className="pl-12 h-14 bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl text-lg focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white transition-all"
                                            value={surahSearch}
                                            onChange={(e) => setSurahSearch(e.target.value)}
                                        />
                                    </div>
                                </DialogHeader>
                                <ScrollArea className="h-[60vh] p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                                        {surahList.filter(s =>
                                            s.englishName.toLowerCase().includes(surahSearch.toLowerCase()) ||
                                            s.name.includes(surahSearch)
                                        ).map(s => (
                                            <button
                                                key={s.number}
                                                onClick={() => {
                                                    jumpToSurah(s.number);
                                                    setIsSurahModalOpen(false);
                                                }}
                                                className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group text-right"
                                            >
                                                <div className="flex items-center gap-4 text-left">
                                                    <span className="text-xs font-black text-zinc-400 opacity-50">{s.number}</span>
                                                    <div>
                                                        <p className="font-bold text-black dark:text-white group-hover:text-primary transition-colors">{s.englishName}</p>
                                                        <p className="text-[10px] uppercase text-zinc-500 font-black">{s.englishNameTranslation}</p>
                                                    </div>
                                                </div>
                                                <span className="text-2xl font-quran text-black dark:text-white">{s.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>

                        {/* Font Size Controller (Azkar Style) */}
                        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-premium border-none">
                            <div className="flex items-center gap-2 px-3 border-r border-zinc-100 dark:border-zinc-800 mr-1">
                                <div className="flex items-baseline gap-0.5 text-zinc-500">
                                    <span className="text-[10px] font-black">A</span>
                                    <span className="text-sm font-black">A</span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setFontSize(prev => Math.max(prev - 2, 16))}
                                className="h-10 w-10 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-black min-w-6 text-center text-black dark:text-white">{fontSize}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setFontSize(prev => Math.min(prev + 2, 64))}
                                className="h-10 w-10 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Resume / Continue Reading Banner */}
                    {showResume && (
                        <div className="w-full max-w-xl animate-in zoom-in-95 fade-in duration-500">
                            <Card
                                onClick={() => setCurrentPage(lastReadPage)}
                                className="p-4 bg-black dark:bg-zinc-100 rounded-4xl text-white dark:text-black flex items-center justify-between cursor-pointer group hover:scale-[1.02] transition-all shadow-xl"
                            >
                                <div className="flex items-center gap-4 ml-2">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <History className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase font-black tracking-widest opacity-60 leading-none mb-1">{t('lastRead')}</p>
                                        <p className="font-bold text-sm">{t('page')} {lastReadPage}</p>
                                    </div>
                                </div>
                                <Button size="sm" className="bg-primary text-white hover:bg-primary/95 font-bold rounded-xl px-6">
                                    {t('continueReading')}
                                </Button>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Reader Interface */}
                <Card className="relative max-w-5xl mx-auto bg-white dark:bg-zinc-900 border-none shadow-2xl rounded-[3rem] overflow-hidden min-h-[70vh] flex flex-col">
                    {loading && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">{t('turningPage')}</p>
                        </div>
                    )}

                    <div className="flex-1 p-8 md:p-14 lg:p-20 flex flex-col items-center">
                        {pageData && (
                            <div
                                className="font-quran text-black dark:text-white transition-all duration-500 w-full"
                                style={{
                                    fontSize: `${fontSize}px`,
                                    direction: 'rtl',
                                    lineHeight: '3.5',
                                    textAlign: 'justify',
                                    textJustify: 'inter-word'
                                }}
                            >
                                {pageData.ayahs.map((ayah, i) => (
                                    <React.Fragment key={ayah.number}>
                                        {/* Surah/Bismillah Header */}
                                        {ayah.numberInSurah === 1 && (
                                            <div className="w-full text-center mt-16 first:mt-0 mb-12 block clear-both" style={{ textAlign: 'center' }}>
                                                <div className="bg-zinc-50 dark:bg-zinc-800 py-6 px-12 rounded-4xl inline-block border border-border/10 mb-8 shadow-sm">
                                                    <h2 className="text-3xl md:text-4xl font-arabic font-bold mb-2">{ayah.surah.name}</h2>
                                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">{ayah.surah.englishName}</p>
                                                </div>
                                            </div>
                                        )}

                                        <span className="inline">
                                            {ayah.text}
                                            <span className="mx-3 inline-flex items-center justify-center h-10 w-10 rounded-full border-2 border-zinc-100 dark:border-zinc-800 text-[10px] font-black font-sans text-zinc-400 align-middle -translate-y-1">
                                                {ayah.numberInSurah}
                                            </span>
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="p-8 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-border/10 flex justify-between items-center">
                        <Button
                            variant="ghost"
                            className="rounded-2xl h-14 px-8 gap-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group shrink-0"
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                        >
                            {dir === 'rtl' ? (
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            ) : (
                                <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                            )}
                            <span className="font-bold uppercase tracking-widest text-xs hidden sm:inline">
                                {t('goToPreviousPage')}
                            </span>
                        </Button>

                        <div className="text-center shrink-0">
                            <span className="text-2xl font-black text-black dark:text-white">{currentPage}</span>
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mt-1">{t('page')}</p>
                        </div>

                        <Button
                            variant="ghost"
                            className="rounded-2xl h-14 px-8 gap-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group shrink-0"
                            onClick={goToNextPage}
                            disabled={currentPage === 604}
                        >
                            <span className="font-bold uppercase tracking-widest text-xs hidden sm:inline">
                                {t('goToNextPage')}
                            </span>
                            {dir === 'rtl' ? (
                                <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                            ) : (
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            )}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Quick Actions Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black dark:bg-white p-2 rounded-full shadow-2xl backdrop-blur-xl z-50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleBookmark}
                    className={`h-12 w-12 rounded-full transition-all ${isBookmarked
                            ? 'bg-white text-black dark:bg-black dark:text-white'
                            : 'text-white dark:text-black hover:bg-white/10 dark:hover:bg-black/5'
                        }`}
                >
                    <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
                <div className="w-px h-6 bg-white/20 dark:bg-black/10" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full text-white dark:text-black hover:bg-white/10 dark:hover:bg-black/5 transition-all"
                    onClick={toggleFullscreen}
                >
                    <Maximize2 className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};

export default MushafReader;
