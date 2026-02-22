import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import api from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

interface SyncState {
    isOnline: boolean;
    syncStatus: SyncStatus;
    lastSyncAt: Date | null;
    pendingCount: number;
    errorCount: number;
    lastSyncError: string | null;
    recordsSynced: number;
}

interface SyncContextType extends SyncState {
    triggerSync: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SyncContext = createContext<SyncContextType>({
    isOnline: true,
    syncStatus: 'idle',
    lastSyncAt: null,
    pendingCount: 0,
    errorCount: 0,
    lastSyncError: null,
    recordsSynced: 0,
    triggerSync: async () => { },
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SyncProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<SyncState>({
        isOnline: navigator.onLine,
        syncStatus: 'idle',
        lastSyncAt: null,
        pendingCount: 0,
        errorCount: 0,
        lastSyncError: null,
        recordsSynced: 0,
    });

    // Poll the backend for sync state every 10 seconds
    // Only update state if values actually changed to prevent cascading re-renders
    const fetchSyncStatus = useCallback(async () => {
        // Skip poll if user is not authenticated — avoids 401 triggering the Axios forced-reload interceptor
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        try {
            const res = await api.get('/sync/status');
            const d = res.data;
            setState(prev => {
                const newIsOnline = d.status !== 'offline';
                const newStatus = d.status as SyncStatus;
                const newPending = d.pendingCount ?? 0;
                // Skip re-render if nothing changed
                if (
                    prev.isOnline === newIsOnline &&
                    prev.syncStatus === newStatus &&
                    prev.pendingCount === newPending &&
                    prev.errorCount === (d.errorCount ?? 0)
                ) return prev;
                return {
                    ...prev,
                    isOnline: newIsOnline,
                    syncStatus: newStatus,
                    lastSyncAt: d.lastSyncAt ? new Date(d.lastSyncAt) : prev.lastSyncAt,
                    pendingCount: newPending,
                    errorCount: d.errorCount ?? 0,
                    lastSyncError: d.lastSyncError ?? null,
                    recordsSynced: d.recordsSynced ?? 0,
                };
            });
        } catch {
            setState(prev => {
                if (!prev.isOnline && prev.syncStatus === 'offline') return prev; // no change
                return { ...prev, isOnline: false, syncStatus: 'offline' };
            });
        }
    }, []);

    const triggerSync = useCallback(async () => {
        try {
            await api.post('/sync/trigger');
            setTimeout(fetchSyncStatus, 2000);
        } catch { }
    }, [fetchSyncStatus]);

    // Browser online/offline events
    useEffect(() => {
        const goOnline = () => setState(prev => ({ ...prev, isOnline: true }));
        const goOffline = () => setState(prev => ({ ...prev, isOnline: false, syncStatus: 'offline' }));
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    // Polling interval — 10s, starts 5s after mount to avoid startup congestion
    useEffect(() => {
        const init = setTimeout(fetchSyncStatus, 5000);
        const id = setInterval(fetchSyncStatus, 10_000);
        return () => { clearTimeout(init); clearInterval(id); };
    }, [fetchSyncStatus]);

    // Memoize context value so consumers only re-render when state actually changes
    const value = useMemo(() => ({ ...state, triggerSync }), [state, triggerSync]);

    return (
        <SyncContext.Provider value={value}>
            {children}
        </SyncContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSync() {
    return useContext(SyncContext);
}

