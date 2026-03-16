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

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-6 py-8 md:py-12 flex flex-col items-center justify-center text-center max-w-7xl min-h-[70vh]">
                {/* Main Title - CSS handles serif/arabic context */}
                <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-foreground leading-[1.5] mb-8">
                    {t('welcomeTitle')}
                </h1>

                {/* Description */}
                <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed mb-10">
                    {t('welcomeDesc')}
                </p>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Button 
                        size="lg" 
                        className="h-16 px-10 rounded-full text-lg font-bold shadow-premium hover-glow bg-primary text-primary-foreground border-none"
                        onClick={onAuthRequired}
                    >
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
