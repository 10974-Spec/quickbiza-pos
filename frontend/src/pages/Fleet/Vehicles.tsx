import { useState, useEffect } from "react";
import { fleetAPI } from "@/services/fleet";
import { Plus, Car, Search, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DraggableDialogContent,
} from "@/components/ui/dialog";

const Vehicles = () => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        plate_number: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
        fuel_type: "petrol",
        insurance_expiry: ""
    });

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        try {
            const data = await fleetAPI.getVehicles();
            setVehicles(data);
        } catch (error) {
            console.error("Failed to load vehicles:", error);
            // toast.error("Failed to load vehicles"); 
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fleetAPI.createVehicle(formData);
            toast.success("Vehicle registered successfully");
            setIsAddModalOpen(false);
            loadVehicles();
            setFormData({
                plate_number: "",
                model: "",
                year: new Date().getFullYear(),
                color: "",
                fuel_type: "petrol",
                insurance_expiry: ""
            });
        } catch (error) {
            toast.error("Failed to register vehicle");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search vehicles..."
                        className="neo-input pl-8 w-full"
                    />
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <button className="neo-button-primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Vehicle
                        </button>
                    </DialogTrigger>
                    <DraggableDialogContent>
                        <DialogHeader>
                            <DialogTitle>Register New Vehicle</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Plate Number</label>
                                    <input
                                        required
                                        className="neo-input w-full"
                                        value={formData.plate_number}
                                        onChange={e => setFormData({ ...formData, plate_number: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Model</label>
                                    <input
                                        className="neo-input w-full"
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Year</label>
                                    <input
                                        type="number"
                                        className="neo-input w-full"
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Color</label>
                                    <input
                                        className="neo-input w-full"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Fuel Type</label>
                                <select
                                    className="neo-input w-full"
                                    value={formData.fuel_type}
                                    onChange={e => setFormData({ ...formData, fuel_type: e.target.value })}
                                >
                                    <option value="petrol">Petrol</option>
                                    <option value="diesel">Diesel</option>
                                    <option value="electric">Electric</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Insurance Expiry</label>
                                <input
                                    type="date"
                                    className="neo-input w-full"
                                    value={formData.insurance_expiry}
                                    onChange={e => setFormData({ ...formData, insurance_expiry: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="neo-button-primary w-full">
                                Register Vehicle
                            </button>
                        </form>
                    </DraggableDialogContent>
                </Dialog>
            </div>

            {/* List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((v) => (
                    <div key={v.id} className="neo-card p-4 hover:border-primary transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-lg">
                                    <Car className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-bold">{v.plate_number}</h4>
                                    <p className="text-xs text-muted-foreground">{v.model} • {v.year}</p>
                                </div>
                            </div>
                            <button className="text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border border-border ${v.status === 'active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                    {v.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Driver</span>
                                <span className="font-medium">{v.driver_name || 'Unassigned'}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && vehicles.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <Car className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No vehicles registered yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vehicles;
