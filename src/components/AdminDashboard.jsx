import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, Trash2, RefreshCw, Layers } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "./ui/data-table";
import { getColumns } from "./admin/columns";
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

export default function AdminDashboard() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelingJobId, setCancelingJobId] = useState(null);
    const [jobToCancel, setJobToCancel] = useState(null);
    
    const NODE_API_URL = import.meta.env.VITE_NODE_API_URL || "http://localhost:5000";

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${NODE_API_URL}/api/v1/admin/jobs`);
            setJobs(res.data.jobs || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load queue jobs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleCancelClick = (job) => {
        setJobToCancel(job);
    };

    const confirmCancel = async () => {
        if (!jobToCancel) return;
        setCancelingJobId(jobToCancel.id);
        try {
            await axios.delete(`${NODE_API_URL}/api/v1/admin/jobs/${jobToCancel.id}`);
            toast.success(`Job ${jobToCancel.id} cancelled successfully.`);
            fetchJobs(); // Refresh right away
        } catch (err) {
            console.error(err);
            toast.error("Failed to cancel job.");
        } finally {
            setCancelingJobId(null);
            setJobToCancel(null);
        }
    };

    const columns = getColumns(handleCancelClick, cancelingJobId);

    return (
        <div className="min-h-screen bg-background p-6 pt-24">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Warning Banner */}
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-1" />
                    <div>
                        <h3 className="font-semibold text-destructive">Experimental Admin Panel</h3>
                        <p className="text-sm text-foreground mt-1">
                            Please do not cancel other people's requests willingly. This is an open-source project and authentication is omitted for speed. Use this only to clear stuck jobs or manage the queue if the bot misses something.
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Layers className="w-8 h-8 text-primary" />
                        Queue Manager
                    </h1>
                    <Button onClick={fetchJobs} variant="outline" disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <Card className="border-border bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Current Queue</CardTitle>
                        <CardDescription>All video generation requests across all users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading && jobs.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground animate-pulse">Loading jobs...</div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">The queue is currently empty.</div>
                        ) : (
                            <DataTable columns={columns} data={jobs} />
                        )}
                    </CardContent>
                </Card>

            </div>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={!!jobToCancel} onOpenChange={(open) => !open && setJobToCancel(null)}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Force Cancel Job?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to forcibly stop this generation job? 
                            This will immediately kill the FFmpeg process and discard all partial progress.
                            <br/><br/>
                            <span className="font-mono text-xs bg-muted p-1 rounded inline-block text-muted-foreground">ID: {jobToCancel?.id}</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={cancelingJobId !== null}>Go Back</AlertDialogCancel>
                        <Button 
                            variant="destructive" 
                            onClick={confirmCancel}
                            disabled={cancelingJobId !== null}
                        >
                            {cancelingJobId !== null ? "Canceling..." : "Yes, Cancel Job"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
