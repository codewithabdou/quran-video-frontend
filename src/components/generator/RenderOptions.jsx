import React from 'react';
import { Smartphone, Video, AudioLines, Monitor, Languages, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RECITERS } from '@/lib/constants';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import BackgroundSelector from '../BackgroundSelector';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

const RenderOptions = ({
    platform,
    onChangePlatform,
    textMode,
    onChangeTextMode,
    reciterId,
    onChangeReciter,
    resolution,
    onChangeResolution,
    backgroundUrl,
    onChangeBackground,
}) => {
    const { t, language, dir } = useThemeLanguage();

    return (
        <div className="space-y-6" dir={dir}>
            {/* Platform & Text Mode Row */}
            <div className="grid sm:grid-cols-2 gap-4">
                {/* Format / Platform */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5 text-primary" />
                        {t('platform')}
                    </label>

                    <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-muted/30 border border-border/10">
                        <button
                            type="button"
                            onClick={() => onChangePlatform('reel')}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all duration-300",
                                platform === 'reel'
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            )}
                        >
                            <Smartphone className="w-4 h-4" />
                            <span>9:16 Reel</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onChangePlatform('youtube')}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all duration-300",
                                platform === 'youtube'
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            )}
                        >
                            <Video className="w-4 h-4" />
                            <span>16:9 Video</span>
                        </button>
                    </div>
                </div>

                {/* Text Display Mode */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-primary" />
                        {t('textMode')}
                    </label>

                    <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-muted/30 border border-border/10">
                        <button
                            type="button"
                            onClick={() => onChangeTextMode('bilingual')}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all duration-300",
                                textMode === 'bilingual'
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            )}
                        >
                            <Languages className="w-4 h-4" />
                            <span>{t('modeBilingual')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onChangeTextMode('arabic_only')}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all duration-300",
                                textMode === 'arabic_only'
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            )}
                        >
                            <span className="font-arabic font-bold text-sm">عربي</span>
                            <span>{t('modeArabicOnly')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Background Selector */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                    {t('selectBackground')}
                </label>
                <BackgroundSelector
                    value={backgroundUrl}
                    onChange={onChangeBackground}
                    platform={platform}
                />
            </div>

            {/* Reciter & Resolution Row */}
            <div className="grid sm:grid-cols-2 gap-4">
                {/* Reciter */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                        <AudioLines className="w-3.5 h-3.5 text-primary" />
                        {t('reciter')}
                    </label>
                    <Select value={reciterId} onValueChange={onChangeReciter}>
                        <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border border-border/10 focus:bg-background focus:ring-2 focus:ring-primary/20 text-sm font-semibold">
                            <SelectValue placeholder={t('selectReciter')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border/20 shadow-2xl max-h-[300px]">
                            {RECITERS.map((r) => (
                                <SelectItem key={r.id} value={r.id} className="rounded-xl p-3">
                                    <span className="font-medium text-sm">
                                        {language === 'ar' && r.arabicName ? r.arabicName : r.name}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Resolution */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        {t('resolution')}
                    </label>
                    <Select value={String(resolution)} onValueChange={onChangeResolution}>
                        <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border border-border/10 focus:bg-background focus:ring-2 focus:ring-primary/20 text-sm font-semibold">
                            <SelectValue placeholder={t('selectResolution')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border/20 shadow-2xl">
                            <SelectItem value="360" className="rounded-xl">{t('res360')}</SelectItem>
                            <SelectItem value="480" className="rounded-xl">{t('res480')}</SelectItem>
                            <SelectItem value="720" className="rounded-xl">{t('res720')}</SelectItem>
                            <SelectItem value="1080" className="rounded-xl">{t('res1080')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};

export default RenderOptions;
