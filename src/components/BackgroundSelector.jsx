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
    const { t } = useThemeLanguage();
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
        return `https://www.pexels.com/download/video/${videoData.id}/`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 bg-card/50 rounded-xl border border-dashed border-border">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">{t('loadingBackgrounds') || "Loading backgrounds..."}</span>
            </div>
        );
    }

    // If no videos loaded, show info message (not an error)
    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{t('backgroundUnavailable')}</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-500 text-center">
                    {t('backgroundUnavailableDesc')}
                </p>
            </div>
        );
    }

    return (
        <div className={cn("w-full", className)}>
            <div className="relative w-full px-8">
                {/* px-8 provides space for navigation arrows */}
                <Swiper
                    modules={[Navigation]}
                    navigation
                    spaceBetween={16}
                    slidesPerView={1}
                    breakpoints={{
                        640: {
                            slidesPerView: 1,
                        },
                        1024: {
                            slidesPerView: 1,
                        },
                    }}
                    className={cn("w-full py-4", platform !== 'youtube' && "max-w-xs mx-auto")}
                >
                    {videos.map((video) => {
                        const videoLink = getBestVideoLink(video);
                        const isSelected = value === videoLink;

                        return (
                            <SwiperSlide key={video.id}>
                                <div className="p-1">
                                    <Card
                                        className={cn(
                                            "cursor-pointer transition-all duration-300 hover:scale-105 border-2 relative overflow-hidden group",
                                            isSelected ? "border-primary shadow-lg shadow-primary/20 scale-105" : "border-transparent opacity-80 hover:opacity-100"
                                        )}
                                        onClick={() => onChange(videoLink)}
                                    >
                                        <CardContent className={cn(
                                            "flex items-center justify-center p-0 relative",
                                            platform === 'youtube' ? "aspect-[16/9]" : "aspect-[9/16]"
                                        )}>
                                            <img
                                                src={video.image}
                                                alt={video.user.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                decoding="async"
                                            />

                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                                            {/* Selection Indicator */}
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-primary text-primary-foreground rounded-full p-1 shadow-md animate-in zoom-in">
                                                    <Check className="w-3 h-3 md:w-4 md:h-4" />
                                                </div>
                                            )}

                                            {/* User Credit */}
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                <p className="text-[10px] text-white/90 truncate">
                                                    {t('by') || "By"} {video.user.name}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
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
