import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, ArrowLeft, ChevronLeft, ChevronRight, BookOpen, RefreshCw } from 'lucide-react';
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

    return (
        <div className="min-h-screen bg-background p-6 pt-24" dir={dir}>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <History className="w-8 h-8 text-primary" />
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
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold truncate">
                                                    {(() => {
                                                        const surah = SURAHS.find(s => s.number === gen.surah);
                                                        if (!surah) return `Surah ${gen.surah}`;
                                                        return language === 'ar' ? surah.arabicName : surah.name;
                                                    })()}
                                                </h3>
                                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                                                    {t('ayah')} {gen.ayahStart}–{gen.ayahEnd}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <span>{t('reciterLabel')} <strong className="text-foreground/80">{gen.reciterId}</strong></span>
                                                <span>{gen.resolution}p • {gen.platform}</span>
                                                {gen.duration && <span>⏱ {formatDuration(gen.duration)}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[gen.status] || 'bg-muted text-muted-foreground'}`}>
                                                {gen.status}
                                            </span>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDate(gen.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

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
