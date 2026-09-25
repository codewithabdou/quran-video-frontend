import React from "react";
import { Download, Share2, CheckCircle2, XCircle, Film, RefreshCw, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SURAHS } from "@/lib/constants";
import { useThemeLanguage } from "@/contexts/ThemeLanguageContext";

const SoundwaveVisualizer = () => (
    <div className="flex items-end justify-center gap-1.5 h-16 py-2" aria-label="audio-loading">
        <span className="w-1.5 bg-primary/80 rounded-full animate-pulse h-6"></span>
        <span className="w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.4s] h-10"></span>
        <span className="w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.2s] h-14"></span>
        <span className="w-1.5 bg-primary/90 rounded-full animate-pulse [animation-delay:-0.5s] h-8"></span>
        <span className="w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.1s] h-16"></span>
        <span className="w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s] h-11"></span>
        <span className="w-1.5 bg-primary/80 rounded-full animate-pulse h-5"></span>
    </div>
);

const GenerationResult = ({
    loading = false,
    videoUrl = null,
    progress = 0,
    queuePosition = null,
    statusMessage = "",
    showCancel = false,
    onCancel,
    onDismiss,
    platform = "reel",
    formValues = {},
}) => {
    const { t, dir, language } = useThemeLanguage();

    if (!loading && !videoUrl) {
        return null;
    }

    const isReel = platform === "reel";

    const getFileName = () => {
        const surahNum = parseInt(formValues?.surah || 1, 10);
        const surahData = SURAHS.find((s) => s.number === surahNum);
        const surahName = surahData ? surahData.name.replace(/[^a-zA-Z0-9-]/g, "") : `Surah${surahNum}`;
        const start = formValues?.ayah_start || 1;
        const end = formValues?.ayah_end || 1;
        const res = formValues?.resolution || 720;
        const plat = formValues?.platform || "reel";
        return `${surahName}_Ayah${start}-${end}_${res}p_${plat}.mp4`;
    };

    const handleDownload = () => {
        if (!videoUrl) return;
        const fileName = getFileName();
        const a = document.createElement("a");
        a.href = videoUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(t("downloadSuccess") || (language === "ar" ? "بدأ تحميل الفيديو" : "Download started"));
    };

    const handleShare = async () => {
        if (!videoUrl) return;
        const fileName = getFileName();
        try {
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const file = new File([blob], fileName, { type: "video/mp4" });

            const surahNum = parseInt(formValues?.surah || 1, 10);
            const surahData = SURAHS.find((s) => s.number === surahNum);
            const title = `Quran - ${surahData ? surahData.name : "Video"} (${formValues?.ayah_start || 1}-${formValues?.ayah_end || 1})`;

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title,
                    files: [file],
                });
            } else if (navigator.share) {
                await navigator.share({
                    title,
                    text: "Check out this video generated with Quran Video Generator!",
                    url: window.location.href,
                });
            } else {
                toast.error(t("shareNotSupported"));
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("Sharing failed:", err);
                toast.error(t("shareNotSupported"));
            }
        }
    };

    return (
        <Card
            className="w-full border-none bg-card/60 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700"
            dir={dir}
        >
            <CardHeader className="p-5 sm:p-6 md:p-8 pb-4 border-b border-border/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                        "w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-md shrink-0 bg-primary/10 text-primary",
                        loading && "animate-pulse"
                    )}>
                        {loading ? <Film className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">
                            {loading
                                ? (t("generatingVideoTitle") || (language === "ar" ? "جاري إنشاء الفيديو القرآني..." : "Generating Quran Video..."))
                                : (t("generationResultTitle") || (language === "ar" ? "فيديو القرآن المنشأ" : "Generated Quran Video"))}
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 whitespace-nowrap sm:whitespace-normal">
                            {loading
                                ? (statusMessage === "status_queued" && queuePosition
                                    ? t("status_queued_position").replace("{{position}}", queuePosition)
                                    : statusMessage ? t(statusMessage) : t("status_processing_video"))
                                : (language === "ar" ? "الفيديو جاهز للمشاهدة والتحميل والمشاركة" : "Your video is ready to watch, download and share")}
                        </p>
                    </div>
                </div>

                {videoUrl && onDismiss && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDismiss}
                        className="rounded-full text-xs text-muted-foreground hover:text-foreground h-8 sm:h-9 px-3 shrink-0 self-start sm:self-center"
                    >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                        <span className="whitespace-nowrap">{t("closeResult") || (language === "ar" ? "إغلاق النتيجة" : "Dismiss")}</span>
                    </Button>
                )}
            </CardHeader>

            <CardContent className="p-6 md:p-10 flex flex-col items-center justify-center">
                {loading ? (
                    /* Loading State */
                    <div className="w-full max-w-md py-8 flex flex-col items-center gap-6 text-center">
                        <div className="flex justify-center items-center min-h-[90px]">
                            <SoundwaveVisualizer />
                        </div>

                        <div className="w-full space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold px-1">
                                <span className="text-muted-foreground uppercase tracking-wider">
                                    {statusMessage ? t(statusMessage) : t("status_processing_video")}
                                </span>
                                <span className="font-mono text-primary text-sm">{progress}%</span>
                            </div>

                            <Progress value={progress} className="w-full h-2.5 bg-primary/10 rounded-full" />
                        </div>

                        {showCancel && onCancel && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                                onClick={onCancel}
                            >
                                <XCircle className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                                {t("cancelGeneration")}
                            </Button>
                        )}
                    </div>
                ) : (
                    /* Completed Video State */
                    <div className="w-full flex flex-col items-center gap-8">
                        {/* Video Player */}
                        <div
                            className={cn(
                                "relative w-full rounded-3xl overflow-hidden shadow-2xl border border-border/20 bg-black flex items-center justify-center transition-all duration-500",
                                isReel ? "aspect-[9/16] max-h-[620px] max-w-md" : "aspect-video max-w-3xl"
                            )}
                        >
                            <video
                                src={videoUrl}
                                controls
                                preload="metadata"
                                playsInline
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Action Buttons Row */}
                        <div className="w-full max-w-xl flex flex-col sm:flex-row items-center gap-4">
                            <Button
                                onClick={handleDownload}
                                className="w-full sm:flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 text-base flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                <span>{t("downloadBtn")}</span>
                            </Button>

                            <Button
                                onClick={handleShare}
                                variant="outline"
                                className="w-full sm:flex-1 h-14 rounded-2xl border-primary/25 hover:bg-primary/5 text-primary font-bold text-base flex items-center justify-center gap-2"
                            >
                                <Share2 className="w-5 h-5" />
                                <span>{t("shareBtn")}</span>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default GenerationResult;
