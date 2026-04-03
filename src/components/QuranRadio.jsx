import React, { useState, useEffect, useMemo } from 'react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { 
    Search, 
    Play, 
    Pause, 
    Download, 
    Volume2, 
    AudioLines,
    ChevronRight,
    ChevronLeft,
    Headphones,
    X,
    Loader2
} from 'lucide-react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

const SURAH_NAMES = [
    "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa'", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra'", "Al-Kahf", "Maryam", "Ta-Ha", "Al-Anbiya'", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara'", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba'", "An-Nazi'at", "Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

const ARABIC_SURAH_NAMES = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس", "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", "الأنبيآء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"
];

const QuranRadio = () => {
    const { t, dir, language } = useThemeLanguage();
    const [reciters, setReciters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReciter, setSelectedReciter] = useState(null);
    const [isSurahModalOpen, setIsSurahModalOpen] = useState(false);
    
    // Audio Player State
    const [currentAudio, setCurrentAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [audioMetadata, setAudioMetadata] = useState(null);
    const [audioError, setAudioError] = useState(null);

    useEffect(() => {
        const fetchReciters = async () => {
            setLoading(true);
            try {
                // Use 'eng' for English, 'ar' for Arabic metadata
                const apiLang = language === 'ar' ? 'ar' : 'eng';
                const response = await fetch(`https://www.mp3quran.net/api/v3/reciters?language=${apiLang}`);
                const data = await response.json();
                setReciters(data.reciters);
            } catch (error) {
                console.error('Failed to fetch reciters:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReciters();
    }, [language]);

    const filteredReciters = useMemo(() => {
        return reciters.filter(r => 
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.mosque && r.mosque.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [reciters, searchQuery]);

    const handleSelectReciter = (reciter) => {
        setSelectedReciter(reciter);
        setIsSurahModalOpen(true);
    };

    const playSurah = (surahId) => {
        const surahStr = surahId.toString().padStart(3, '0');
        const url = `${selectedReciter.moshaf[0].server}${surahStr}.mp3`;
        
        if (currentAudio) {
            currentAudio.pause();
        }

        const audio = new Audio(url);
        setCurrentAudio(audio);
        setIsPlaying(true);
        setAudioMetadata({
            reciterName: selectedReciter.name,
            surahName: language === 'ar' ? ARABIC_SURAH_NAMES[surahId - 1] : SURAH_NAMES[surahId - 1],
            surahId: surahId
        });

        audio.play().catch(e => {
            console.error('Playback failed:', e);
            setAudioError('Playback failed');
        });

        audio.addEventListener('timeupdate', () => {
            setProgress((audio.currentTime / audio.duration) * 100);
        });

        audio.addEventListener('ended', () => {
            setIsPlaying(false);
            setProgress(0);
        });

        setIsSurahModalOpen(false);
    };

    const togglePlayback = () => {
        if (!currentAudio) return;
        if (isPlaying) {
            currentAudio.pause();
        } else {
            currentAudio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const downloadSurah = (reciter, surahId) => {
        const surahStr = surahId.toString().padStart(3, '0');
        const url = `${reciter.moshaf[0].server}${surahStr}.mp3`;
        window.open(url, '_blank');
    };

    return (
        <div className="container mx-auto px-4 py-8 pt-24 min-h-screen pb-32" dir={dir}>
        <div className="flex flex-col items-center text-center gap-10 mb-16 w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-4 max-w-4xl">
                    <h1 className={`${language === 'en' ? 'text-3xl sm:text-4xl md:text-6xl' : 'text-2xl sm:text-3xl md:text-5xl'} font-black uppercase tracking-tighter leading-[1.1] text-black dark:text-white wrap-break-word max-w-full`}>
                        {t('navQuran')}
                    </h1>
                </div>

                <div className="relative w-full max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                    <Input 
                        placeholder={t('searchReciter')}
                        className="pl-12 h-14 bg-white dark:bg-zinc-900 border-none rounded-2xl text-lg focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white transition-all shadow-premium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-zinc-300" />
                    <p className="text-zinc-400 animate-pulse">{t('loading')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredReciters.map((reciter) => (
                        <Card 
                            key={reciter.id}
                            className="group p-6 bg-white dark:bg-zinc-900 border-border/10 hover:border-black dark:hover:border-white transition-all duration-500 cursor-pointer rounded-4xl shadow-sm hover:shadow-xl relative overflow-hidden"
                            onClick={() => handleSelectReciter(reciter)}
                        >
                            <div className={`absolute top-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                <Headphones className="h-16 w-16" />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <AudioLines className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <h3 className="type-card-title line-clamp-1 mb-1">
                                    {reciter.name}
                                </h3>
                                <p className="type-ui line-clamp-1 mb-4 italic opacity-60">
                                    {reciter.mosque || (language === 'ar' ? "رواية حفص عن عاصم" : "Riwayat Hafs 'an Asim")}
                                </p>
                                
                                <div className="flex items-center type-label opacity-100 group-hover:text-black dark:group-hover:text-white transition-colors">
                                    <span>{reciter.moshaf[0]?.surah_list?.split(',').length || 0} {t('surahs')}</span>
                                    {dir === 'rtl' ? (
                                        <ChevronLeft className="h-4 w-4 mr-1 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Surah Selection Modal */}
            <Dialog open={isSurahModalOpen} onOpenChange={setIsSurahModalOpen}>
                <DialogContent className="max-w-2xl bg-white dark:bg-zinc-900 border-none rounded-[2.5rem] shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-8 pb-0">
                        <DialogTitle className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter flex items-center gap-3">
                            <AudioLines className="h-8 w-8" />
                            {selectedReciter?.name}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-base">
                            {t('selectSurahToListen')}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[60vh] p-8 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {selectedReciter?.moshaf[0]?.surah_list?.split(',').map((id) => (
                                <button
                                    key={id}
                                    onClick={() => playSurah(id)}
                                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all group text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="h-10 w-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-black group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                            {id.padStart(3, '0')}
                                        </span>
                                        <div>
                                            <p className="font-bold text-black dark:text-white">
                                                {language === 'ar' ? ARABIC_SURAH_NAMES[parseInt(id) - 1] : SURAH_NAMES[parseInt(id) - 1]}
                                            </p>
                                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-tighter">
                                                {t('surah')} {id}
                                            </p>
                                        </div>
                                    </div>
                                    <Play className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Persistent Audio Player */}
            {audioMetadata && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-black/90 dark:bg-white inset-0 absolute blur-xl opacity-20 -z-10 rounded-full" />
                    <div className="bg-white dark:bg-zinc-900 border border-border/10 rounded-full p-4 pr-8 shadow-2xl flex items-center justify-between gap-6 backdrop-blur-xl">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="h-14 w-14 bg-black dark:bg-white rounded-full flex items-center justify-center shrink-0">
                                <Headphones className="h-6 w-6 text-white dark:text-black" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-black text-black dark:text-white leading-none mb-1 truncate uppercase tracking-tighter">
                                    {audioMetadata.surahName}
                                </h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest truncate">
                                    {audioMetadata.reciterName}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-4 w-48 bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden relative group">
                                <div 
                                    className="absolute inset-0 bg-black dark:bg-white transition-all duration-300 origin-left"
                                    style={{ transform: `scaleX(${progress / 100})` }}
                                />
                            </div>

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={togglePlayback}
                                className="h-14 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                            >
                                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                            </Button>

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => downloadSurah(selectedReciter, audioMetadata.surahId)}
                                className="h-14 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all hidden sm:flex"
                            >
                                <Download className="h-5 w-5" />
                            </Button>

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                    currentAudio?.pause();
                                    setAudioMetadata(null);
                                }}
                                className="h-10 w-10 text-zinc-400 hover:text-red-500 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuranRadio;
