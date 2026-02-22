import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { toast } from 'sonner';
import { Printer, Scan, Keyboard, Server, RefreshCw, Power, Settings, Edit, LayoutGrid, List } from 'lucide-react';
import { devicesAPI } from '@/services/api';
import { useModal } from "@/context/ModalContext";
import { useViewMode } from '@/hooks/useViewMode';

// Device Type Icons Mapping
const DeviceIcon = ({ type, className }: { type: string; className?: string }) => {
    switch (type?.toLowerCase()) {
        case 'printer': return <Printer className={className} />;
        case 'scanner': return <Scan className={className} />;
        case 'keyboard': return <Keyboard className={className} />;
        case 'server': return <Server className={className} />;
        default: return <Settings className={className} />;
    }
};

interface Device {
    id: number;
    device_name: string;
    device_identifier: string;
    device_type: string;
    connection_type: string;
    status: 'active' | 'disabled' | 'offline';
    last_active: string;
    vendor_id?: string;
    product_id?: string;
}

export default function Devices() {
    const { openModal } = useModal();
    const { viewMode, setViewMode } = useViewMode();
    const [devices, setDevices] = useState<Device[]>([]);
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'connected' | 'history'>('connected');
    const [refreshingId, setRefreshingId] = useState<number | null>(null);

    // Polling interval for real-time updates
    useEffect(() => {
        fetchDevices(); // Initial fetch

        const intervalId = setInterval(() => {
            if (!scanning) { // Don't fetch if a manual scan is in progress
                fetchDevices(true); // Create a version of fetchDevices that doesn't set loading state
            }
        }, 3000);

        return () => clearInterval(intervalId);
    }, [scanning]);

    const fetchDevices = async (background = false) => {
        try {
            if (!background) setLoading(true);
            const data = await devicesAPI.getAll();
            setDevices(data);
        } catch (error) {
            console.error('Failed to fetch devices:', error);
            // Don't show toast on background polling error to avoid spam
            if (!background) toast.error('Could not load devices');
        } finally {
            if (!background) setLoading(false);
        }
    };

    const handleScan = async () => {
        try {
            setScanning(true);
            await devicesAPI.scan();
            toast.success('Hardware scan completed');
            await fetchDevices();
        } catch (error) {
            console.error('Scan failed:', error);
            toast.error('Hardware scan failed');
        } finally {
            setScanning(false);
        }
    };

    const handleTest = async (id: number) => {
        try {
            await devicesAPI.test(id);
            toast.success('Test command sent');
        } catch (error) {
            toast.error('Test failed');
        }
    };

    const handleRefreshDevice = async (id: number) => {
        try {
            setRefreshingId(id);
            await devicesAPI.refresh(id);
            toast.success('Device refreshed');
            await fetchDevices();
        } catch (error) {
            toast.error('Refresh failed');
        } finally {
            setRefreshingId(null);
        }
    };

    const startEditing = (device: Device) => {
        openModal('DEVICE_EDIT', { device, onSuccess: fetchDevices });
    };

    const connectedDevices = devices.filter(d => d.status === 'active');
    const disconnectedDevices = devices.filter(d => d.status !== 'active');
    const displayDevices = activeTab === 'connected' ? connectedDevices : disconnectedDevices;

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-up">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold">Devices & Hardware</h1>
                        <p className="text-muted-foreground mt-1">Manage connected printers, scanners, and POS hardware.</p>
                    </div>
                    <button
                        onClick={handleScan}
                        disabled={scanning}
                        className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                        {scanning ? 'Scanning...' : 'Scan for Devices'}
                    </button>
                </div>

                {/* Tabs & View Toggle */}
                <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 border-b-2 border-foreground/10 pb-1">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('connected')}
                            className={`px-4 py-2 font-display font-bold text-sm transition-all relative ${activeTab === 'connected'
                                ? 'text-primary after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-1 after:bg-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Connected ({connectedDevices.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 font-display font-bold text-sm transition-all relative ${activeTab === 'history'
                                ? 'text-primary after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-1 after:bg-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            History ({disconnectedDevices.length})
                        </button>
                    </div>

                    <div className="flex bg-muted p-1 rounded-lg border-2 border-transparent shrink-0 mb-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                            title="Table View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {displayDevices.length === 0 && !loading ? (
                    <div className="col-span-full neo-card p-12 text-center text-muted-foreground border-dashed">
                        <div className="flex justify-center mb-4 opacity-20">
                            <Server className="w-16 h-16" />
                        </div>
                        <p className="text-lg font-display">No devices found.</p>
                        <p className="text-sm">
                            {activeTab === 'connected'
                                ? "Try clicking 'Scan for Devices' to detect hardware."
                                : "No disconnected devices in history."}
                        </p>
                    </div>
                ) : (
                    viewMode === 'grid' ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {displayDevices.map(device => (
                                <DeviceCard
                                    key={device.id}
                                    device={device}
                                    onTest={() => handleTest(device.id)}
                                    onEdit={() => startEditing(device)}
                                    onRefresh={() => handleRefreshDevice(device.id)}
                                    refreshing={refreshingId === device.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="neo-card overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="p-3 font-semibold">Device Name</th>
                                        <th className="p-3 font-semibold">Type</th>
                                        <th className="p-3 font-semibold">Connection</th>
                                        <th className="p-3 font-semibold">Status</th>
                                        <th className="p-3 font-semibold">Identifiers</th>
                                        <th className="p-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayDevices.map((device) => (
                                        <tr key={device.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg border border-foreground/20 ${device.status === 'active' ? 'bg-primary/10' : 'bg-muted'}`}>
                                                        <DeviceIcon type={device.device_type} className="w-4 h-4 text-foreground" />
                                                    </div>
                                                    <span className="font-semibold">{device.device_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 capitalize">{device.device_type}</td>
                                            <td className="p-3">
                                                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded border border-border">
                                                    {device.connection_type?.toUpperCase() || 'UNKNOWN'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`neo-badge text-xs ${device.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                                    {device.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-xs text-muted-foreground space-y-0.5">
                                                    <p>VID: <span className="font-mono">{device.vendor_id || 'N/A'}</span></p>
                                                    <p>PID: <span className="font-mono">{device.product_id || 'N/A'}</span></p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleRefreshDevice(device.id)}
                                                        disabled={refreshingId === device.id}
                                                        className="p-1.5 hover:bg-muted rounded border border-transparent hover:border-border transition-colors"
                                                        title="Refresh"
                                                    >
                                                        <RefreshCw className={`w-3.5 h-3.5 ${refreshingId === device.id ? 'animate-spin' : ''}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleTest(device.id)}
                                                        className="p-1.5 hover:bg-muted rounded border border-transparent hover:border-border transition-colors"
                                                        title="Test Output"
                                                    >
                                                        <Power className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => startEditing(device)}
                                                        className="p-1.5 hover:bg-muted rounded border border-transparent hover:border-border transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </AppLayout >
    );
}

