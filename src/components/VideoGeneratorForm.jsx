import React, { useState } from "react";
import { Loader2, Video, Download, Sparkles, AlertCircle } from "lucide-react";
import { AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateVideo } from "../api/video";

const VideoGeneratorForm = () => {
    const [loading, setLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        surah: 108,
        ayah_start: 1,
        ayah_end: 1,
        reciter_id: "ar.alafasy",
        platform: "reel",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            if (!formData.surah || !formData.ayah_start || !formData.ayah_end) {
                throw new Error("Please fill in all required fields.");
            }

            const videoBlob = await generateVideo({
                ...formData,
                surah: parseInt(formData.surah),
                ayah_start: parseInt(formData.ayah_start),
                ayah_end: parseInt(formData.ayah_end),
            });

            const url = URL.createObjectURL(videoBlob);
            setVideoUrl(url);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 font-sans selection:bg-emerald-500/30">
            {/* Animated Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
                <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-start">

                    {/* Left: Input Form */}
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-emerald-500 tracking-wider uppercase">AI Generator</span>
                            </div>
                            <CardTitle className="text-3xl font-bold text-white">
                                Create Quran Reels
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-base">
                                Transform Quran verses into engaging short videos with beautiful backgrounds and recitations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="surah" className="text-slate-200">Surah Number</Label>
                                        <Input
                                            id="surah"
                                            name="surah"
                                            type="number"
                                            min="1"
                                            max="114"
                                            value={formData.surah}
                                            onChange={handleInputChange}
                                            required
                                            className="bg-slate-950/50 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 text-white placeholder:text-slate-600"
                                            placeholder="e.g. 108"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="platform" className="text-slate-200">Format</Label>
                                        <Select
                                            name="platform"
                                            value={formData.platform}
                                            onValueChange={(val) => handleSelectChange("platform", val)}
                                        >
                                            <SelectTrigger className="bg-slate-950/50 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 text-white">
                                                <SelectValue placeholder="Select platform" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                <SelectItem value="reel">📱 TikTok / Reels (9:16)</SelectItem>
                                                <SelectItem value="youtube">📺 YouTube (16:9)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ayah_start" className="text-slate-200">Start Ayah</Label>
                                        <Input
                                            id="ayah_start"
                                            name="ayah_start"
                                            type="number"
                                            min="1"
                                            value={formData.ayah_start}
                                            onChange={handleInputChange}
                                            required
                                            className="bg-slate-950/50 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ayah_end" className="text-slate-200">End Ayah</Label>
                                        <Input
                                            id="ayah_end"
                                            name="ayah_end"
                                            type="number"
                                            min="1"
                                            value={formData.ayah_end}
                                            onChange={handleInputChange}
                                            required
                                            className="bg-slate-950/50 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reciter" className="text-slate-200 flex items-center gap-2">
                                        <AudioLines className="w-4 h-4" /> Reciter
                                    </Label>
                                    <Select
                                        name="reciter_id"
                                        value={formData.reciter_id}
                                        onValueChange={(val) => handleSelectChange("reciter_id", val)}
                                    >
                                        <SelectTrigger className="bg-slate-950/50 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 text-white">
                                            <SelectValue placeholder="Select reciter" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                            <SelectItem value="ar.alafasy">Mishary Rashid Alafasy</SelectItem>
                                            <SelectItem value="ar.abdulbasitmurattal">Abdul Basit (Murattal)</SelectItem>
                                            <SelectItem value="ar.husary">Al-Husary</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {error && (
                                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500 animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/20 transition-all duration-300 transform hover:scale-[1.02]"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Generating Your Reel...
                                        </>
                                    ) : (
                                        <>
                                            <Video className="mr-2 h-5 w-5" />
                                            Generate Video
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Right: Result / Preview */}
                    <div className="flex flex-col gap-6">
                        <Card className="h-full min-h-[500px] border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                            {/* Placeholder Pattern */}
                            {!videoUrl && !loading && (
                                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            )}

                            {loading ? (
                                <div className="flex flex-col items-center gap-4 z-10 text-slate-400">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="animate-pulse">Creating magic...</p>
                                </div>
                            ) : videoUrl ? (
                                <div className="w-full h-full p-4 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl border border-slate-800 group-hover:border-emerald-500/30 transition-colors">
                                        <video
                                            src={videoUrl}
                                            controls
                                            className="w-full h-full object-contain bg-black"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full border-slate-700 hover:bg-slate-800 text-emerald-500 hover:text-emerald-400"
                                        onClick={() => {
                                            const a = document.createElement("a");
                                            a.href = videoUrl;
                                            a.download = `quran_reels_${formData.surah}_${formData.ayah_start}-${formData.ayah_end}.mp4`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                        }}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download MP4
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 z-10 text-slate-500">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-2 rotate-3 group-hover:rotate-6 transition-transform duration-500">
                                        <Video className="w-10 h-10 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-medium text-slate-300">Preview Area</h3>
                                        <p className="text-sm">Your generated video will appear here.</p>
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

export default VideoGeneratorForm;
