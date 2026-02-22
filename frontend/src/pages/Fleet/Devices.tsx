import { useState, useEffect } from "react";
import { fleetAPI } from "@/services/fleet";
import { Plus, Cpu, Search, MoreVertical, Router } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DraggableDialogContent,
} from "@/components/ui/dialog";

const Devices = () => {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        imeI: "",
        serial_number: "",
        device_type: "teltonika",
        sim_number: ""
    });

    useEffect(() => {
        loadDevices();
    }, []);

    const loadDevices = async () => {
        try {
            const data = await fleetAPI.getDevices();
            setDevices(data);
        } catch (error) {
            console.error("Failed to load devices:", error);
            // toast.error("Failed to load devices");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fleetAPI.registerDevice(formData);
            toast.success("Device registered successfully");
            setIsAddModalOpen(false);
            loadDevices();
            setFormData({
                imeI: "",
                serial_number: "",
                device_type: "teltonika",
                sim_number: ""
            });
        } catch (error) {
            toast.error("Failed to register device");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search devices..."
                        className="neo-input pl-8 w-full"
                    />
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <button className="neo-button-primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Device
                        </button>
                    </DialogTrigger>
                    <DraggableDialogContent>
                        <DialogHeader>
                            <DialogTitle>Register New GPS Tracker</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium">IMEI Number</label>
                                <input
                                    required
                                    className="neo-input w-full"
                                    value={formData.imeI}
                                    onChange={e => setFormData({ ...formData, imeI: e.target.value })}
                                    placeholder="e.g. 864560040000000"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Serial Number</label>
                                <input
                                    className="neo-input w-full"
                                    value={formData.serial_number}
                                    onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Device Type (Model)</label>
                                <select
                                    className="neo-input w-full"
                                    value={formData.device_type}
                                    onChange={e => setFormData({ ...formData, device_type: e.target.value })}
                                >
                                    <option value="teltonika">Teltonika FMB series</option>
                                    <option value="queclink">Queclink</option>
                                    <option value="concox">Concox</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">SIM Number</label>
                                <input
                                    className="neo-input w-full"
                                    value={formData.sim_number}
                                    onChange={e => setFormData({ ...formData, sim_number: e.target.value })}
                                    placeholder="+2547..."
                                />
                            </div>

                            <button type="submit" className="neo-button-primary w-full">
                                Register Device
                            </button>
                        </form>
                    </DraggableDialogContent>
                </Dialog>
            </div>

            {/* List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {devices.map((d) => (
                    <div key={d.id} className="neo-card p-4 hover:border-primary transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-full">
                                    <Cpu className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-bold flex items-center gap-2">
                                        {d.imei}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">{d.device_type}</p>
                                </div>
                            </div>
                            <button className="text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Router className="w-4 h-4" />
                                <span>SIM: {d.sim_number || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs mt-2">
                                <span className="text-muted-foreground">Last Ping:</span>
                                <span>{d.last_ping ? new Date(d.last_ping).toLocaleString() : 'Never'}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <span className={`text-xs px-2 py-1 rounded-full font-bold border border-border ${d.status === 'online'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                {d.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                ))}

                {!loading && devices.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <Cpu className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No GPS devices registered yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Devices;
