import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { BookOpen, Play, Video, Smartphone, Zap, Users, BarChart3 } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useAuth } from '../contexts/AuthContext';

const NODE_API_URL = import.meta.env.VITE_NODE_API_URL || "http://localhost:5000";

const LandingPage = ({ onAuthRequired }) => {
    const navigate = useNavigate();
    const { t, dir } = useThemeLanguage();
    const { isAuthenticated } = useAuth();
    const [stats, setStats] = useState({ totalGenerations: 0, activeUsers: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Use a clean axios instance without auth headers
                // to ensure this works for anonymous/unauthenticated visitors
                const res = await axios.create().get(`${NODE_API_URL}/api/v1/public/stats`);
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch public stats:", err);
            }
        };
        fetchStats();
    }, []);

    const handleStartGenerating = () => {
        if (isAuthenticated) {
            navigate('/generate');
        } else {
            if (onAuthRequired) {
                onAuthRequired();
            } else {
                navigate('/generate'); // Fallback to protected route redirect
            }
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] w-full overflow-hidden flex flex-col items-center justify-center bg-background selection:bg-primary/20 py-8 md:py-6" dir={dir}>

            {/* Premium Background: Mesh Gradient + Noise */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Mesh elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse duration-[10s]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sacred-terracotta/5 dark:bg-sacred-gold/5 blur-[120px] animate-pulse duration-[15s] delay-1000"></div>
                
                {/* Subtle Grid texture */}
                <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

                {/* Noise static overlay */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('/noise.svg')]"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center max-w-5xl">
                {/* Main Title - CSS handles serif/arabic context */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight md:leading-[1.15] mb-4 md:mb-5 max-w-4xl">
                    {t('welcomeTitle')}
                </h1>

                {/* Description */}
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed mb-6 md:mb-8">
                    {t('welcomeDesc')}
                </p>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8 md:mb-10">
                    <Button 
                        size="lg" 
                        className="h-13 sm:h-14 px-8 sm:px-10 rounded-full text-base sm:text-lg font-bold shadow-premium hover-glow bg-primary text-primary-foreground border-none transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                        onClick={handleStartGenerating}
                    >
                        {t('startNowBtn')}
                    </Button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-xl md:max-w-2xl w-full">
                    <div className="group relative p-4 sm:p-5 md:py-6 md:px-8 rounded-3xl md:rounded-4xl bg-card/30 backdrop-blur-md border border-border/10 shadow-premium hover:bg-card/40 transition-all duration-500 overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex flex-col items-center gap-2 md:gap-2.5">
                            <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-primary/10 text-primary mb-1">
                                <Video className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-black tracking-tighter text-foreground italic">
                                {stats.totalGenerations.toLocaleString()}+
                            </span>
                            <span className="text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider md:tracking-widest text-muted-foreground/70">
                                {t('totalGenerationsStat')}
                            </span>
                        </div>
                    </div>

                    <div className="group relative p-4 sm:p-5 md:py-6 md:px-8 rounded-3xl md:rounded-4xl bg-card/30 backdrop-blur-md border border-border/10 shadow-premium hover:bg-card/40 transition-all duration-500 overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex flex-col items-center gap-2 md:gap-2.5">
                            <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-primary/10 text-primary mb-1">
                                <Users className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-black tracking-tighter text-foreground italic">
                                {stats.activeUsers.toLocaleString()}+
                            </span>
                            <span className="text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider md:tracking-widest text-muted-foreground/70">
                                {t('activeUsersStat')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Cursor / Ambient Flow element (Hidden on mobile) */}
            <div className="hidden xl:block absolute bottom-3 left-1/2 -translate-x-1/2 animate-bounce opacity-20 pointer-events-none">
                <div className="w-px h-6 bg-linear-to-b from-primary to-transparent"></div>
            </div>
        </div>
    );
};

export default LandingPage;
