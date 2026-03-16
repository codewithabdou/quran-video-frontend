import React, { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, Video, Download, BookOpen, AlertCircle, AudioLines, Share2, XCircle, Zap, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Audio } from "react-loader-spinner";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    const [showCancel, setShowCancel] = useState(false);
    const [showActiveJobDialog, setShowActiveJobDialog] = useState(false);
    const [isCancelingActiveJob, setIsCancelingActiveJob] = useState(false);

    // Ref to track the active EventSource so we can close it on cancel
    const eventSourceRef = useRef(null);
    const loadingRef = useRef(loading); // Track loading state without stale closures in listeners
    // Ref to track stuck progress detection
    const lastProgressRef = useRef({ value: 0, timestamp: Date.now() });
    const stuckTimerRef = useRef(null);

    // Keep loadingRef in sync with loading state
    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    // Handle beforeunload (tab close/refresh) and unmount
    useEffect(() => {
        const handleUnload = () => {
            if (loadingRef.current) {
                // We use a fire-and-forget fetch to cancel the job reliably during unload
                try {
                    const cancelUrl = `${NODE_API_URL}/api/v1/generate-video/cancel`;
                    const token = localStorage.getItem('auth_token');
                    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                    fetch(cancelUrl, { method: 'DELETE', keepalive: true, headers }).catch(() => {});
                } catch (e) {
                    console.error("Failed to send cancel signal on unload", e);
                }
            }
        };

        window.addEventListener('beforeunload', handleUnload);

        // Cleanup on unmount
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            // If the component unmounts while still loading, cancel the job
            // NOTE: We do not trigger handleUnload() directly here because normal unmounts
            // in React (like strict mode) shouldn't arbitrarily kill backend processes if
            // the user is just navigating, but in our case, navigating away from the generator
            // *should* cancel it to save resources.
            if (loadingRef.current) {
                 const token = localStorage.getItem('auth_token');
                 const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                 fetch(`${NODE_API_URL}/api/v1/generate-video/cancel`, { method: 'DELETE', keepalive: true, headers }).catch(() => {});
            }
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    // Detect when progress is stuck at the same value for 60+ seconds
    useEffect(() => {
        if (!loading) {
            setShowCancel(false);
            if (stuckTimerRef.current) {
                clearInterval(stuckTimerRef.current);
                stuckTimerRef.current = null;
            }
            return;
        }

        stuckTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - lastProgressRef.current.timestamp;
            if (elapsed > 60000 && loading) {
                setShowCancel(true);
            }
        }, 5000);

        return () => {
            if (stuckTimerRef.current) {
                clearInterval(stuckTimerRef.current);
                stuckTimerRef.current = null;
            }
        };
    }, [loading]);

    // Update the stuck timer whenever progress changes
    useEffect(() => {
        lastProgressRef.current = { value: progress, timestamp: Date.now() };
        setShowCancel(false);
    }, [progress]);

    // Listen for messages from Service Worker (for push debugging)
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const handleMessage = (event) => {
            if (event.data && event.data.type === 'PUSH_RECEIVED') {
                console.log('%c[Push Received via SW Message] %o', 'color: #27b059; font-weight: bold;', event.data.payload);
                // Removed toast.info dev message
            } else if (event.data && event.data.type === 'PUSH_HEARTBEAT') {
                console.log('%c[SW Heartbeat] Push event just woke up the Service Worker!', 'color: #3b82f6; font-weight: italic;');
            }
        };

        navigator.serviceWorker.addEventListener('message', handleMessage);
        return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }, []);

    // Removed handleTestNotification method as requested after successful verification

    // Removed unused handleCancelGeneration method

    // NODE BACKEND URL (Hardcoded or Env)
    // NOTE: Hardcoded value for NODE_API_URL initialized outside the component to avoid dependency issues in hooks
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
        if (!VAPID_PUBLIC_KEY) {
            console.warn("[Push] No VAPID_PUBLIC_KEY configured. Skipping push subscription.");
            return null;
        }
        if (!('serviceWorker' in navigator)) {
            console.warn("[Push] Service workers not supported in this browser.");
            return null;
        }
        if (!('PushManager' in window)) {
            console.warn("[Push] Push API not supported in this browser.");
            return null;
        }

        try {
            const register = await navigator.serviceWorker.register('/sw.js');
            console.log("[Push] Service worker registered, scope:", register.scope);

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            console.log("[Push] Service worker is ready");

            // Always unsubscribe existing and create a fresh subscription
            // This ensures we never send a stale subscription to the backend
            let existingSubscription = await register.pushManager.getSubscription();
            if (existingSubscription) {
                console.log("[Push] Found existing subscription, unsubscribing for fresh one...");
                await existingSubscription.unsubscribe();
            }

            const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            console.log("[Push] New subscription created:");
            console.log("[Push]   Endpoint:", subscription.endpoint);
            console.log("[Push]   Keys present:", !!subscription.toJSON().keys);

            // Send to backend using axios withCredentials
            await axios.post(`${NODE_API_URL}/api/v1/subscribe`, {
                requestId,
                subscription: subscription.toJSON()
            }, { withCredentials: true });
            console.log("[Push] Subscription sent to backend for", requestId);
            return subscription.toJSON();
        } catch (e) {
            console.error("[Push] Push subscription failed:", e);
            return null;
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

    const selectedPlatform = form.watch('platform');

    const startGeneration = async (data) => {
        setLoading(true);
        setVideoUrl(null);
        setProgress(0);
        setQueuePosition(null);
        setStatusMessage("status_queued");

        // Generate Request ID
        const requestId = crypto.randomUUID();

        // Subscribe to notifications BEFORE starting generation
        const subscription = await subscribeToPush(requestId);

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
                    }, { withCredentials: true });

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
                            headers: { "Content-Type": "multipart/form-data" },
                            withCredentials: true
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
            console.log("[Frontend] Enqueuing job", requestId, "...");

            // 1. Queue the video generation job (reverted to axios withCredentials)
            const queueResponse = await axios.post(`${NODE_API_URL}/api/v1/generate-video`, {
                ...data,
                surah: parseInt(data.surah),
                ayah_start: parseInt(data.ayah_start),
                ayah_end: parseInt(data.ayah_end),
                resolution: parseInt(data.resolution),
                reciter_id: data.reciter_id,
                translation_id: "en.sahih",
                request_id: requestId,
                background_url: finalBackgroundUrl,
                platform: data.platform,
                language: language,
                subscription: subscription
            }, { withCredentials: true });

            const jobId = queueResponse.data.jobId;
            console.log("[Frontend] Job enqueued successfully. Job ID:", jobId);
            setStatusMessage("status_queued");

            // 2. Start SSE to track progress
            const progressEndpoint = `${NODE_API_URL}/api/v1/progress/${jobId}`;
            const eventSource = new EventSource(progressEndpoint);
            eventSourceRef.current = eventSource;

            // Wrap SSE in a promise so we can await completion
            await new Promise((resolve, reject) => {
                eventSource.onmessage = (event) => {
                    try {
                        const payload = JSON.parse(event.data);
                        if (payload.status === "cancelled") {
                            setProgress(0);
                            setStatusMessage("");
                            eventSource.close();
                            reject(new Error('cancelled'));
                        } else if (payload.status === "status_completed" || payload.status === "completed" || payload.percentage === 100) {
                            setProgress(100);
                            setStatusMessage("status_completed");
                            eventSource.close();
                            resolve();
                        } else if (payload.error) {
                            console.error("Backend generation error:", payload.error);
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
                    reject(new Error("errorConnectionLost"));
                };

                // Safety timeout — close SSE after 10 minutes
                const timeoutId = setTimeout(() => {
                    eventSource.close();
                    reject(new Error("errorGenerationTimeout"));
                }, 10 * 60 * 1000);

                // Assuming success/failure will eventually trigger a resolve/reject internally
                // We should clear the timeout when it does, but since it's wrapped in a promise, we handle it loosely 
                // in the `finally` block or let the UI reset it.
            });

            // 3. Download the completed video using fetch to bypass Axios/DevTools blob bug
            setStatusMessage("status_downloading");
            console.log("[Frontend] Downloading final video...");
            const videoResponse = await fetch(`${NODE_API_URL}/api/v1/download/${jobId}`, {
                credentials: 'include'
            });
            if (!videoResponse.ok) throw new Error("Failed to download video");
            
            const videoData = await videoResponse.blob();
            const url = URL.createObjectURL(videoData);
            setVideoUrl(url);
            toast.success(t('videoGeneratedSuccess'));

        } catch (err) {
            console.error(err);

            if (err.message === 'cancelled') {
                // The SSE detected a 'cancelled' status — show a friendly message
                toast.info(t('generationCancelled'));
            } else if (['errorConnectionLost', 'errorGenerationTimeout', 'errorGenerationFailed'].includes(err.message)) {
                toast.error(t(err.message));
                // Automatically request cancellation if we disconnected unintentionally
                const token = localStorage.getItem('auth_token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                fetch(`${NODE_API_URL}/api/v1/generate-video/cancel`, { method: 'DELETE', keepalive: true, headers }).catch(() => {});
            } else if (err.response?.status === 429 && err.response?.data?.error?.existingJobId) {
                // If they hit the concurrency limiter (has an active job), open the cancel dialog
                setShowActiveJobDialog(true);
            } else {
                // Determine standard error message
                let errorMsg = t('errorSomethingWentWrong');
                
                // If it's an error from our backend, it might be a translation key with params (e.g., key|param)
                const apiError = err.response?.data?.error;
                const rawErrorString = typeof apiError === 'object' ? apiError.message : (apiError || err.message);

                if (typeof rawErrorString === 'string') {
                    const [key, param] = rawErrorString.split('|');
                    
                    // Check if the key exists in our translations
                    const translated = t(key);
                    if (translated !== key) {
                        // It's a valid key
                        if (key === 'error_duration_limit') {
                            errorMsg = translated.replace('{{duration}}', param);
                        } else if (key === 'error_rate_limit') {
                            errorMsg = translated.replace('{{limit}}', param);
                        } else {
                            errorMsg = translated;
                        }
                    } else if (typeof apiError === 'object' && apiError.message) {
                        errorMsg = apiError.message;
                    } else if (err.message) {
                        errorMsg = err.message;
                    }
                }
                
                toast.error(errorMsg);
            }
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
                    toast.success(t('notificationEnabled'));
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

    const handleForceCancelActiveJob = async () => {
        setIsCancelingActiveJob(true);
        try {
            await axios.delete(`${NODE_API_URL}/api/v1/generate-video/cancel`);
            toast.success(t('cancelSuccess'));
            setShowActiveJobDialog(false);

            // Also clean up the local generation UI state if we're the same tab that started it
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            setLoading(false);
            setProgress(0);
            setQueuePosition(null);
            setStatusMessage("");
            setShowCancel(false);
        } catch (error) {
            console.error("Failed to cancel active job:", error);
            toast.error(t("failedCancelJob"));
        } finally {
            setIsCancelingActiveJob(false);
        }
    };

    return (
        <div className="relative min-h-screen pt-12 w-full overflow-hidden bg-background font-sans selection:bg-primary/20" dir={dir}>
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[5%] right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse duration-[12s]"></div>
                <div className="absolute bottom-[10%] left-[5%] w-[45%] h-[45%] rounded-full bg-sacred-terracotta/5 dark:bg-sacred-gold/5 blur-[100px] animate-pulse duration-[18s] delay-700"></div>
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 md:px-6 py-12 md:py-16">
                <div className="w-full max-w-[90rem] flex flex-col gap-8 md:gap-12">

                    {/* Header Section */}
                    <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <h1 className="text-3xl md:text-6xl font-bold tracking-tight text-foreground">
                            {t('appTitle')}
                        </h1>
                        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto font-medium">
                            {t('appDescription')}
                        </p>
                    </div>

                    <div className="flex flex-col lg:grid lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12 items-start w-full mx-auto">
                        {/* Form Section */}
                        <Card className="w-full border-none bg-card/50 backdrop-blur-xl shadow-premium animate-in fade-in slide-in-from-left-8 duration-1000 delay-100 rounded-[2rem] overflow-hidden">
                            <CardContent className="p-8">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        
                                        {/* Surah & Platform Row */}
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="surah"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel className="text-sm font-bold tracking-wide uppercase text-muted-foreground/80">{t('surah')}</FormLabel>
                                                        <Select 
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                const surah = SURAHS.find(s => String(s.number) === value);
                                                                if (surah) {
                                                                    const currentEnd = form.getValues("ayah_end");
                                                                    const currentStart = form.getValues("ayah_start");

                                                                    // Only update if current values are out of bounds for the new surah
                                                                    if (currentEnd > surah.ayahs || !currentEnd) {
                                                                        form.setValue("ayah_end", surah.ayahs);
                                                                    }
                                                                    
                                                                    if (currentStart > surah.ayahs) {
                                                                        form.setValue("ayah_start", 1);
                                                                    }
                                                                }
                                                            }} 
                                                            defaultValue={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none transition-all focus:bg-background focus:ring-2 focus:ring-primary/20">
                                                                    <SelectValue placeholder={t('selectSurah')} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-2xl border-border/10 shadow-2xl max-h-[400px]">
                                                                {SURAHS.map((surah) => (
                                                                    <SelectItem key={surah.number} value={String(surah.number)} className="rounded-xl p-3 focus:bg-primary/10 focus:text-primary">
                                                                        <div className="flex items-center w-full gap-4">
                                                                            <span className="text-[10px] font-bold w-6 h-6 shrink-0 flex items-center justify-center bg-muted rounded-full group-hover:bg-primary/20 transition-colors">{surah.number}</span>
                                                                            <span className="flex-1 font-medium text-sm text-left rtl:text-right">{language === 'ar' ? surah.arabicName : surah.name} {language !== 'ar' && `(${surah.englishName})`}</span>
                                                                            <span className="font-arabic text-lg text-primary/60 shrink-0">{surah.arabicName}</span>
                                                                        </div>
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
                                                    <FormItem className="space-y-3">
                                                        <FormLabel className="text-sm font-bold tracking-wide uppercase text-muted-foreground/80">{t('platform')}</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none transition-all focus:bg-background focus:ring-2 focus:ring-primary/20">
                                                                    <SelectValue placeholder={t('selectPlatform')} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-2xl border-border/10 shadow-2xl">
                                                                <SelectItem value="reel" className="rounded-xl p-3 focus:bg-primary/10 focus:text-primary">
                                                                    <div className="flex items-center gap-3">
                                                                        <Smartphone className="w-4 h-4" />
                                                                        <span>{t('platformReel')}</span>
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="youtube" className="rounded-xl p-3 focus:bg-primary/10 focus:text-primary">
                                                                    <div className="flex items-center gap-3">
                                                                        <Video className="w-4 h-4" />
                                                                        <span>{t('platformYoutube')}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Ayah Range Row */}
                                        <div className="grid grid-cols-2 gap-6 p-6 rounded-3xl bg-muted/20 border border-border/5">
                                            {/* Pre-calculate max ayahs for validation */}
                                            {(() => {
                                                const selectedSurahNum = form.watch("surah");
                                                const surahObj = SURAHS.find(s => String(s.number) === String(selectedSurahNum));
                                                const maxAyahs = surahObj ? surahObj.ayahs : 286;

                                                return (
                                                    <>
                                                        <FormField
                                                            control={form.control}
                                                            name="ayah_start"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-3">
                                                                    <FormLabel className="text-sm font-bold tracking-wide uppercase text-center w-full block text-muted-foreground/80">{t('startAyah')}</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            min="1"
                                                                            max={maxAyahs}
                                                                            {...field}
                                                                            className="text-center font-bold text-xl h-14 bg-background/50 border-none focus:ring-primary/40 shadow-sm"
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
                                                                <FormItem className="space-y-3">
                                                                    <FormLabel className="text-sm font-bold tracking-wide uppercase text-center w-full block text-muted-foreground/80">{t('endAyah')}</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            min="1"
                                                                            max={maxAyahs}
                                                                            {...field}
                                                                            className="text-center font-bold text-xl h-14 bg-background/50 border-none focus:ring-primary/40 shadow-sm"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </>
                                                );
                                            })()}
                                        </div>

                                        {/* Background Selector & Resolution Row */}
                                        <div className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="background_url"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel className="text-sm font-bold tracking-wide uppercase text-muted-foreground/80">{t('selectBackground')}</FormLabel>
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

                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="reciter_id"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-sm font-bold tracking-wide uppercase text-muted-foreground/80 flex items-center gap-2">
                                                                <AudioLines className="w-4 h-4 text-primary" strokeWidth={2} /> {t('reciter')}
                                                            </FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none transition-all focus:bg-background focus:ring-2 focus:ring-primary/20">
                                                                        <SelectValue placeholder={t('selectReciter')} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="rounded-2xl border-border/10 shadow-2xl max-h-[300px]">
                                                                    {RECITERS.map((reciter) => (
                                                                        <SelectItem key={reciter.id} value={reciter.id} className="rounded-xl p-3">
                                                                            <span className="font-medium">{language === 'ar' && reciter.arabicName ? reciter.arabicName : reciter.name}</span>
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
                                                    name="resolution"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-sm font-bold tracking-wide uppercase text-muted-foreground/80">{t('resolution')}</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none transition-all focus:bg-background focus:ring-2 focus:ring-primary/20">
                                                                        <SelectValue placeholder={t('selectResolution')} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="rounded-2xl border-border/10 shadow-2xl">
                                                                    <SelectItem value="360" className="rounded-xl">{t('res360')}</SelectItem>
                                                                    <SelectItem value="480" className="rounded-xl">{t('res480')}</SelectItem>
                                                                    <SelectItem value="720" className="rounded-xl">{t('res720')}</SelectItem>
                                                                    <SelectItem value="1080" className="rounded-xl">{t('res1080')}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-16 text-lg font-bold rounded-2xl shadow-2xl transition-all duration-500 hover:scale-[1.02] border-none group"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="h-6 w-6 animate-spin" />
                                                    <span className="animate-pulse">{t('generating')}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <span>{t('generateBtn')}</span>
                                                </div>
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>

                        {/* Result / Preview Section */}
                        <div className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                            <Card className="h-full min-h-[500px] border-none bg-card/50 backdrop-blur-xl shadow-premium flex flex-col items-center justify-center relative overflow-hidden group rounded-[2.5rem]">
                                {/* Placeholder Pattern */}
                                {!videoUrl && !loading && (
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                                )}

                                {loading ? (
                                    <div className="flex flex-col items-center gap-6 z-10 text-muted-foreground w-3/4 max-w-sm">
                                        <div className="flex justify-center items-center mb-4 min-h-[100px]">
                                            <Audio
                                                height="80"
                                                width="80"
                                                color="hsl(var(--primary))"
                                                ariaLabel="audio-loading"
                                                visible={true}
                                            />
                                        </div>
                                        <div className="w-full space-y-4 text-center">
                                            <div className="space-y-2">
                                                <p className="text-xl text-foreground font-medium animate-pulse">
                                                    {statusMessage === 'status_queued' && queuePosition
                                                        ? t('status_queued_position').replace('{{position}}', queuePosition)
                                                        : statusMessage ? t(statusMessage) : t('status_processing_video')}
                                                </p>
                                                <p className="text-sm text-muted-foreground tracking-wide uppercase font-bold">{progress}%</p>
                                            </div>
                                            <Progress value={progress} className="w-full h-1.5 bg-primary/10" />
                                            
                                            {showCancel && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-4 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                                                    onClick={() => setShowActiveJobDialog(true)}
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    {t('cancelGeneration')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ) : videoUrl ? (
                                    <div className="w-full h-full p-6 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                                        <div className={cn(
                                            "relative w-full rounded-3xl overflow-hidden shadow-2xl border border-border/10 group-hover:border-primary/20 transition-all duration-500 bg-black",
                                            selectedPlatform === 'youtube' ? 'aspect-video max-w-2xl' : 'aspect-[9/16] max-h-[700px]'
                                        )}>
                                            <video
                                                src={videoUrl}
                                                controls
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="flex gap-4 w-full">
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-14 rounded-full border-primary/20 hover:bg-primary/5 text-primary font-bold"
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
                                                <Download className="mr-2 h-5 w-5" />
                                                {t('downloadBtn')}
                                            </Button>
                                            <Button
                                                className="flex-1 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                                                onClick={async () => {
                                                    try {
                                                        const values = form.getValues();
                                                        const surahData = SURAHS.find(s => s.number === parseInt(values.surah));
                                                        const surahName = surahData ? surahData.name.replace(/[^a-zA-Z0-9-]/g, '') : values.surah;
                                                        const fileName = `${surahName}_Ayah${values.ayah_start}-${values.ayah_end}_${values.resolution}p_${values.platform}.mp4`;

                                                        const response = await fetch(videoUrl);
                                                        const blob = await response.blob();
                                                        const file = new File([blob], fileName, { type: 'video/mp4' });

                                                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                                            await navigator.share({
                                                                title: `Quran - ${surahData ? surahData.name : 'Video'} (${values.ayah_start}-${values.ayah_end})`,
                                                                files: [file],
                                                            });
                                                        } else if (navigator.share) {
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
                                                <Share2 className="mr-2 h-5 w-5" />
                                                {t('shareBtn')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-6 z-10 text-muted-foreground p-8">
                                        <div className="w-24 h-24 rounded-[2.5rem] bg-muted/30 flex items-center justify-center mb-4 transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                                            <Video className="w-10 h-10 text-primary/40 group-hover:text-primary transition-colors duration-500" strokeWidth={1.5} />
                                        </div>
                                        <div className="text-center space-y-3">
                                            <h3 className="text-2xl font-bold text-foreground">{t('previewTitle')}</h3>
                                            <p className="text-muted-foreground leading-relaxed max-w-[280px]">{t('previewText')}</p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>


            <NotificationPermissionDialog
                open={showPermissionDialog}
                onOpenChange={setShowPermissionDialog}
                onEnable={handleEnableNotifications}
                onSkip={handleSkipNotifications}
            />

            <AlertDialog open={showActiveJobDialog} onOpenChange={setShowActiveJobDialog}>
                <AlertDialogContent className="sm:max-w-md" dir={dir}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('cancelActiveJobTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('cancelActiveJobDesc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
                        <Button
                            variant="destructive"
                            onClick={handleForceCancelActiveJob}
                            disabled={isCancelingActiveJob}
                            className="w-full sm:w-auto mt-2 sm:mt-0"
                        >
                            {isCancelingActiveJob ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {t('confirmCancel')}
                        </Button>
                        <AlertDialogCancel disabled={isCancelingActiveJob} className="w-full sm:w-auto mt-0">
                            {t('keepGenerating')}
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ExperimentalVideoGenerator;
