import React, { useState } from "react";
import { Loader2, Video, Download, BookOpen, AlertCircle, AudioLines, Share2 } from "lucide-react";
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
import NotificationPermissionDialog from "./NotificationPermissionDialog";

const ExperimentalVideoGenerator = () => {
    const { t, dir, language } = useThemeLanguage();
    const [loading, setLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
    const [progress, setProgress] = useState(0);
    const [queuePosition, setQueuePosition] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [pendingFormData, setPendingFormData] = useState(null);

    // NODE BACKEND URL (Hardcoded or Env)
    const NODE_API_URL = import.meta.env.VITE_NODE_API_URL || "http://localhost:5000";
    const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

    // Helper for VAPID key conversion
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    const subscribeToPush = async (requestId) => {
        if (!VAPID_PUBLIC_KEY) return;
        if (!('serviceWorker' in navigator)) return;

        try {
            const register = await navigator.serviceWorker.register('/sw.js');

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;

            let subscription = await register.pushManager.getSubscription();

            if (!subscription) {
                subscription = await register.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });
            }

            // Send to backend
            await axios.post(`${NODE_API_URL}/api/v1/subscribe`, {
                requestId,
                subscription
            });
            console.log("Subscribed to push notifications for", requestId);
        } catch (e) {
            console.error("Push subscription failed:", e);
        }
    };

    const form = useForm({
        resolver: zodResolver(videoGeneratorSchema),
        defaultValues: {
            surah: "1",
            ayah_start: 1,
            ayah_end: 1,
            reciter_id: "ar.alafasy",
            platform: "reel",
            resolution: "720",
            background_url: "default", // Will use backend fallback video
        },
    });

    const startGeneration = async (data) => {
        setLoading(true);
        setVideoUrl(null);
        setProgress(0);
        setQueuePosition(null);
        setStatusMessage("status_queued");

        // Generate Request ID
        const requestId = crypto.randomUUID();

        // Subscribe to notifications BEFORE starting generation
        subscribeToPush(requestId);

        try {
            let finalBackgroundUrl = data.background_url;

            // If the user selected an external Pexels video, download it locally via the browser first (Residential IP)
            if (finalBackgroundUrl && finalBackgroundUrl !== 'default' && (finalBackgroundUrl.startsWith('http://') || finalBackgroundUrl.startsWith('https://'))) {
                try {
                    // Extract Video ID from Pexels mp4 URL (e.g. videos.pexels.com/.../6527132_hd...)
                    // Match any consecutive block of at least 5 digits in the URL.
                    const idMatch = finalBackgroundUrl.match(/videos\.pexels\.com.*?\/(\d{5,})/);
                    let pexelsId = idMatch ? idMatch[1] : null;
                    if (!pexelsId) {
                        // Fallback numeric extraction
                        const rawMatch = finalBackgroundUrl.match(/(\d{5,})/);
                        pexelsId = rawMatch ? rawMatch[1] : `fallback-${Date.now()}`;
                    }

                    // 1. Ask the backend if it already has this Pexels ID cached in its uploads directory
                    const checkResponse = await axios.post(`${NODE_API_URL}/api/v1/check-background`, {
                        id: pexelsId
                    });

                    if (checkResponse.data.exists) {
                        // Cache HIT! Instant generation.
                        finalBackgroundUrl = checkResponse.data.filePath;
                        console.log("Cache Hit! Server already has this background:", finalBackgroundUrl);
                    } else {
                        // Cache MISS. We must download it and upload it once.
                        setStatusMessage("fetching_background_locally");

                        // Fetch the MP4 directly into the browser
                        const videoBlob = await fetch(finalBackgroundUrl).then(r => {
                            if (!r.ok) throw new Error("Failed to fetch video directly");
                            return r.blob();
                        });

                        // Wrap in FormData and affix the exact ID BEFORE the file block 
                        // so Multer's filename parser can read the ID string before streaming the heavy video blob.
                        const formData = new FormData();
                        formData.append("id", pexelsId);
                        formData.append("file", videoBlob, "background.mp4");

                        // Upload to our Node backend
                        setStatusMessage("uploading_background_to_server");
                        const uploadResponse = await axios.post(`${NODE_API_URL}/api/v1/upload-background`, formData, {
                            headers: { "Content-Type": "multipart/form-data" }
                        });

                        // Override the payload to tell the backend to use the local saved file path
                        finalBackgroundUrl = uploadResponse.data.filePath;
                        console.log("Cache Miss. Successfully downloaded and cached permanently on server at:", finalBackgroundUrl);
                    }

                } catch (cacheOrUploadError) {
                    console.error("Browser caching/upload pipeline failed, falling back to legacy download:", cacheOrUploadError);
                    // It will attempt the default backend download logic as a desperate fallback if this fails
                }
            }

            setStatusMessage("status_queued");

            // 1. Queue the video generation job (returns immediately)
            const queueResponse = await axios.post(`${NODE_API_URL}/api/v1/generate-video`, {
                ...data,
                surah: parseInt(data.surah),
                ayah_start: parseInt(data.ayah_start),
                ayah_end: parseInt(data.ayah_end),
                resolution: parseInt(data.resolution),
                reciter_id: data.reciter_id,
                translation_id: "en.sahih",
                request_id: requestId,
                background_url: finalBackgroundUrl, // Send the localized upload path or the original
                platform: data.platform
            });

            const jobId = queueResponse.data.jobId;
            setStatusMessage("status_queued");

            // 2. Start SSE to track progress
            const progressEndpoint = `${NODE_API_URL}/api/v1/progress/${jobId}`;
            const eventSource = new EventSource(progressEndpoint);

            // Wrap SSE in a promise so we can await completion
            await new Promise((resolve, reject) => {
                eventSource.onmessage = (event) => {
                    try {
                        const payload = JSON.parse(event.data);
                        if (payload.status === "status_completed" || payload.status === "completed" || payload.percentage === 100) {
                            setProgress(100);
                            setStatusMessage("status_completed");
                            eventSource.close();
                            resolve();
                        } else if (payload.error) {
                            eventSource.close();
                            reject(new Error(payload.error));
                        } else if (payload.percentage !== undefined) {
                            setProgress(payload.percentage);
                            setStatusMessage(payload.status);
                            if (payload.queuePosition !== undefined) {
                                setQueuePosition(payload.queuePosition);
                            } else {
                                setQueuePosition(null);
                            }
                        }
                    } catch (e) {
                        console.error("Error parsing progress:", e);
                    }
                };

                eventSource.onerror = () => {
                    eventSource.close();
                    reject(new Error("Connection to progress stream lost"));
                };

                // Safety timeout — close SSE after 10 minutes
                setTimeout(() => {
                    eventSource.close();
                    reject(new Error("Generation timed out"));
                }, 10 * 60 * 1000);
            });

            // 3. Download the completed video
            setStatusMessage("status_downloading");
            const videoResponse = await axios.get(`${NODE_API_URL}/api/v1/download/${jobId}`, {
                responseType: 'blob'
            });

            const url = URL.createObjectURL(videoResponse.data);
            setVideoUrl(url);
            toast.success(t('videoGeneratedSuccess'));

        } catch (err) {
            console.error(err);

            // Safely extract error message to prevent React rendering crashes if response is an Object
            let errorMsg = t('errorSomethingWentWrong');
            if (err.response?.data?.error) {
                const apiErr = err.response.data.error;
                errorMsg = typeof apiErr === 'string' ? apiErr : apiErr.message || JSON.stringify(apiErr);
            } else if (err.message) {
                errorMsg = err.message;
            }

            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (data) => {
        if (!('Notification' in window)) {
            startGeneration(data);
            return;
        }

        if (Notification.permission === 'default') {
            setPendingFormData(data);
            setShowPermissionDialog(true);
        } else {
            startGeneration(data);
        }
    };

    const handleEnableNotifications = async () => {
        setShowPermissionDialog(false);
        if ('Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    toast.success(t('enableNotificationsTitle')); // Reusing title as simple success msg or could add strict key
                }
            } catch (e) {
                console.error("Permission request failed", e);
            }
        }
        if (pendingFormData) {
            startGeneration(pendingFormData);
            setPendingFormData(null);
        }
    };

    const handleSkipNotifications = () => {
        setShowPermissionDialog(false);
        if (pendingFormData) {
            startGeneration(pendingFormData);
            setPendingFormData(null);
        }
    };

    return (
        <div className="relative min-h-screen pt-8 w-full overflow-hidden bg-background font-sans selection:bg-primary/30" dir={dir}>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px]"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
                <div className="w-full max-w-2xl flex flex-col gap-8">

                    {/* Left: Input Form */}
                    <Card className="border-border bg-card/50 backdrop-blur-xl shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
                                <BookOpen className="w-8 h-8 text-primary" />
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
                                                            <SelectTrigger className="bg-background/50 border-input focus:border-primary focus:ring-primary/20 text-foreground">
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
                                                            <SelectTrigger className="bg-background/50 border-input focus:border-primary focus:ring-primary/20 text-foreground">
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
                                                                <SelectTrigger className="bg-background/50 border-input focus:border-primary focus:ring-primary/20 text-foreground">
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
                                                            className="bg-background/50 border-input focus:border-primary focus:ring-primary/20 text-foreground"
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
                                                            className="bg-background/50 border-input focus:border-primary focus:ring-primary/20 text-foreground"
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
                                                        <SelectTrigger className="bg-background/50 border-input focus:border-primary focus:ring-primary/20 text-foreground">
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
                                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all duration-300 transform hover:scale-[1.02]"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                {t('generating')}
                                            </>
                                        ) : (
                                            <>
                                                <BookOpen className="mr-2 h-5 w-5" />
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
                        <Card className="h-full min-h-[500px] border-border bg-card/50 backdrop-blur-xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
                            {/* Placeholder Pattern */}
                            {!videoUrl && !loading && (
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                            )}

                            {loading ? (
                                <div className="flex flex-col items-center gap-4 z-10 text-muted-foreground w-3/4 max-w-sm">
                                    <div className="relative mb-4">
                                        <div className="w-16 h-16 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                        </div>
                                    </div>
                                    <div className="w-full space-y-2 text-center">
                                        <p className="font-medium text-foreground animate-pulse">
                                            {statusMessage === 'status_queued' && queuePosition
                                                ? t('status_queued_position').replace('{{position}}', queuePosition)
                                                : statusMessage ? t(statusMessage) : t('status_processing_video')}
                                        </p>
                                        <Progress value={progress} className="w-full h-2 bg-primary/20" />
                                        <p className="text-xs text-muted-foreground">{progress}%</p>
                                    </div>
                                </div>
                            ) : videoUrl ? (
                                <div className="w-full h-full p-4 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl border border-border group-hover:border-primary/30 transition-colors">
                                        <video
                                            src={videoUrl}
                                            controls
                                            className="w-full h-full object-contain bg-black"
                                        />
                                    </div>
                                    <div className="flex gap-2 w-full">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-input hover:bg-accent hover:text-accent-foreground text-primary border-primary/20"
                                            onClick={() => {
                                                const values = form.getValues();
                                                const surahData = SURAHS.find(s => s.number === parseInt(values.surah));
                                                const surahName = surahData ? surahData.name.replace(/[^a-zA-Z0-9-]/g, '') : values.surah;
                                                const fileName = `${surahName}_Ayah${values.ayah_start}-${values.ayah_end}_${values.resolution}p_${values.platform}.mp4`;
                                                const a = document.createElement("a");
                                                a.href = videoUrl;
                                                a.download = fileName;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                            }}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            {t('downloadBtn')}
                                        </Button>
                                        <Button
                                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                                            onClick={async () => {
                                                try {
                                                    const values = form.getValues();
                                                    const surahData = SURAHS.find(s => s.number === parseInt(values.surah));
                                                    const surahName = surahData ? surahData.name.replace(/[^a-zA-Z0-9-]/g, '') : values.surah;
                                                    const fileName = `${surahName}_Ayah${values.ayah_start}-${values.ayah_end}_${values.resolution}p_${values.platform}.mp4`;

                                                    // Fetch the video blob from the object URL
                                                    const response = await fetch(videoUrl);
                                                    const blob = await response.blob();
                                                    const file = new File([blob], fileName, { type: 'video/mp4' });

                                                    // Check if the browser supports sharing files
                                                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                                        await navigator.share({
                                                            title: `Quran - ${surahData ? surahData.name : 'Video'} (${values.ayah_start}-${values.ayah_end})`,
                                                            files: [file],
                                                        });
                                                    } else if (navigator.share) {
                                                        // Fallback: share URL if file sharing is not supported
                                                        await navigator.share({
                                                            title: `Quran - ${surahData ? surahData.name : 'Video'}`,
                                                            text: 'Check out this video generated with Quran Video Generator!',
                                                            url: window.location.href
                                                        });
                                                    } else {
                                                        toast.error(t('shareNotSupported'));
                                                    }
                                                } catch (err) {
                                                    if (err.name !== 'AbortError') {
                                                        console.error("Sharing failed:", err);
                                                        toast.error(t('shareNotSupported'));
                                                    }
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
                                    <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-2 transition-transform duration-500">
                                        <Video className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
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


            <NotificationPermissionDialog
                open={showPermissionDialog}
                onOpenChange={setShowPermissionDialog}
                onEnable={handleEnableNotifications}
                onSkip={handleSkipNotifications}
            />
        </div>
    );
};

export default ExperimentalVideoGenerator;
