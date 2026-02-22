import { useState, useEffect } from "react";
import { fleetAPI } from "@/services/fleet";
import { Plus, Wrench, Search, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DraggableDialogContent,
} from "@/components/ui/dialog";

const Maintenance = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        vehicle_id: "",
        service_type: "Routine Service",
        cost: 0,
        description: "",
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [maintenanceData, vehicleData] = await Promise.all([
                fleetAPI.getMaintenance(),
                fleetAPI.getVehicles()
            ]);
            setRecords(maintenanceData);
            setVehicles(vehicleData);
        } catch (error) {
            console.error("Failed to load maintenance data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fleetAPI.createMaintenance(formData);
            toast.success("Maintenance record added");
            setIsAddModalOpen(false);
            loadData();
            setFormData({
                vehicle_id: "",
                service_type: "Routine Service",
                cost: 0,
                description: "",
                date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            toast.error("Failed to add record");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search records..."
                        className="neo-input pl-8 w-full"
                    />
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <button className="neo-button-primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Log Service
                        </button>
                    </DialogTrigger>
                    <DraggableDialogContent>
                        <DialogHeader>
                            <DialogTitle>Log Maintenance</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium">Vehicle</label>
                                <select
                                    className="neo-input w-full"
                                    value={formData.vehicle_id}
                                    onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Vehicle</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.plate_number} - {v.model}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Service Type</label>
                                <select
                                    className="neo-input w-full"
                                    value={formData.service_type}
                                    onChange={e => setFormData({ ...formData, service_type: e.target.value })}
                                >
                                    <option>Routine Service</option>
                                    <option>Repair</option>
                                    <option>Inspection</option>
                                    <option>Tire Change</option>
                                    <option>Oil Change</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Date</label>
                                    <input
                                        type="date"
                                        className="neo-input w-full"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Cost (KES)</label>
                                    <input
                                        type="number"
                                        className="neo-input w-full"
                                        value={formData.cost}
                                        onChange={e => setFormData({ ...formData, cost: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="neo-input w-full"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <button type="submit" className="neo-button-primary w-full">
                                Save Record
                            </button>
                        </form>
                    </DraggableDialogContent>
                </Dialog>
            </div>

            {/* List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {records.map((r) => (
                    <div key={r.id} className="neo-card p-4 hover:border-primary transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Wrench className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold">{r.plate_number}</h4>
                                    <p className="text-xs text-muted-foreground">{r.service_type}</p>
                                </div>
                            </div>
                            <span className="font-bold text-sm">KES {r.cost.toLocaleString()}</span>
                        </div>

                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {r.description || 'No notes provided.'}
                        </p>

                        <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(r.date).toLocaleDateString()}
                        </div>
                    </div>
                ))}

                {!loading && records.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <Wrench className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No maintenance records found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Maintenance;
