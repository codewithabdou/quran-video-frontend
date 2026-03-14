"use client"

import { ArrowUpDown, MoreHorizontal, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const getStatusBadgeColor = (status) => {
    switch (status) {
        case 'active': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'waiting': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
        default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
};

export const getColumns = (handleCancelClick, cancelingJobId, t) => [
  {
    accessorKey: "status",
    header: t("status"),
    cell: ({ row }) => {
      const status = row.getValue("status")
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(status)}`}>
            {t(`status_${status}`) || status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
    // Only sort by status string comparison normally
  },
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("jobId")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const id = row.getValue("id")
        return <div className="font-mono text-xs text-muted-foreground break-all" title={id}>{id.split('-')[0]}...</div>
    }
  },
  {
    accessorKey: "details",
    header: t("details"),
    cell: ({ row }) => {
        const data = row.original.data;
        if (!data) return <span className="text-muted-foreground">-</span>;
        
        return (
            <div className="text-sm space-y-1">
                <div>
                    {t("surah")} {data.surah} ({data.ayah_start}-{data.ayah_end})
                </div>
                <div className="text-xs text-muted-foreground">
                    {t(`platform${data.platform?.charAt(0).toUpperCase()}${data.platform?.slice(1)}`) || data.platform || 'reel'} • {data.resolution || '720'}p
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: "clientIp",
    header: t("ip"),
    cell: ({ row }) => {
        const ip = row.getValue("clientIp") || 'Unknown'
        return <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{ip}</code>
    }
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
        <div className="text-left w-full">
            <Button
                variant="ghost"
                className="p-0 hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                {t("time")}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
    ),
    cell: ({ row }) => {
      const ts = row.getValue("timestamp")
      if (!ts) return null;
      return <div className="text-sm text-muted-foreground">{new Date(ts).toLocaleTimeString()}</div>
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">{t("actions")}</div>,
    cell: ({ row }) => {
      const job = row.original
      const isActive = job.status === 'active' || job.status === 'waiting';

      return (
        <div className="text-right">
            {isActive ? (
                <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleCancelClick(job)}
                    disabled={cancelingJobId === job.id}
                >
                    {cancelingJobId === job.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
            ) : (
                <span className="text-muted-foreground text-xs px-2">-</span>
            )}
        </div>
      )
    },
  },
]
