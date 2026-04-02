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
    ChevronDown
} from 'lucide-react';
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
    const [fontSize, setFontSize] = useState(window.innerWidth < 768 ? 24 : 32);
    const [surahList, setSurahList] = useState([]);
    
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

    const goToNextPage = () => {
        if (currentPage < 604) setCurrentPage(prev => prev + 1);
    };

    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

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
            <div className="container mx-auto px-4">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center">
                            <Book className="h-6 w-6 text-white dark:text-black" />
                        </div>
                        <div>
                            <h1 className="type-display text-black dark:text-white leading-none">
                                {t('navMushaf')}
                            </h1>
                            <p className="type-label text-zinc-500 dark:text-zinc-400 mt-2">
                                {t('page')} {currentPage} {t('of')} 604
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-sm border border-border/10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="rounded-xl gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    <span className="font-bold">{t('jumpToSurah')}</span>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 max-h-96 rounded-2xl p-2 bg-white dark:bg-zinc-900 border-none shadow-2xl">
                                <ScrollArea className="h-80">
                                    {surahList.map(s => (
                                        <DropdownMenuItem 
                                            key={s.number} 
                                            onClick={() => jumpToSurah(s.number)}
                                            className="rounded-xl p-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center"
                                        >
                                            <span className="font-bold text-sm text-zinc-500">{s.number.toString().padStart(3, '0')}</span>
                                            <div className="flex-1 px-3">
                                                <p className="font-bold text-black dark:text-white">{s.englishName}</p>
                                                <p className="text-[10px] uppercase text-zinc-400 font-black">{s.englishNameTranslation}</p>
                                            </div>
                                            <span className="text-lg font-quran text-black dark:text-white">{s.name}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </ScrollArea>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => setFontSize(prev => Math.min(prev + 4, 64))}
                        >
                            <Type className="h-5 w-5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => setFontSize(prev => Math.max(prev - 4, 16))}
                        >
                            <span className="text-xs font-bold">A</span>
                        </Button>
                    </div>
                </div>

                {/* Reader Interface */}
                <Card className="relative max-w-5xl mx-auto bg-white dark:bg-zinc-900 border-none shadow-2xl rounded-[3rem] overflow-hidden min-h-[70vh] flex flex-col">
                    {loading && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">{t('turningPage')}</p>
                        </div>
                    )}

                    <div className="flex-1 p-8 md:p-16 flex flex-col items-center justify-center text-center">
                        {pageData && (
                            <div 
                                className="font-quran leading-[2.2] text-black dark:text-white whitespace-pre-wrap transition-all duration-300"
                                style={{ 
                                    fontSize: `${fontSize}px`,
                                    direction: 'rtl'
                                }}
                            >
                                {pageData.ayahs.map((ayah, i) => (
                                    <span key={ayah.number} className="inline-block relative mb-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg p-1 transition-colors cursor-default">
                                        {/* Surah/Bismillah Header */}
                                        {ayah.numberInSurah === 1 && ayah.surah.number !== 1 && (
                                            <div className="w-full text-center mb-8 mt-12 first:mt-0">
                                                <div className="bg-zinc-50 dark:bg-zinc-800 py-4 px-8 rounded-3xl inline-block border border-border/10 mb-4">
                                                    <h2 className="text-2xl md:text-3xl font-black mb-1">{ayah.surah.name}</h2>
                                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{ayah.surah.englishName}</p>
                                                </div>
                                                {ayah.surah.number !== 9 && (
                                                    <p className="text-4xl md:text-5xl font-quran leading-loose text-black dark:text-white transition-all duration-500">
                                                        بسم الله الرحمن الرحيم
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <span className={ayah.numberInSurah === 1 ? "block" : "inline"}>
                                            {ayah.text}
                                            <span className="mx-2 inline-flex items-center justify-center h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs font-bold font-sans text-zinc-400 align-middle">
                                                {ayah.numberInSurah}
                                            </span>
                                        </span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="p-8 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-border/10 flex justify-between items-center">
                        <Button 
                            variant="ghost" 
                            className="rounded-2xl h-14 px-8 gap-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group shrink-0"
                            onClick={dir === 'rtl' ? goToNextPage : goToPrevPage}
                            disabled={dir === 'rtl' ? currentPage === 604 : currentPage === 1}
                        >
                            <ChevronLeft className={`h-5 w-5 transition-transform ${dir === 'rtl' ? 'group-hover:-translate-x-1' : 'group-hover:-translate-x-1'}`} />
                            <span className="font-bold uppercase tracking-widest text-xs hidden sm:inline">
                                {dir === 'rtl' ? t('goToNextPage') : t('goToPreviousPage')}
                            </span>
                        </Button>

                        <div className="text-center shrink-0">
                            <span className="text-2xl font-black text-black dark:text-white">{currentPage}</span>
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-tighter tracking-widest mt-1">{t('page')}</p>
                        </div>

                        <Button 
                            variant="ghost" 
                            className="rounded-2xl h-14 px-8 gap-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group shrink-0"
                            onClick={dir === 'rtl' ? goToPrevPage : goToNextPage}
                            disabled={dir === 'rtl' ? currentPage === 1 : currentPage === 604}
                        >
                            <span className="font-bold uppercase tracking-widest text-xs hidden sm:inline">
                                {dir === 'rtl' ? t('goToPreviousPage') : t('goToNextPage')}
                            </span>
                            <ChevronRight className={`h-5 w-5 transition-transform ${dir === 'rtl' ? 'group-hover:translate-x-1' : 'group-hover:translate-x-1'}`} />
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
                    className={`h-12 w-12 rounded-full transition-all ${
                        isBookmarked 
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
