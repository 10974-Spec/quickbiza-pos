import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '@/services/api';
import { Shield, Clock, Activity, AlertCircle, Edit } from 'lucide-react';
import { DraggableModal } from './DraggableModal';
import { PrivilegeSelector } from './PrivilegeSelector';
import { toast } from 'sonner';

interface ActivityLog {
    id: number;
    action: string;
    details: string;
    ip_address: string;
    timestamp: string;
}

interface User {
    id: number;
    username: string;
    full_name: string;
    role: string;
    status: string;
    created_at: string;
    last_login?: string;
    permissions?: string | string[];
}

interface UserDetailsModalProps {
    user: User | null;
    onClose: () => void;
}


export function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [isEditingPermissions, setIsEditingPermissions] = useState(false);

    useEffect(() => {
        if (user) {
            fetchActivity();
            // Parse permissions if they exist as string (from DB) or use array if already parsed
            let userPerms = [];
            try {
                if (typeof user.permissions === 'string') {
                    userPerms = JSON.parse(user.permissions);
                } else if (Array.isArray(user.permissions)) {
                    userPerms = user.permissions;
                }
            } catch (e) {
                console.error("Error parsing permissions", e);
            }
            setPermissions(userPerms || []);
        }
    }, [user]);

    const fetchActivity = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/users/${user?.id}/activity`);
            setActivities(response.data);
        } catch (error) {
            console.error('Failed to fetch activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePermissions = async () => {
        if (!user) return;
        try {
            await api.patch(`/users/${user.id}/permissions`, { permissions });
            toast.success("Permissions updated successfully");
            setIsEditingPermissions(false);
            // Ideally notify parent to refresh user list/details but simpler for now
        } catch (error: any) {
            toast.error("Failed to update permissions");
        }
    };

    if (!user) return null;

    const getActionIcon = (action: string) => {
        if (action.includes('login')) return <Shield className="w-4 h-4 text-primary" />;
        if (action.includes('delete')) return <AlertCircle className="w-4 h-4 text-destructive" />;
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    };

    const formatDetails = (details: string) => {
        try {
            const parsed = JSON.parse(details);
            return (
                <div className="text-xs text-muted-foreground mt-1 space-y-1">
                    {Object.entries(parsed).map(([key, value]) => {
                        // Custom formatting for common keys
                        let label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        let displayValue = String(value);

                        if (key === 'method') label = 'Login Method';
                        if (key === 'target_user_id') label = 'Target User ID';
                        if (key === 'new_user_id') label = 'New User ID';

                        return (
                            <div key={key} className="flex items-center gap-1">
                                <span className="font-medium text-foreground">{label}:</span>
                                <span>{displayValue}</span>
                            </div>
                        );
                    })}
                </div>
            );
        } catch {
            return <span className="text-xs text-muted-foreground">{details}</span>;
        }
    };

    const safeFormatDate = (dateString: string | undefined, formatStr: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return format(date, formatStr);
        } catch (e) {
            return 'Error';
        }
    };

    return (
        <DraggableModal
            isOpen={!!user}
            onClose={onClose}
            title="User Profile"
            width="700px" // sm:max-w-2xl equivalent roughly
        >
            <div className="flex flex-col h-full bg-background text-foreground">
                <div className="p-6 border-b border-border bg-primary/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl border border-border bg-card flex items-center justify-center text-primary text-xl shadow-sm">
                        {user.full_name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-display font-bold text-2xl">{user.full_name}</div>
                        <span className="block text-sm font-medium text-muted-foreground mt-0.5">@{user.username}</span>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 neo-card bg-card">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Role</label>
                            <p className="font-bold capitalize text-lg flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                {user.role}
                            </p>
                        </div>
                        <div className="p-4 neo-card bg-card">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Status</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-border ${user.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                {user.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="p-4 neo-card bg-card">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Joined</label>
                            <p className="font-bold text-sm">{safeFormatDate(user.created_at, 'PPP')}</p>
                        </div>
                        <div className="p-4 neo-card bg-card">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Last Login</label>
                            <p className="font-bold text-sm">
                                {user.last_login ? safeFormatDate(user.last_login, 'PPP p') : 'Never'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-display font-bold text-lg flex items-center gap-2 border-b border-border pb-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Recent Activity
                        </h3>

                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground font-medium">Loading history...</div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl border border-border border-dashed">
                                No activity recorded
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((log) => (
                                    <div key={log.id} className="relative pl-4 group">
                                        <div className="p-4 neo-card bg-card group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg border border-border bg-accent/20">
                                                        {getActionIcon(log.action)}
                                                    </div>
                                                    <p className="font-bold capitalize">
                                                        {log.action.replace(/_/g, ' ')}
                                                    </p>
                                                </div>
                                                <span className="text-xs font-bold bg-muted px-2 py-1 rounded border border-border">
                                                    {safeFormatDate(log.timestamp, 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                            {formatDetails(log.details)}
                                            {log.ip_address && (
                                                <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border flex items-center gap-1 font-mono">
                                                    <Server className="w-3 h-3" /> {log.ip_address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DraggableModal >
    );
}

function Server({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
            <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
            <line x1="6" x2="6.01" y1="6" y2="6" />
            <line x1="6" x2="6.01" y1="18" y2="18" />
        </svg>
    )
}
