import React, { useState, useEffect, useCallback } from 'react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { 
    Clock, 
    MapPin, 
    Calendar, 
    Loader2, 
    ChevronRight,
    Search,
    Sun,
    Sunrise,
    Sunset,
    Moon,
    AlertCircle
} from 'lucide-react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const PrayerTimes = () => {
    const { t, dir, language } = useThemeLanguage();
    const [timings, setTimings] = useState(null);
    const [hijriDate, setHijriDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [locationName, setLocationName] = useState(t('detecting'));
    const [countdown, setCountdown] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const fetchTimings = useCallback(async (lat, lng) => {
        try {
            setLoading(true);
            const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`);
            const data = await response.json();
            setTimings(data.data.timings);
            setHijriDate(data.data.date.hijri);
            
            // Try to get location name
            const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const geoData = await geoResponse.json();
            setLocationName(geoData.address.city || geoData.address.town || geoData.address.state || t('myLocation'));
            
            setError(null);
            
            // Persist location
            localStorage.setItem('prayer-lat', lat);
            localStorage.setItem('prayer-lng', lng);
        } catch (err) {
            console.error('Failed to fetch timings:', err);
            setError('Failed to load prayer times');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Try to load from localStorage first
        const savedLat = localStorage.getItem('prayer-lat');
        const savedLng = localStorage.getItem('prayer-lng');

        if (savedLat && savedLng) {
            fetchTimings(parseFloat(savedLat), parseFloat(savedLng));
            return;
        }

        const timeoutId = setTimeout(() => {
            if (loading && !timings) {
                setShowSearch(true);
                setLoading(false);
                setError(null);
            }
        }, 5000);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    clearTimeout(timeoutId);
                    fetchTimings(pos.coords.latitude, pos.coords.longitude);
                },
                (err) => {
                    clearTimeout(timeoutId);
                    console.error('Geolocation error:', err);
                    setShowSearch(true);
                    setLoading(false);
                },
                { timeout: 5000 }
            );
        } else {
            clearTimeout(timeoutId);
            setShowSearch(true);
            setLoading(false);
        }

        return () => clearTimeout(timeoutId);
    }, [fetchTimings]);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=${language}`);
            const data = await response.json();
            setSuggestions(data);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const selectLocation = (loc) => {
        const lat = parseFloat(loc.lat);
        const lon = parseFloat(loc.lon);
        fetchTimings(lat, lon);
        setSuggestions([]);
        setSearchQuery('');
        setShowSearch(false);
    };

    const updateCountdown = useCallback(() => {
        if (!timings) return;

        const now = new Date();
        const prayerList = [
            { name: 'Fajr', time: timings.Fajr },
            { name: 'Dhuhr', time: timings.Dhuhr },
            { name: 'Asr', time: timings.Asr },
            { name: 'Maghrib', time: timings.Maghrib },
            { name: 'Isha', time: timings.Isha }
        ];

        let next = null;
        let minDiff = Infinity;

        prayerList.forEach(prayer => {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            const prayerDate = new Date();
            prayerDate.setHours(hours, minutes, 0, 0);

            if (prayerDate < now) {
                prayerDate.setDate(prayerDate.getDate() + 1);
            }

            const diff = prayerDate - now;
            if (diff < minDiff) {
                minDiff = diff;
                next = { ...prayer, date: prayerDate };
            }
        });

        setNextPrayer(next);

        // Format countdown string
        const diffMs = next.date - now;
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);

        setCountdown(`${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`);
    }, [timings]);

    useEffect(() => {
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [updateCountdown]);

    const prayerIcons = {
        Fajr: Sunrise,
        Dhuhr: Sun,
        Asr: Sun,
        Maghrib: Sunset,
        Isha: Moon
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-24 space-y-4 bg-zinc-50 dark:bg-black">
                <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">{t('calculatingTimings')}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 pt-24 min-h-screen pb-32" dir={dir}>
            <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center gap-10 w-full max-w-5xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="space-y-4 w-full">
                    <h1 className={`${language === 'en' ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'} font-black uppercase tracking-tighter leading-none text-black dark:text-white`}>
                        {t('navPrayers')}
                    </h1>
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-xl md:text-2xl font-black text-primary uppercase tracking-wider">
                            {locationName}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 opacity-80">
                            <span>{new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300" />
                            <span>{hijriDate?.day} {language === 'ar' ? hijriDate?.month.ar : hijriDate?.month.en} {hijriDate?.year}</span>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 text-[10px] uppercase font-black tracking-widest text-zinc-400 hover:text-black dark:hover:text-white"
                            onClick={() => setShowSearch(!showSearch)}
                        >
                            <MapPin className="h-3 w-3 mr-1" />
                            {t('changeLocation')}
                        </Button>
                    </div>
                </div>

                {/* Location Search Bar */}
                {showSearch && (
                    <div className="relative w-full max-w-xl group animate-in fade-in slide-in-from-top-4 duration-300">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                        <Input 
                            placeholder={t('searchCity')}
                            className="pl-12 h-14 bg-white dark:bg-zinc-900 border-none rounded-2xl text-lg focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white transition-all shadow-premium"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-zinc-400" />
                        )}

                        {suggestions.length > 0 && (
                            <Card className="absolute z-50 w-full bg-white dark:bg-zinc-900 border-none shadow-2xl rounded-2xl overflow-hidden mt-2 p-2 space-y-1">
                                {suggestions.map((loc) => (
                                    <button
                                        key={loc.place_id}
                                        onClick={() => selectLocation(loc)}
                                        className="w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-3 group"
                                    >
                                        <MapPin className="h-5 w-5 text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
                                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white">
                                            {loc.display_name}
                                        </span>
                                    </button>
                                ))}
                            </Card>
                        )}
                    </div>
                )}

                {/* Hero: Next Prayer Card (Compact Row) */}
                {nextPrayer && (
                    <div className="w-full max-w-2xl mx-auto">
                        <div className="bg-black dark:bg-zinc-100 p-6 md:p-8 rounded-3xl text-white dark:text-black flex items-center justify-between shadow-xl relative overflow-hidden transition-all hover:scale-[1.01] duration-500 group border-4 border-primary">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-white/10 dark:bg-black/5 rounded-2xl flex items-center justify-center shrink-0">
                                    {React.createElement(prayerIcons[nextPrayer.name] || Sunrise, { className: "h-6 w-6 text-primary" })}
                                </div>
                                <h2 className="text-3xl md:text-4xl font-arabic font-bold text-white dark:text-black leading-none">
                                    {t(nextPrayer.name.toLowerCase())}
                                </h2>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <p className="text-4xl md:text-5xl font-black tracking-tighter font-mono text-primary">
                                    {countdown}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

                {error && (
                    <Card className="p-12 border-none bg-red-50 dark:bg-red-950/20 text-center mb-8 rounded-[3rem]">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mb-2 uppercase tracking-tighter">{t('errorTitle')}</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-6">{error}</p>
                        <Button className="rounded-full px-8 bg-red-600 text-white hover:bg-red-700" onClick={() => window.location.reload()}>
                            {t('retry')}
                        </Button>
                    </Card>
                )}

                <div className="mt-8 flex flex-col md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 w-full max-w-4xl mx-auto">
                    {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((name) => {
                        const Icon = prayerIcons[name] || Sunrise;
                        const isActive = nextPrayer?.name === name;
                        
                        return (
                            <Card 
                                key={name}
                                className={`group p-5 md:p-6 rounded-3xl border-none transition-all duration-500 shadow-sm hover:shadow-xl relative overflow-hidden flex flex-row md:flex-col items-center md:text-center justify-between md:justify-center ${
                                    isActive 
                                    ? 'bg-zinc-100 dark:bg-zinc-800 ring-2 ring-black dark:ring-white border-2 border-primary' 
                                    : 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800'
                                }`}
                            >
                                <div className="flex items-center gap-4 md:flex-col md:gap-3">
                                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${
                                        isActive ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400'
                                    }`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    
                                    <h3 className="text-lg md:text-sm font-arabic font-bold text-black dark:text-white md:text-zinc-500 md:dark:text-zinc-400 leading-none">
                                        {t(name.toLowerCase()) || name}
                                    </h3>
                                </div>
                                
                                <p className="text-2xl md:text-xl font-black text-black dark:text-white mt-0 md:mt-2">
                                    {timings?.[name]}
                                </p>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PrayerTimes;
