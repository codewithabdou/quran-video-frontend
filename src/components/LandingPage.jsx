import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { BookOpen, Play, Video, Smartphone, Zap } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = ({ onAuthRequired }) => {
    const navigate = useNavigate();
    const { t, dir } = useThemeLanguage();
    const { isAuthenticated } = useAuth();

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
        <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden flex flex-col items-center justify-center bg-background selection:bg-primary/20" dir={dir}>

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

            <div className="relative z-10 container mx-auto px-6 py-24 flex flex-col items-center justify-center text-center max-w-5xl">

                {/* Main Title - Serif & Bold */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-foreground mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 italic">
                    {t('welcomeTitle')}
                </h1>

                {/* Description - Sans & Warm */}
                <p className="text-lg md:text-2xl text-muted-foreground/80 max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 leading-relaxed font-medium">
                    {t('welcomeDesc')}
                </p>

                {/* CTA Button Group */}
                <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in scale-in duration-1000 delay-300">
                    <Button
                        size="lg"
                        onClick={handleStartGenerating}
                        className="h-16 px-10 text-lg rounded-full group shadow-2xl shadow-primary/20"
                    >
                        <Play className="mr-3 w-5 h-5 fill-current transition-transform group-hover:scale-110" />
                        {t('startNowBtn')}
                    </Button>
                </div>

            </div>

            {/* Custom Cursor / Ambient Flow element (Hidden on mobile) */}
            <div className="hidden lg:block absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
                <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent"></div>
            </div>
        </div>
    );
};

export default LandingPage;
