import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
// import { createClient } from 'pexels'; // Removed to avoid browser require errors

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// Data from provided IDs
const VIDEO_IDS = [
    6527132,
    4600287,
    4778336,
    5006168,
    6889380,
    11025478
];

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

            const apiKey = import.meta.env.VITE_PEXELS_API_KEY;
            if (!apiKey) {
                setError("Missing API Key");
                setLoading(false);
                return;
            }

            try {
                // Fetch all videos concurrently using native fetch
                const promises = VIDEO_IDS.map(async (id) => {
                    const response = await fetch(`https://api.pexels.com/videos/videos/${id}`, {
                        headers: {
                            Authorization: apiKey
                        }
                    });
                    if (!response.ok) throw new Error(`Failed to fetch video ${id}`);
                    return response.json();
                });

                const results = await Promise.all(promises);
                setVideos(results);
            } catch (err) {
                console.error("Failed to fetch videos:", err);
                setError("Failed to load videos");
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    // Helper to find the best quality video link for backend processing
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

    if (error) {
        return (
            <div className="flex items-center justify-center p-8 bg-destructive/10 rounded-xl border border-destructive/20 text-destructive">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{error}</span>
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
