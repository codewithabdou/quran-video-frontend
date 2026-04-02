import React, { useState, useEffect, useMemo } from 'react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { 
    Heart, 
    CheckCircle2,
    RotateCcw,
    Loader2,
    ChevronRight,
    Plus,
    Minus,
    Search,
    BookOpen,
    Sun,
    Moon
} from 'lucide-react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
const AzkarPage = () => {
    const { t, dir, language } = useThemeLanguage();
    const [azkarData, setAzkarData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({});
    const [view, setView] = useState('library'); // 'library' or 'reader'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [fontSize, setFontSize] = useState(() => {
        const saved = localStorage.getItem('azkar-font-size');
        return saved ? parseInt(saved) : 32;
    });

    useEffect(() => {
        localStorage.setItem('azkar-font-size', fontSize.toString());
    }, [fontSize]);

    const increaseFontSize = () => setFontSize(prev => Math.min(prev + 4, 64));
    const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 4, 20));

    useEffect(() => {
        const fetchAzkar = async () => {
            try {
                const response = await fetch('https://raw.githubusercontent.com/osamayy/azkar-db/refs/heads/master/azkar.json');
                const rawData = await response.json();
                
                // Transform database rows into objects
                const transformedData = (rawData.rows || []).map(row => ({
                    category: row[0],
                    content: row[1],
                    description: row[2],
                    count: row[3],
                    reference: row[4]
                }));

                setAzkarData(transformedData);
                
                // Initialize counts from original repeat values
                const initialCounts = {};
                transformedData.forEach((item, index) => {
                    initialCounts[`${item.category}-${index}`] = parseInt(item.count) || 1;
                });
                setCounts(initialCounts);
            } catch (error) {
                console.error('Failed to fetch azkar:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAzkar();
    }, []);

    const categories = useMemo(() => {
        const cats = [...new Set(azkarData.map(item => item.category))];
        return cats.sort((a, b) => {
            if (a.includes('الصباح')) return -1;
            if (b.includes('الصباح')) return 1;
            if (a.includes('المساء')) return -1;
            if (b.includes('المساء')) return 1;
            return 0;
        });
    }, [azkarData]);

    const filteredCategories = useMemo(() => {
        const AZKAR_SEARCH_MAP = {
            'morning': ['صباح'],
            'evening': ['مساء'],
            'sleep': ['نوم'],
            'wake': ['استيقاظ'],
            'food': ['طعام', 'أكل'],
            'travel': ['سفر'],
            'prayer': ['صلاة', 'وضوء', 'أذان'],
            'mosque': ['مسجد'],
            'home': ['منزل', 'بيت'],
            'clothes': ['ثوب', 'لبس'],
            'wc': ['خلاء', 'حمام'],
            'hajj': ['حج', 'عمرة'],
            'family': ['أهل', 'والد'],
            'protection': ['استعاذة', 'حفظ'],
            'forgiveness': ['استغفار', 'توبة']
        };

        const query = searchQuery.toLowerCase().trim();
        if (!query) return categories;

        // Find Arabic matches from our map
        const mappedArabicTerms = Object.entries(AZKAR_SEARCH_MAP)
            .filter(([en]) => en.includes(query))
            .map(([_, ar]) => ar)
            .flat();

        return categories.filter(cat => {
            const catLower = cat.toLowerCase();
            // Check direct match
            if (catLower.includes(query)) return true;
            // Check mapped Arabic matches
            return mappedArabicTerms.some(term => catLower.includes(term));
        });
    }, [categories, searchQuery]);

    const filteredAzkar = useMemo(() => {
        return azkarData.filter(item => item.category === selectedCategory);
    }, [azkarData, selectedCategory]);

    const handleSelectCategory = (cat) => {
        setSelectedCategory(cat);
        setView('reader');
        window.scrollTo(0, 0);
    };

    const handleCount = (key) => {
        setCounts(prev => {
            if (prev[key] > 0) {
                return { ...prev, [key]: prev[key] - 1 };
            }
            return prev;
        });
    };

    const resetCount = (key, originalCount, e) => {
        e.stopPropagation();
        setCounts(prev => ({ ...prev, [key]: parseInt(originalCount) || 1 }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-24 space-y-4 bg-zinc-50 dark:bg-black">
                <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">{t('gatheringSupplications')}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 pt-24 min-h-screen pb-32" dir={dir}>
            <div className="max-w-4xl mx-auto">
                {view === 'library' ? (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Header & Search */}
                        <div className="flex flex-col items-center text-center gap-8 w-full overflow-hidden px-4">
                            <h1 className={`${language === 'en' ? 'text-3xl sm:text-4xl md:text-6xl' : 'text-2xl sm:text-3xl md:text-5xl'} font-black uppercase tracking-tighter leading-[1.1] text-black dark:text-white break-words max-w-full`} dangerouslySetInnerHTML={{ __html: t('supplicationLibrary') }} />
                            
                            {/* Search Bar */}
                            <div className="relative w-full max-w-xl group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                                <input 
                                    type="text"
                                    placeholder={t('searchCategoriesPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-900 border-none rounded-[2rem] py-6 pl-16 pr-8 text-lg font-bold shadow-sm focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none text-center"
                                />
                            </div>
                        </div>

                        {/* Quick Access */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories.slice(0, 2).map((cat) => {
                                return (
                                    <Card 
                                        key={cat}
                                        onClick={() => handleSelectCategory(cat)}
                                        className="p-10 rounded-[2.5rem] bg-black dark:bg-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group overflow-hidden relative flex flex-col items-center justify-center text-center"
                                    >
                                        <div className="relative z-10 space-y-4 flex flex-col items-center">
                                            {cat.includes('الصباح') ? <Sun className="h-12 w-12 text-white dark:text-black mb-2" /> : 
                                             cat.includes('المساء') ? <Moon className="h-12 w-12 text-white dark:text-black mb-2" /> : 
                                             <BookOpen className="h-12 w-12 text-white dark:text-black mb-2" />}
                                            <h3 className="text-4xl font-arabic font-bold text-white dark:text-black leading-tight">{cat}</h3>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent dark:from-black/5 pointer-events-none" />
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Category Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredCategories.slice(2).map((cat) => {
                                return (
                                    <Card 
                                        key={cat}
                                        onClick={() => handleSelectCategory(cat)}
                                        className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border-none hover:shadow-xl transition-all cursor-pointer group flex items-center justify-center text-center"
                                    >
                                        <span className="text-lg font-arabic font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                                            {cat}
                                        </span>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
                        {/* Detail Header */}
                        <div className="flex flex-col gap-8 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setView('library')}
                                        className="w-fit flex items-center gap-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors pl-0 -mt-4 mb-2"
                                    >
                                        <ChevronRight className="h-5 w-5 rotate-180" />
                                        <span className="text-xs uppercase font-black tracking-widest">{t('backToLibrary')}</span>
                                    </Button>
                                    
                                    <h2 className={`text-5xl md:text-6xl font-arabic font-bold text-black dark:text-white leading-tight ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                                        {selectedCategory}
                                    </h2>
                                </div>

                                {/* Font Size Controls */}
                                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 self-end md:self-auto w-fit">
                                    <div className="flex items-center gap-2 px-3 border-r border-zinc-100 dark:border-zinc-800 mr-1">
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-[10px] font-black">A</span>
                                            <span className="text-sm font-black">A</span>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={decreaseFontSize}
                                        className="h-9 w-9 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-black min-w-[1.5rem] text-center">{fontSize}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={increaseFontSize}
                                        className="h-9 w-9 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Adhkar List */}
                        <div className="space-y-6">
                            {filteredAzkar.map((zikr, index) => {
                                const key = `${selectedCategory}-${index}`;
                                const isDone = counts[key] === 0;
                                const total = parseInt(zikr.count) || 1;
                                const current = counts[key] || 0;
                                const progress = ((total - current) / total) * 100;

                                return (
                                    <Card 
                                        key={key}
                                        className={`group p-8 md:p-12 rounded-[3.5rem] border-none transition-all duration-500 shadow-sm relative overflow-hidden cursor-pointer ${
                                            isDone 
                                            ? 'bg-zinc-100 dark:bg-zinc-800 opacity-60 scale-[0.98]' 
                                            : 'bg-white dark:bg-zinc-900 hover:shadow-2xl'
                                        }`}
                                        onClick={() => handleCount(key)}
                                    >
                                        <div className="absolute bottom-0 left-0 h-1.5 bg-black dark:bg-white opacity-20 transition-all duration-500" style={{ width: `${progress}%` }} />
                                        
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            <div className="relative shrink-0">
                                                <Button variant="ghost" className={`h-20 w-20 rounded-full border-4 flex flex-col items-center justify-center transition-all ${isDone ? 'border-zinc-300 dark:border-zinc-600' : 'border-black dark:border-white'}`}>
                                                    {isDone ? <CheckCircle2 className="h-6 w-6" /> : <span className="text-2xl font-black">{current}</span>}
                                                </Button>
                                                {isDone && (
                                                    <Button variant="ghost" size="icon" onClick={(e) => resetCount(key, zikr.count, e)} className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-border/10 hover:rotate-180 transition-all">
                                                        <RotateCcw className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-6" dir="rtl">
                                            <p 
                                                className={`text-black dark:text-white transition-all duration-300 font-arabic leading-relaxed ${
                                                    isDone ? 'opacity-30' : 'opacity-100'
                                                }`}
                                                style={{ fontSize: `${fontSize}px` }}
                                            >
                                                {zikr.content}
                                            </p>
                                                {(zikr.description || zikr.reference) && (
                                                    <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                                                        {zikr.description && zikr.description !== "" && (
                                                            <p className="text-base text-zinc-600 dark:text-zinc-400 font-arabic leading-relaxed" dir={dir}>
                                                                {zikr.description}
                                                            </p>
                                                        )}
                                                        {zikr.reference && zikr.reference !== "" && (
                                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-arabic uppercase tracking-wide" dir={dir}>
                                                                {zikr.reference}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AzkarPage;
