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
        <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden flex flex-col items-center justify-center bg-background selection:bg-primary/20 pb-20" dir={dir}>

            {/* Premium Background: Mesh Gradient + Noise */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Mesh elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse duration-[10s]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sacred-terracotta/5 dark:bg-sacred-gold/5 blur-[120px] animate-pulse duration-[15s] delay-1000"></div>
                
                {/* Subtle Grid texture */}
                <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

                {/* Noise static overlay */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-6 py-8 md:py-12 flex flex-col items-center justify-center text-center max-w-7xl min-h-[70vh]">
                {/* Main Title - CSS handles serif/arabic context */}
                <h1 className="text-4xl md:text-8xl font-bold tracking-tight text-foreground leading-normal mb-8">
                    {t('welcomeTitle')}
                </h1>

                {/* Description */}
                <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed mb-10">
                    {t('welcomeDesc')}
                </p>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
                    <Button 
                        size="lg" 
                        className="h-16 px-10 rounded-full text-lg font-bold shadow-premium hover-glow bg-primary text-primary-foreground border-none"
                        onClick={onAuthRequired}
                    >
                        {t('startNowBtn')}
                    </Button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-3xl w-full">
                    <div className="group relative p-6 md:p-8 rounded-4xl bg-card/30 backdrop-blur-md border border-border/10 shadow-premium hover:bg-card/40 transition-all duration-500 overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-2">
                                <Video className="w-6 h-6" />
                            </div>
                            <span className="text-3xl md:text-5xl font-black tracking-tighter text-foreground italic">
                                {stats.totalGenerations.toLocaleString()}+
                            </span>
                            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
                                {t('totalGenerationsStat')}
                            </span>
                        </div>
                    </div>

                    <div className="group relative p-6 md:p-8 rounded-4xl bg-card/30 backdrop-blur-md border border-border/10 shadow-premium hover:bg-card/40 transition-all duration-500 overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-2">
                                <Users className="w-6 h-6" />
                            </div>
                            <span className="text-3xl md:text-5xl font-black tracking-tighter text-foreground italic">
                                {stats.activeUsers.toLocaleString()}+
                            </span>
                            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
                                {t('activeUsersStat')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Cursor / Ambient Flow element (Hidden on mobile) */}
            <div className="hidden lg:block absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
                <div className="w-px h-12 bg-linear-to-b from-primary to-transparent"></div>
            </div>
        </div>
    );
};

export default LandingPage;
