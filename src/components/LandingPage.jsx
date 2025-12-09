import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sparkles, Play, Video, Smartphone, Zap } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { t, dir } = useThemeLanguage();

    return (
        <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-background selection:bg-purple-500/30" dir={dir}>

            {/* Ambient Background Effects */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col items-center justify-center text-center">

                {/* Hero Badge */}
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wider">The Future of Dawah</span>
                </div>

                {/* Main Title */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                    {t('welcomeTitle') || "Create Beautiful Quran Reels"}
                </h1>

                {/* Description */}
                <p className="text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 leading-relaxed">
                    {t('welcomeDesc') || "Generate stunning videos with synchronized audio and subtitles for any platform in seconds."}
                </p>

                {/* CTA Button */}
                <div className="animate-in fade-in scale-in duration-1000 delay-300">
                    <Button
                        size="lg"
                        onClick={() => navigate('/generate')}
                        className="h-14 px-8 text-lg bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 group"
                    >
                        <Play className="mr-2 w-5 h-5 fill-current" />
                        {t('startNowBtn') || "Start Generating"}
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default LandingPage;