function DeviceCard({ device, onTest, onEdit, onRefresh, refreshing }: {
    device: Device;
    onTest: () => void;
    onEdit: () => void;
    onRefresh: () => void;
    refreshing: boolean;
}) {
    const isActive = device.status === 'active';

    return (
        <div className={`neo-card p-4 transition-all ${!isActive ? 'opacity-75 grayscale-[0.5]' : 'hover:translate-x-1 hover:translate-y-1 hover:shadow-none'}`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg border-2 border-foreground ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                    <DeviceIcon type={device.device_type} className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="p-1.5 hover:bg-muted rounded border-2 border-transparent hover:border-foreground/10 transition-colors"
                        title="Refresh Device"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-1.5 hover:bg-muted rounded border-2 border-transparent hover:border-foreground/10 transition-colors"
                        title="Edit Name"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <span className={`neo-badge text-xs self-center ${isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {device.status.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="mb-4">
                <h3 className="font-display font-bold text-lg leading-tight mb-1">{device.device_name}</h3>
                <p className="text-xs font-mono text-muted-foreground bg-muted/50 p-1 rounded inline-block" title={device.device_identifier}>
                    {device.connection_type?.toUpperCase() || 'UNKNOWN'}
                </p>
            </div>

            <div className="text-xs text-muted-foreground mb-4 space-y-1">
                <p>VID: {device.vendor_id || 'N/A'}</p>
                <p>PID: {device.product_id || 'N/A'}</p>
            </div>

            <div className="flex gap-2 mt-auto">
                <button
                    onClick={onTest}
                    className="neo-button text-xs flex-1 py-1.5 bg-background hover:bg-muted"
                >
                    Test Output
                </button>
                <button
                    className="neo-button text-xs px-3 py-1.5 bg-destructive text-white hover:bg-destructive/90"
                    title="Power Options"
                >
                    <Power className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
