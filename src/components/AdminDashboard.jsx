import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    AlertTriangle, Trash2, RefreshCw, Layers, Users, BarChart3,
    Search, Shield, ShieldOff, ChevronLeft, ChevronRight, ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "./ui/data-table";
import { getColumns } from "./admin/columns";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useThemeLanguage } from "../contexts/ThemeLanguageContext";

const NODE_API_URL = import.meta.env.VITE_NODE_API_URL || "http://localhost:5000";

// ──────────────── Overview Tab ────────────────
function OverviewTab() {
    const { t } = useThemeLanguage();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${NODE_API_URL}/api/v1/admin/stats`);
                setStats(res.data);
            } catch (err) {
                toast.error(t("failedLoadStats"));
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-center py-10 text-muted-foreground animate-pulse">{t("loadingStats")}</div>;
    }

    if (!stats) return null;

    const statCards = [
        { label: t("totalUsers"), value: stats.users.total, icon: Users },
        { label: t("totalGenerations"), value: stats.generations.total, icon: BarChart3 },
        { label: t("last24h"), value: stats.generations.last24h, icon: BarChart3 },
        { label: t("queueActive"), value: stats.queue.active, icon: Layers },
        { label: t("queueWaiting"), value: stats.queue.waiting, icon: Layers },
        { label: t("completedJobs"), value: stats.queue.completed, icon: Layers },
        { label: t("failedJobs"), value: stats.queue.failed, icon: AlertTriangle },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
                <Card key={card.label} className="border-border bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <card.icon className="w-4 h-4 text-primary" />
                            <span className="text-xs text-muted-foreground">{card.label}</span>
                        </div>
                        <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ──────────────── Users Tab ────────────────
function UsersTab() {
    const { t } = useThemeLanguage();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`${NODE_API_URL}/api/v1/admin/users`, {
                params: { page, limit: 20, search },
            });
            setUsers(res.data.users);
            setPagination(res.data.pagination);
        } catch (err) {
            toast.error(t("failedLoadUsers"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(1);
    };

    const toggleRole = async (user) => {
        const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
        setActionLoading(user.id);
        try {
            await axios.patch(`${NODE_API_URL}/api/v1/admin/users/${user.id}/role`, { role: newRole });
            toast.success(`${user.name} ${t("isNow")} ${newRole}.`);
            fetchUsers(pagination.page);
        } catch (err) {
            toast.error(err.response?.data?.error || t("failedUpdateRole"));
        } finally {
            setActionLoading(null);
        }
    };

    const deleteUser = async (user) => {
        setActionLoading(user.id);
        try {
            await axios.delete(`${NODE_API_URL}/api/v1/admin/users/${user.id}`);
            toast.success(`${user.name} ${t("hasBeenDeleted")}`);
            fetchUsers(pagination.page);
        } catch (err) {
            toast.error(err.response?.data?.error || t("failedDeleteUser"));
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t("searchPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <Button type="submit" variant="outline" size="sm">{t("search")}</Button>
            </form>

            {/* User List */}
            {loading ? (
                <div className="text-center py-10 text-muted-foreground animate-pulse">{t("loadingUsers")}</div>
            ) : (
                <div className="space-y-2">
                    {users.map((user) => (
                        <Card key={user.id} className="border-border bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="" className="w-9 h-9 rounded-full shrink-0" referrerPolicy="no-referrer" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium truncate">{user.name}</p>
                                                {user.role === "ADMIN" && (
                                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                                                        {t("navAdmin")}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs text-muted-foreground">{user.totalGenerations} {user.totalGenerations === 1 ? t('totalGenerations') : t('totalGenerations_plural')}</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleRole(user)}
                                            disabled={actionLoading === user.id}
                                            className="text-xs"
                                        >
                                            {user.role === "ADMIN" ? (
                                                <><ShieldOff className="w-3 h-3 mr-1" />{t("demote")}</>
                                            ) : (
                                                <><Shield className="w-3 h-3 mr-1" />{t("promote")}</>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteUser(user)}
                                            disabled={actionLoading === user.id}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
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
                        variant="outline" size="sm"
                        onClick={() => fetchUsers(pagination.page - 1)}
                        disabled={pagination.page <= 1 || loading}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        {pagination.page} / {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline" size="sm"
                        onClick={() => fetchUsers(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages || loading}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

// ──────────────── Queue Tab (existing logic, refined) ────────────────
function QueueTab() {
    const { t } = useThemeLanguage();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelingJobId, setCancelingJobId] = useState(null);
    const [jobToCancel, setJobToCancel] = useState(null);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${NODE_API_URL}/api/v1/admin/jobs`);
            setJobs(res.data.jobs || []);
        } catch (err) {
            toast.error(t("failedLoadQueue"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleCancelClick = (job) => setJobToCancel(job);

    const confirmCancel = async () => {
        if (!jobToCancel) return;
        setCancelingJobId(jobToCancel.id);
        try {
            await axios.delete(`${NODE_API_URL}/api/v1/admin/jobs/${jobToCancel.id}`);
            toast.success(`Job ${jobToCancel.id} cancelled.`);
            fetchJobs();
        } catch (err) {
            toast.error(t("failedLoadQueue"));
        } finally {
            setCancelingJobId(null);
            setJobToCancel(null);
        }
    };

    const columns = getColumns(handleCancelClick, cancelingJobId, t);

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={fetchJobs} variant="outline" size="sm" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {t("refresh")}
                </Button>
            </div>

            {loading && jobs.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground animate-pulse">{t("loadingHistory")}</div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">The queue is currently empty.</div>
            ) : (
                <DataTable columns={columns} data={jobs} />
            )}

            {/* Cancel Dialog */}
            <AlertDialog open={!!jobToCancel} onOpenChange={(open) => !open && setJobToCancel(null)}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("forceCancelTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("forceCancelDesc")}
                            <br /><br />
                            <span className="font-mono text-xs bg-muted p-1 rounded inline-block text-muted-foreground">
                                ID: {jobToCancel?.id}
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={cancelingJobId !== null}>{t("goBack")}</AlertDialogCancel>
                        <Button variant="destructive" onClick={confirmCancel} disabled={cancelingJobId !== null}>
                            {cancelingJobId !== null ? t("canceling") : t("yesCancel")}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// ──────────────── Main AdminDashboard ────────────────
const getTabs = (t) => [
    { id: "overview", label: t("overview"), icon: BarChart3 },
    { id: "queue", label: t("queue"), icon: Layers },
    { id: "users", label: t("users"), icon: Users },
];

export default function AdminDashboard() {
    const { t, dir } = useThemeLanguage();
    const [activeTab, setActiveTab] = useState("overview");
    const navigate = useNavigate();
    
    const TABS = getTabs(t);

    return (
        <div className="min-h-screen bg-background p-6 pt-24" dir={dir}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Shield className="w-8 h-8 text-primary" />
                            {t("adminDashboard")}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {t("manageUsersDesc")}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                                ${activeTab === tab.id
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <Card className="border-border bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>
                            {TABS.find(t => t.id === activeTab)?.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activeTab === "overview" && <OverviewTab />}
                        {activeTab === "queue" && <QueueTab />}
                        {activeTab === "users" && <UsersTab />}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
