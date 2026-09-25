import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Film, Layers, Zap, Loader2, ShieldCheck, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

const PreflightSummary = ({
    plan,
    timedPlan,
    loadingPlan = false,
    loadingPreflight = false,
    loading = false,
    onGenerate,
}) => {
    const { t, dir } = useThemeLanguage();

    const resolvedTimedPlan = timedPlan?.screens ? timedPlan : (timedPlan?.timedPlan || null);
    const activePlan = resolvedTimedPlan || plan;
    const screens = activePlan?.screens || [];
    const totalScreens = screens.length;

    const recitationMs = resolvedTimedPlan?.duration?.recitationMs 
        || (totalScreens * 4000);
    const recitationSec = Math.round(recitationMs / 1000);
    const outroSec = 5;
    const totalVideoSec = recitationSec + outroSec;

    const MAX_RECITATION_SEC = 180;
    const isDurationExceeded = recitationSec > MAX_RECITATION_SEC;
    const durationPercentage = Math.min(100, Math.round((recitationSec / MAX_RECITATION_SEC) * 100));

    const isCalculating = loadingPlan || (loadingPreflight && totalScreens === 0);
    const allScreensFit = totalScreens > 0 && screens.every(s => s.layout?.fits !== false);

    return (
        <div className="space-y-5" dir={dir}>
            {/* Preflight Metrics Card */}
            <div className="p-5 rounded-3xl bg-muted/20 border border-border/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/10">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-bold text-foreground">
                            {t('preflightSummary')}
                        </h4>
                    </div>

                    {activePlan?.planHash && (
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold">
                            <Hash className="w-3 h-3" />
                            <span>{activePlan.planHash.slice(0, 8)}</span>
                        </div>
                    )}
                </div>

                {/* Duration Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            {t('totalRecitationDuration')}
                        </span>
                        <span className={cn(
                            "font-bold font-mono flex items-center gap-1.5",
                            isDurationExceeded ? "text-destructive" : "text-foreground"
                        )}>
                            {loadingPreflight && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                            {recitationSec}s / {MAX_RECITATION_SEC}s
                        </span>
                    </div>

                    <Progress
                        value={durationPercentage}
                        className={cn(
                            "h-2 rounded-full",
                            isDurationExceeded ? "bg-destructive/20 [&>div]:bg-destructive" : "bg-primary/10 [&>div]:bg-primary"
                        )}
                    />
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                    <div className="p-2.5 rounded-2xl bg-card/60 border border-border/10">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                            {t('screens')}
                        </span>
                        <span className="text-base font-black text-foreground font-mono">
                            {totalScreens}
                        </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-card/60 border border-border/10">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                            {t('outroDuration')}
                        </span>
                        <span className="text-base font-black text-foreground font-mono">
                            {outroSec}s
                        </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-card/60 border border-border/10">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                            {t('totalVideoDuration')}
                        </span>
                        <span className="text-base font-black text-primary font-mono">
                            ~{totalVideoSec}s
                        </span>
                    </div>
                </div>

                {/* Safe Area Layout Status */}
                <div className="flex items-center gap-2 pt-1 text-xs">
                    {isCalculating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                            <span className="text-muted-foreground font-medium">
                                {t('calculatingPlan')}
                            </span>
                        </>
                    ) : allScreensFit ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-primary/90 font-medium">
                                {t('previewFitGood')}
                            </span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-amber-500/90 font-medium">
                                {t('previewFitWarning')}
                            </span>
                        </>
                    )}
                </div>

                {/* Duration Exceeded Error */}
                {isDurationExceeded && (
                    <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{t('recitationLimitWarning')}</span>
                    </div>
                )}
            </div>

            {/* Generate Action Button */}
            <Button
                type="button"
                onClick={onGenerate}
                disabled={loading || isDurationExceeded || loadingPlan || loadingPreflight || !allScreensFit || !activePlan || totalScreens === 0}
                className={cn(
                    "w-full h-16 text-lg font-black rounded-2xl shadow-2xl transition-all duration-500 border-none group",
                    (isDurationExceeded || !allScreensFit || totalScreens === 0)
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] shadow-primary/25"
                )}
            >
                {loading ? (
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="animate-pulse">{t('generating')}</span>
                    </div>
                ) : loadingPreflight ? (
                    <div className="flex items-center gap-2.5">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t('calculatingPlan')}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5">
                        <Zap className="w-5 h-5 fill-current" />
                        <span>{t('generateBtn')}</span>
                    </div>
                )}
            </Button>
        </div>
    );
};

export default PreflightSummary;
