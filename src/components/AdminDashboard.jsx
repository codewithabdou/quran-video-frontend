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
import { getColumns, getUserColumns } from "./admin/columns";
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

import { useThemeLanguage } from "../contexts/ThemeLanguageContext";
import { useAuth } from "../contexts/AuthContext";

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
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [confirmUser, setConfirmUser] = useState(null);
    const [confirmType, setConfirmType] = useState(null); // 'role' or 'delete'

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch more users for client-side filtering/pagination in DataTable
            const res = await axios.get(`${NODE_API_URL}/api/v1/admin/users`, {
                params: { page: 1, limit: 100 }, 
            });
            setUsers(res.data.users);
        } catch (err) {
            toast.error(t("failedLoadUsers"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleRole = async (user) => {
        const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
        setActionLoading(user.id);
        try {
            await axios.patch(`${NODE_API_URL}/api/v1/admin/users/${user.id}/role`, { role: newRole });
            toast.success(`${user.name} ${t("isNow")} ${t(newRole.toLowerCase() + "_role")}.`);
            fetchUsers();
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
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || t("failedDeleteUser"));
        } finally {
            setActionLoading(null);
        }
    };

    const handleAction = (user, type) => {
        setConfirmUser(user);
        setConfirmType(type);
    };

    const executeAction = async () => {
        if (!confirmUser || !confirmType) return;
        
        if (confirmType === 'role') {
            await toggleRole(confirmUser);
        } else if (confirmType === 'delete') {
            await deleteUser(confirmUser);
        }
        
        setConfirmUser(null);
        setConfirmType(null);
    };

    const columns = getUserColumns(handleAction, actionLoading, currentUser, t);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={fetchUsers} variant="outline" size="sm" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {t("refresh")}
                </Button>
            </div>

            {loading && users.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground animate-pulse">{t("loadingUsers")}</div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={users} 
                    filterColumn="user" 
                    filterPlaceholder={t("searchPlaceholder")} 
                    columnsLabel={t("columns")}
                />
            )}

            {/* Role Confirmation Dialog */}
            <AlertDialog open={confirmType === 'role'} onOpenChange={(open) => !open && setConfirmType(null)}>
                <AlertDialogContent className="border-border/50 backdrop-blur-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmRoleTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("confirmRoleDesc")
                                .replace("{{name}}", confirmUser?.name || "")
                                .replace("{{role}}", t((confirmUser?.role === "ADMIN" ? "USER" : "ADMIN").toLowerCase() + "_role"))}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                executeAction();
                            }}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={actionLoading}
                        >
                            {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                            {t("confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={confirmType === 'delete'} onOpenChange={(open) => !open && setConfirmType(null)}>
                <AlertDialogContent className="border-border/50 backdrop-blur-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive font-bold">{t("confirmDeleteTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("confirmDeleteDesc").replace("{{name}}", confirmUser?.name || "")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                executeAction();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={actionLoading}
                        >
                            {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            {t("confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
            toast.success(t("jobCancelled"));
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
                <div className="text-center py-10 text-muted-foreground">{t("queueEmpty")}</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={jobs}
                    filterColumn="jobId"
                    filterPlaceholder={t("filterPlaceholder")}
                    columnsLabel={t("columns")}
                />
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
                        <h1 className="md:text-3xl text-xl font-bold flex items-center gap-2">
                            <Shield className="text-primary" />
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
