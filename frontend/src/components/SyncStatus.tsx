import { useEffect, useState } from "react";
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import api from "@/services/api";

interface SyncStatus {
    status: "idle" | "syncing" | "synced" | "offline" | "error";
    lastSyncAt: string | null;
    recordsSynced: number;
    lastSyncError: string | null;
}

const STATUS_POLL_INTERVAL = 30_000; // 30 seconds

export function SyncStatus() {
    const [sync, setSync] = useState<SyncStatus>({
        status: "idle",
        lastSyncAt: null,
        recordsSynced: 0,
        lastSyncError: null,
    });

    const fetchStatus = async () => {
        try {
            const { data } = await api.get("/sync/status", { timeout: 3000 });
            setSync(data);
        } catch (error) {
            setSync(prev => ({ ...prev, status: "offline" }));
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, STATUS_POLL_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    let lastSyncLabel = "Never";
    try {
        if (sync.lastSyncAt) {
            const date = new Date(sync.lastSyncAt);
            if (!isNaN(date.getTime())) {
                lastSyncLabel = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }
        }
    } catch (e) {
        console.warn("Invalid lastSyncAt date format:", sync.lastSyncAt);
    }

    const icon = {
        idle: <Cloud className="w-3.5 h-3.5 text-muted-foreground" />,
        syncing: <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />,
        synced: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
        offline: <CloudOff className="w-3.5 h-3.5 text-muted-foreground" />,
        error: <AlertCircle className="w-3.5 h-3.5 text-destructive" />,
    }[sync.status];

    const label = {
        idle: "Cloud Sync",
        syncing: "Syncing...",
        synced: `Synced ${lastSyncLabel}`,
        offline: "Offline",
        error: "Sync Error",
    }[sync.status];

    const tooltipText = {
        idle: "Waiting for first sync cycle.",
        syncing: "Uploading data to cloud...",
        synced: `Last sync: ${lastSyncLabel}. ${sync.recordsSynced} records updated.`,
        offline: "No internet connection. Data is saved locally.",
        error: `Sync error: ${sync.lastSyncError || "Unknown"}`,
    }[sync.status];

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-muted/50 transition-colors cursor-default select-none">
                    {icon}
                    <span>{label}</span>
                </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
                {tooltipText}
            </TooltipContent>
        </Tooltip>
    );
}
