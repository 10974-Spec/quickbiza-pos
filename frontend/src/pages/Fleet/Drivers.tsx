import { useState, useEffect } from "react";
import { fleetAPI } from "@/services/fleet";
import { Plus, User, Search, MoreVertical, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DraggableDialogContent,
} from "@/components/ui/dialog";

const Drivers = () => {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        license_number: "",
        phone: "",
        email: ""
    });

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        try {
            const data = await fleetAPI.getDrivers();
            setDrivers(data);
        } catch (error) {
            console.error("Failed to load drivers:", error);
            // toast.error("Failed to load drivers");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fleetAPI.createDriver(formData);
            toast.success("Driver registered successfully");
            setIsAddModalOpen(false);
            loadDrivers();
            setFormData({
                name: "",
                license_number: "",
                phone: "",
                email: ""
            });
        } catch (error) {
            toast.error("Failed to register driver");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search drivers..."
                        className="neo-input pl-8 w-full"
                    />
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <button className="neo-button-primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Driver
                        </button>
                    </DialogTrigger>
                    <DraggableDialogContent>
                        <DialogHeader>
                            <DialogTitle>Register New Driver</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium">Full Name</label>
                                <input
                                    required
                                    className="neo-input w-full"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">License Number</label>
                                <input
                                    required
                                    className="neo-input w-full"
                                    value={formData.license_number}
                                    onChange={e => setFormData({ ...formData, license_number: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Phone</label>
                                    <input
                                        className="neo-input w-full"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <input
                                        type="email"
                                        className="neo-input w-full"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="neo-button-primary w-full">
                                Register Driver
                            </button>
                        </form>
                    </DraggableDialogContent>
                </Dialog>
            </div>

            {/* List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {drivers.map((d) => (
                    <div key={d.id} className="neo-card p-4 hover:border-primary transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-full">
                                    <User className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-bold">{d.name}</h4>
                                    <p className="text-xs text-muted-foreground">License: {d.license_number}</p>
                                </div>
                            </div>
                            <button className="text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <span>{d.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <span>{d.email || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <span className={`text-xs px-2 py-1 rounded-full font-bold border border-border ${d.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                {d.status.toUpperCase()}
                            </span>
                            <span className="text-xs font-medium">
                                Score: {d.performance_score}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Drivers;
