"use client"

import { ArrowUpDown, MoreHorizontal, Trash2, RefreshCw, Users, Shield, ShieldOff } from "lucide-react"
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
      const date = new Date(ts);
      return (
        <div className="text-sm space-y-0.5">
            <div className="font-medium">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-[10px] text-muted-foreground">{date.toLocaleDateString()}</div>
        </div>
      )
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

export const getUserColumns = (handleAction, actionLoading, currentUser, t) => [
    {
      id: "user",
      accessorKey: "email",
      header: t("user") || "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
            ) : (
               <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Users className="w-4 h-4 text-muted-foreground" />
               </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate max-w-[120px]">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</span>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "role",
      header: t("role") || "Role",
      cell: ({ row }) => {
         const role = row.getValue("role");
         return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              {role === "ADMIN" ? (t("admin_role") || "ADMIN") : (t("user_role") || "USER")}
          </span>
         )
      }
    },
    {
       accessorKey: "totalGenerations",
       header: t("totalGenerations") || "Generations",
       cell: ({ row }) => {
          const total = row.getValue("totalGenerations");
          return <span className="text-sm font-medium">{total}</span>
       }
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("actions") || "Actions"}</div>,
      cell: ({ row }) => {
        const user = row.original;
        const isProtected = user.email === 'kk_habouche@esi.dz' || user.id === currentUser?.id;
        
        if (isProtected) {
            return (
              <div className="text-right">
                  <span className="text-[10px] italic text-muted-foreground px-2 py-1 bg-muted rounded-full">
                      {user.email === 'kk_habouche@esi.dz' ? 'Protected' : 'You'}
                  </span>
              </div>
            )
        }
  
        return (
          <div className="flex justify-end gap-2">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(user, 'role')}
                  disabled={actionLoading === user.id}
                  className="h-8 px-2 text-[10px]"
              >
                  {user.role === "ADMIN" ? (
                      <><ShieldOff className="w-3 h-3 mr-1" />{t("demote") || "Demote"}</>
                  ) : (
                      <><Shield className="w-3 h-3 mr-1" />{t("promote") || "Promote"}</>
                  )}
              </Button>
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAction(user, 'delete')}
                  disabled={actionLoading === user.id}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
              >
                  <Trash2 className="w-3.5 h-3.5" />
              </Button>
          </div>
        )
      }
    }
  ]
