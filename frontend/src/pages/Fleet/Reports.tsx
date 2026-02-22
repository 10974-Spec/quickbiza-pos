import { useState, useEffect } from "react";
import { fleetAPI } from "@/services/fleet";
import { BarChart3, Car, Map, Wrench, Fuel } from "lucide-react";

const Reports = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await fleetAPI.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to load fleet stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading reports...</div>;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="neo-card p-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Vehicles</p>
                            <h3 className="text-2xl font-bold">{stats?.total_vehicles || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="neo-card p-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <Map className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Trips</p>
                            <h3 className="text-2xl font-bold">{stats?.total_trips || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="neo-card p-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                            <Fuel className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Distance</p>
                            <h3 className="text-2xl font-bold">{stats?.total_distance || 0} km</h3>
                        </div>
                    </div>
                </div>
                <div className="neo-card p-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <Wrench className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Maintenance Cost</p>
                            <h3 className="text-2xl font-bold">KES {(stats?.maintenance_cost || 0).toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="neo-card p-6 h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Fuel Consumption Chart (Coming Soon)</p>
                    </div>
                </div>
                <div className="neo-card p-6 h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Driver Performance Chart (Coming Soon)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
