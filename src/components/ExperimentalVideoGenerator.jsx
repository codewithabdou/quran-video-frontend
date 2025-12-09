import React, { useState } from "react";
import { Loader2, Video, Download, Sparkles, AlertCircle, AudioLines, Share2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SURAHS, RECITERS } from "../lib/constants";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";
import { videoGeneratorSchema } from "../lib/schemas";
import BackgroundSelector from "./BackgroundSelector";
import { Progress } from "@/components/ui/progress";
import axios from "axios";

const ExperimentalVideoGenerator = () => {
    const { t, dir, language } = useThemeLanguage();
    const [loading, setLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");

    // NODE BACKEND URL (Hardcoded or Env)
    const NODE_API_URL = import.meta.env.VITE_NODE_API_URL || "http://localhost:5000";

    const form = useForm({
        resolver: zodResolver(videoGeneratorSchema),
        defaultValues: {
            surah: "1",
            ayah_start: 1,
            ayah_end: 1,
            reciter_id: "ar.alafasy",
            platform: "reel",
            resolution: "720",
            background_url: "https://www.pexels.com/download/video/6527132/",
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setVideoUrl(null);
        setProgress(0);
        setStatusMessage("status_starting");

        // Generate Request ID
        const requestId = crypto.randomUUID();

        // Start SSE Subscriber
        const progressEndpoint = `${NODE_API_URL}/api/v1/progress/${requestId}`;
        const eventSource = new EventSource(progressEndpoint);

        eventSource.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.status === "completed" || payload.percentage === 100) {
                    setProgress(100);
                    setStatusMessage("status_completed");
                    eventSource.close();
                } else if (payload.percentage !== undefined) {
                    setProgress(payload.percentage);
                    setStatusMessage(payload.status);
                } else if (payload.error) {
                    toast.error(payload.error);
                    eventSource.close();
                }
            } catch (e) {
                console.error("Error parsing progress:", e);
            }
        };

        try {
            // Call Node Backend
            const response = await axios.post(`${NODE_API_URL}/api/v1/generate-video`, {
                ...data,
                surah: parseInt(data.surah),
                ayah_start: parseInt(data.ayah_start),
                ayah_end: parseInt(data.ayah_end),
                resolution: parseInt(data.resolution),
                reciter_id: data.reciter_id,
                translation_id: "en.sahih", // Default translation
                request_id: requestId,
                background_url: data.background_url,
                platform: data.platform
            }, {
                responseType: 'blob'
            });


            const url = URL.createObjectURL(response.data);
            setVideoUrl(url);
            toast.success(t('videoGeneratedSuccess'));
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message || t('errorSomethingWentWrong'));
        } finally {
            setLoading(false);
            eventSource.close();
        }
    };

    return (
        <div className="relative min-h-screen pt-8 w-full overflow-hidden bg-background font-sans selection:bg-primary/30" dir={dir}>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[30%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] animate-pulse"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
                <div className="w-full max-w-2xl flex flex-col gap-8">

                    {/* Left: Input Form */}
                    <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl border-purple-500/20">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
                                <Sparkles className="w-8 h-8 text-purple-600" />
                                {t('appTitle')}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-base">
                                {t('appDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">

                                        <FormField
                                            control={form.control}
                                            name="surah"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-foreground">{t('surah')}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-background/50 border-input focus:border-purple-500 focus:ring-purple-500/20 text-foreground">
                                                                <SelectValue placeholder={t('selectSurah')} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-popover border-border text-popover-foreground max-h-[300px]">
                                                            {SURAHS.map((surah) => (
                                                                <SelectItem key={surah.number} value={String(surah.number)}>
                                                                    {surah.number}. {language === 'ar' ? surah.arabicName : surah.name} {language !== 'ar' && `- ${surah.englishName}`}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="platform"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-foreground">{t('platform')}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-background/50 border-input focus:border-purple-500 focus:ring-purple-500/20 text-foreground">
                                                                <SelectValue placeholder={t('selectPlatform')} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                                            <SelectItem value="reel">{t('platformReel')}</SelectItem>
                                                            <SelectItem value="youtube">{t('platformYoutube')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="col-span-2">
                                            <FormField
                                                control={form.control}
                                                name="resolution"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-foreground">{t('resolution')}</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-background/50 border-input focus:border-purple-500 focus:ring-purple-500/20 text-foreground">
                                                                    <SelectValue placeholder={t('selectResolution')} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                                                <SelectItem value="360">{t('res360')}</SelectItem>
                                                                <SelectItem value="480">{t('res480')}</SelectItem>
                                                                <SelectItem value="720">{t('res720')}</SelectItem>
                                                                <SelectItem value="1080">{t('res1080')}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="ayah_start"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-foreground">{t('startAyah')}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            {...field}
                                                            className="bg-background/50 border-input focus:border-purple-500 focus:ring-purple-500/20 text-foreground"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="ayah_end"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-foreground">{t('endAyah')}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            {...field}
                                                            className="bg-background/50 border-input focus:border-purple-500 focus:ring-purple-500/20 text-foreground"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Background Selector */}
                                    <FormField
                                        control={form.control}
                                        name="background_url"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-foreground">{t('selectBackground')}</FormLabel>
                                                <FormControl>
                                                    <BackgroundSelector
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        platform={form.watch('platform')}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="reciter_id"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-foreground flex items-center gap-2">
                                                    <AudioLines className="w-4 h-4" /> {t('reciter')}
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 border-input focus:border-purple-500 focus:ring-purple-500/20 text-foreground">
                                                            <SelectValue placeholder={t('selectReciter')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-popover border-border text-popover-foreground max-h-[300px]">
                                                        {RECITERS.map((reciter) => (
                                                            <SelectItem key={reciter.id} value={reciter.id}>
                                                                {language === 'ar' && reciter.arabicName ? reciter.arabicName : reciter.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-300 transform hover:scale-[1.02]"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                {t('generating')}
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-5 w-5" />
                                                {t('generateBtn')}
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Right: Result / Preview */}
                    <div className="flex flex-col gap-6">
                        <Card className="h-full min-h-[500px] border-border bg-card/50 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group border-purple-500/20">
                            {/* Placeholder Pattern */}
                            {!videoUrl && !loading && (
                                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#a855f7_1px,transparent_1px)] dark:bg-[radial-gradient(#d8b4fe_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            )}

                            {loading ? (
                                <div className="flex flex-col items-center gap-4 z-10 text-muted-foreground w-3/4 max-w-sm">
                                    <div className="relative mb-4">
                                        <div className="w-16 h-16 rounded-full border-4 border-muted border-t-purple-500 animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="w-full space-y-2 text-center">
                                        <p className="font-medium text-foreground animate-pulse">{statusMessage ? t(statusMessage) : t('creatingMagic')}</p>
                                        <Progress value={progress} className="w-full h-2 bg-purple-100 dark:bg-purple-900" />
                                        <p className="text-xs text-muted-foreground">{progress}%</p>
                                    </div>
                                </div>
                            ) : videoUrl ? (
                                <div className="w-full h-full p-4 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl border border-border group-hover:border-purple-500/30 transition-colors">
                                        <video
                                            src={videoUrl}
                                            controls
                                            className="w-full h-full object-contain bg-black"
                                        />
                                    </div>
                                    <div className="flex gap-2 w-full">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-input hover:bg-accent hover:text-accent-foreground text-purple-600 border-purple-200 dark:border-purple-800"
                                            onClick={() => {
                                                const a = document.createElement("a");
                                                a.href = videoUrl;
                                                a.download = `quran_reels_${form.getValues('surah')}.mp4`;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                            }}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            {t('downloadBtn')}
                                        </Button>
                                        <Button
                                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(videoUrl);
                                                    const blob = await response.blob();
                                                    const file = new File([blob], `quran_reels_${form.getValues('surah')}.mp4`, { type: 'video/mp4' });

                                                    if (navigator.share && navigator.canShare({ files: [file] })) {
                                                        await navigator.share({
                                                            files: [file],
                                                            title: 'Quran Video',
                                                            text: 'Check out this video generated with Quran Video Generator!'
                                                        });
                                                    } else {
                                                        toast.error(t('shareNotSupported'));
                                                    }
                                                } catch (err) {
                                                    console.error("Sharing failed:", err);
                                                    toast.error(t('errorSomethingWentWrong'));
                                                }
                                            }}
                                        >
                                            <Share2 className="mr-2 h-4 w-4" />
                                            {t('shareBtn')}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 z-10 text-muted-foreground">
                                    <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-2 rotate-3 group-hover:rotate-6 transition-transform duration-500">
                                        <Video className="w-10 h-10 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-medium text-foreground">{t('previewTitle')}</h3>
                                        <p className="text-sm">{t('previewText')}</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default ExperimentalVideoGenerator;
