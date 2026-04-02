import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, ArrowLeft, ChevronLeft, ChevronRight, BookOpen, RefreshCw, Download, Clock, AlertCircle, Eye, Share2, Play, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SURAHS } from '../lib/constants';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const NODE_API_URL = import.meta.env.VITE_NODE_API_URL || 'http://localhost:5000';

const statusStyles = {
    completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
    cancelled: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

export default function HistoryPage() {
    const { t, language, dir } = useThemeLanguage();
    const [generations, setGenerations] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [previewVideo, setPreviewVideo] = useState(null);
    const navigate = useNavigate();

    const fetchHistory = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`${NODE_API_URL}/api/v1/history`, {
                params: { page, limit: 10 },
            });
            setGenerations(res.data.generations);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
            toast.error(t('failedLoadHistory'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '—';
        if (seconds < 60) return `${Math.round(seconds)}s`;
        return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    };

    const getTimeLeft = (expiresAt) => {
        const diff = new Date(expiresAt) - new Date();
        if (diff <= 0) return null;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const handleDownload = (jobId) => {
        window.open(`${NODE_API_URL}/api/v1/download/${jobId}`, '_blank');
    };

    const handleShare = async (gen) => {
        const shareUrl = `${NODE_API_URL}/api/v1/download/${gen.id}`;
        const shareTitle = t('appTitle');
        const shareText = `${t('ayah')} ${gen.surah}:${gen.ayahStart}-${gen.ayahEnd}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                console.error(err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success(t('linkCopied'));
            } catch (err) {
                toast.error(t('copyFailed'));
            }
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 pt-24" dir={dir}>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-between gap-3 justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="md:text-3xl text-xl font-bold flex items-center gap-2">
                                <History className=" text-primary" />
                                {t('genHistoryTitle')}
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                {pagination.total} {pagination.total === 1 ? t('totalGenerations') : t('totalGenerations_plural')}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => fetchHistory(pagination.page)} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {t('refresh')}
                    </Button>
                </div>

                {/* History Cards */}
                {loading && generations.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground animate-pulse">
                        {t('loadingHistory')}
                    </div>
                ) : generations.length === 0 ? (
                    <Card className="border-border bg-card/50 backdrop-blur-sm">
                        <CardContent className="py-16 text-center">
                            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-2">{t('noGenerations')}</h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                {t('noGenerationsDesc')}
                            </p>
                            <Button onClick={() => navigate('/generate')} className="gap-2">
                                <BookOpen className="w-4 h-4" />
                                {t('createFirstVideo')}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {generations.map((gen) => (
                            <Card
                                key={gen.id}
                                className="border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
                            >
                                <CardContent className="p-5">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        {/* Info Section */}
                                        <div className="flex-1 space-y-2.5">
                                            <div className="flex items-center flex-wrap gap-2">
                                                <h3 className="text-lg font-bold">
                                                    {(() => {
                                                        const surah = SURAHS.find(s => s.number === gen.surah);
                                                        if (!surah) return `Surah ${gen.surah}`;
                                                        return language === 'ar' ? surah.arabicName : surah.name;
                                                    })()}
                                                </h3>
                                                <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-md">
                                                    {t('ayah')} {gen.ayahStart}–{gen.ayahEnd}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${statusStyles[gen.status] || 'bg-muted text-muted-foreground'}`}>
                                                    {t(`status_${gen.status}`) || gen.status}
                                                </span>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium opacity-70">{t('reciterLabel')}</span>
                                                    <span className="text-foreground/90 font-semibold">{gen.reciterId}</span>
                                                </div>
                                                <div className="h-1 w-1 rounded-full bg-muted-foreground/30 hidden md:block" />
                                                <span>{gen.resolution}p • {gen.platform}</span>
                                                {gen.duration && (
                                                    <>
                                                        <div className="h-1 w-1 rounded-full bg-muted-foreground/30 hidden md:block" />
                                                        <span className="flex items-center gap-1">⏱ {formatDuration(gen.duration)}</span>
                                                    </>
                                                )}
                                                <div className="h-1 w-1 rounded-full bg-muted-foreground/30 hidden md:block" />
                                                <span className="opacity-70">{formatDate(gen.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Actions Section */}
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                            {gen.status === 'completed' && (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {gen.isAvailable ? (
                                                        <>
                                                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border border-border/40 mr-1">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {t('expiresIn')} {getTimeLeft(gen.expiresAt)}
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    className="flex-1 sm:flex-none h-9 px-3 gap-2"
                                                                    onClick={() => setPreviewVideo(`${NODE_API_URL}/api/v1/download/${gen.id}`)}
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    {t('view')}
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    className="flex-1 sm:flex-none h-9 px-3 gap-2"
                                                                    onClick={() => handleShare(gen)}
                                                                >
                                                                    <Share2 className="w-4 h-4" />
                                                                    {t('share')}
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    className="flex-1 sm:flex-none h-9 px-4 gap-2 font-semibold shadow-sm"
                                                                    onClick={() => handleDownload(gen.id)}
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                    {t('download')}
                                                                </Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground/60 italic bg-muted/10 px-3 py-1.5 rounded-lg border border-dashed border-muted-foreground/20">
                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                            {t('expired')}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Video Preview Modal */}
                <Dialog open={!!previewVideo} onOpenChange={(open) => !open && setPreviewVideo(null)}>
                    <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-3xl p-0 overflow-hidden bg-black border-none rounded-2xl">
                        <DialogHeader className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                            <DialogTitle className="text-lg font-bold">{t('previewTitle')}</DialogTitle>
                        </DialogHeader>
                        <div className="bg-black flex items-center justify-center relative p-1">
                            {previewVideo && (
                                <video 
                                    src={previewVideo} 
                                    className="w-full h-auto max-h-[75vh] rounded-lg shadow-2xl" 
                                    controls 
                                    autoPlay
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchHistory(pagination.page - 1)}
                            disabled={pagination.page <= 1 || loading}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground px-3">
                            {t('page')} {pagination.page} {t('of')} {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchHistory(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages || loading}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
