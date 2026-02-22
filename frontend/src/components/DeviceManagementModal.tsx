import { Smartphone, X, Edit2, Check, Power, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { devicesAPI } from "@/services/api";
import { DraggableModal } from "./DraggableModal";

interface Device {
    id: number;
    device_name: string;
    device_identifier: string;
    device_type: string;
    browser: string;
    ip_address: string;
    user_id: number;
    username: string;
    status: string;
    last_active: string;
    created_at: string;
}

interface DeviceManagementModalProps {
    open: boolean;
    onClose: () => void;
}

export default function DeviceManagementModal({ open, onClose }: DeviceManagementModalProps) {
    const [devices, setDevices] = useState<Device[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (open) {
            fetchDevices();
        }
    }, [open]);

    const fetchDevices = async () => {
        try {
            setFetching(true);
            const data = await devicesAPI.getAll();
            setDevices(data);
        } catch (error) {
            console.error('Error fetching devices:', error);
            toast.error("Failed to load devices");
        } finally {
            setFetching(false);
        }
    };

    const handleRename = async (deviceId: number) => {
        if (!editName.trim()) {
            toast.error("Device name cannot be empty");
            return;
        }

        try {
            setLoading(true);
            await devicesAPI.update(deviceId, { device_name: editName });
            toast.success("Device renamed successfully");
            setEditingId(null);
            fetchDevices();
        } catch (error) {
            console.error('Error renaming device:', error);
            toast.error("Failed to rename device");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (deviceId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'disabled' : 'active';

        try {
            setLoading(true);
            await devicesAPI.updateStatus(deviceId, newStatus);
            toast.success(`Device ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
            fetchDevices();
        } catch (error) {
            console.error('Error updating device status:', error);
            toast.error("Failed to update device status");
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshDevice = async (deviceId: number) => {
        try {
            setLoading(true);
            await devicesAPI.refresh(deviceId);
            toast.success("Device refreshed successfully");
            fetchDevices();
        } catch (error) {
            console.error('Error refreshing device:', error);
            toast.error("Failed to refresh device");
        } finally {
            setLoading(false);
        }
    };

    const getDeviceIcon = (type: string) => {
        return <Smartphone className="w-5 h-5" />;
    };

    const formatLastActive = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    };

    if (!open) return null;

    return (
        <DraggableModal
            isOpen={open}
            onClose={onClose}
            title="Connected Devices"
            width="800px"
        >
            <div className="flex flex-col h-[60vh]">
                <div className="p-4 flex items-center justify-between border-b border-border">
                    <div className="flex items-center gap-2">
                        <span className="neo-badge bg-primary text-primary-foreground">{devices.length} Devices</span>
                    </div>
                    <button
                        onClick={fetchDevices}
                        className="neo-button text-xs flex items-center gap-1"
                        disabled={fetching || loading}
                    >
                        <RefreshCw className={`w-3 h-3 ${fetching ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <div className="p-4 overflow-auto flex-1">
                    {fetching ? (
                        <div className="text-center py-8 text-muted-foreground">Loading devices...</div>
                    ) : devices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Smartphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No devices connected</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {devices.map((device) => {
                                const isActive = device.status === 'active';
                                const isEditing = editingId === device.id;

                                return (
                                    <div
                                        key={device.id}
                                        className={`neo-card p-4 ${!isActive ? 'opacity-60' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`p-2 rounded-lg ${isActive ? 'bg-success/20' : 'bg-muted'}`}>
                                                    {getDeviceIcon(device.device_type)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <input
                                                                type="text"
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                className="neo-input text-sm flex-1"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleRename(device.id);
                                                                    if (e.key === 'Escape') setEditingId(null);
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => handleRename(device.id)}
                                                                className="neo-button text-xs bg-success text-white p-2"
                                                                disabled={loading}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="neo-button text-xs p-2"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold truncate">{device.device_name}</h3>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(device.id);
                                                                    setEditName(device.device_name);
                                                                }}
                                                                className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="text-xs text-muted-foreground space-y-1">
                                                        <p>{device.browser} • {device.device_type}</p>
                                                        <p>User: {device.username}</p>
                                                        <p>Last active: {formatLastActive(device.last_active)}</p>
                                                        {device.ip_address && <p>IP: {device.ip_address}</p>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(device.id, device.status)}
                                                    className={`neo-button text-xs flex items-center gap-1 ${isActive ? 'bg-destructive text-white' : 'bg-success text-white'
                                                        }`}
                                                    disabled={loading}
                                                    title={isActive ? 'Disable device' : 'Enable device'}
                                                >
                                                    <Power className="w-3 h-3" />
                                                    {isActive ? 'Disable' : 'Enable'}
                                                </button>

                                                <button
                                                    onClick={() => handleRefreshDevice(device.id)}
                                                    className="neo-button text-xs flex items-center gap-1"
                                                    disabled={loading}
                                                    title="Refresh device connection"
                                                >
                                                    <RefreshCw className="w-3 h-3" />
                                                    Refresh
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DraggableModal>
    );
}
