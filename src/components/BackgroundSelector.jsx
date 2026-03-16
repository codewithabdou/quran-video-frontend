import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const BackgroundSelector = ({ value, onChange, className, platform }) => {
    const { t, dir, language } = useThemeLanguage();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasFetched = React.useRef(false);

    useEffect(() => {
        const fetchVideos = async () => {
            // Prevent running twice in StrictMode
            if (hasFetched.current) return;
            hasFetched.current = true;

            const API_URL = import.meta.env.VITE_NODE_API_URL || 'http://localhost:5000';

            try {
                // Fetch from backend API
                const response = await fetch(`${API_URL}/api/v1/backgrounds`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch backgrounds: ${response.status}`);
                }

                const data = await response.json();

                if (data.videos && data.videos.length > 0) {
                    setVideos(data.videos);
                    // Auto-select the first background if none is selected yet
                    if (!value || value === 'default') {
                        const firstVideoLink = getBestVideoLink(data.videos[0]);
                        onChange(firstVideoLink);
                    }
                } else {
                    // Show friendly message instead of error
                    setError(null);
                    setVideos([]);
                }
            } catch (err) {
                console.error("Failed to fetch videos:", err);
                // Don't show error, just use empty state
                setError(null);
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    // Helper to get download URL
    const getBestVideoLink = (videoData) => {
        if (videoData.video_files && videoData.video_files.length > 0) {
            return videoData.video_files[0].link;
        }
        return `https://www.pexels.com/download/video/${videoData.id}/`; // fallback
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-card/40 rounded-4xl border border-dashed border-primary/10 transition-all duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                    <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" />
                </div>
                <span className="mt-4 text-sm font-medium text-muted-foreground tracking-wide animate-pulse">{t('summoningBackgrounds')}</span>
            </div>
        );
    }

    // If no videos loaded, show info message (not an error)
    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-sacred-cream/30 dark:bg-sacred-obsidian/30 rounded-4xl border border-primary/5">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-primary/40" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1 uppercase tracking-wider">{t('backgroundUnavailable')}</h3>
                <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-[200px]">
                    {t('backgroundUnavailableDesc')}
                </p>
            </div>
        );
    }

    return (
        <div className={cn("w-full", className)}>
            <div className="relative w-full">
                <Swiper
                    key={`${language}-${dir}`}
                    modules={[Navigation]}
                    navigation
                    dir={dir}
                    rtl={dir === 'rtl'}
                    spaceBetween={20}
                    slidesPerView={1}
                    className={cn("w-full py-2", platform !== 'youtube' && "max-w-[280px] mx-auto")}
                >
                    {videos.map((video) => {
                        const videoLink = getBestVideoLink(video);
                        const isSelected = value === videoLink;

                        return (
                            <SwiperSlide key={video.id}>
                                <div className="p-2">
                                    <div
                                        className={cn(
                                            "cursor-pointer group relative overflow-hidden rounded-[2.5rem] transition-all duration-500",
                                            isSelected ? "ring-4 ring-primary ring-offset-4 ring-offset-background scale-[0.98] shadow-2xl shadow-primary/20" : "hover:scale-[1.02]"
                                        )}
                                        onClick={() => onChange(videoLink)}
                                    >
                                        <div className={cn(
                                            "relative w-full overflow-hidden flex items-center justify-center",
                                            platform === 'youtube' ? "aspect-video" : "aspect-9/16"
                                        )}>
                                            <img
                                                src={video.image}
                                                alt={video.user.name}
                                                className={cn(
                                                    "w-full h-full object-cover transition-transform duration-700",
                                                    isSelected ? "scale-110" : "group-hover:scale-105"
                                                )}
                                                loading="lazy"
                                                decoding="async"
                                            />

                                            {/* Gradient Overlays */}
                                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                                            
                                            {/* Selection Visuals */}
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-primary/10 transition-all duration-500 flex items-center justify-center">
                                                    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in slide-in-from-bottom-2 duration-500">
                                                        <Check className="w-8 h-8" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </div>
    );
};

export default BackgroundSelector;
