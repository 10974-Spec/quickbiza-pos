import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Map, Car, Users, History, Activity, Cpu, Wrench, BarChart3 } from "lucide-react";
import FleetMap from "./Map";
import VehiclesList from "./Vehicles";
import DriversList from "./Drivers";
import HistoryList from "./History";
import DevicesList from "./Devices";
import MaintenanceList from "./Maintenance";
import ReportsList from "./Reports";

const FleetDashboard = () => {
    const [activeTab, setActiveTab] = useState<"map" | "vehicles" | "drivers" | "history" | "devices" | "maintenance" | "reports">("map");

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-up">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                            <Car className="w-6 h-6 text-primary" />
                            Fleet Management
                        </h1>
                        <p className="text-sm text-muted-foreground">Real-time tracking and operations</p>
                    </div>

                    <div className="flex flex-wrap gap-3 p-1">
                        {[
                            { id: "map", label: "Live Map", icon: Map },
                            { id: "vehicles", label: "Vehicles", icon: Car },
                            { id: "drivers", label: "Drivers", icon: Users },
                            { id: "history", label: "Trip History", icon: History },
                            { id: "devices", label: "GPS Devices", icon: Cpu },
                            { id: "maintenance", label: "Service", icon: Wrench },
                            { id: "reports", label: "Reports", icon: BarChart3 },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    px-4 py-2 rounded-none border-2 border-border font-bold text-sm transition-all flex items-center gap-2 neo-tab
                                    ${activeTab === tab.id
                                        ? "active bg-primary text-primary-foreground shadow-sm translate-x-[-2px] translate-y-[-2px]"
                                        : "bg-card text-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-[-1px] hover:translate-y-[-1px]"
                                    }
                                `}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[600px]">
                    {activeTab === "map" && <FleetMap />}

                    {activeTab === "vehicles" && (
                        <VehiclesList />
                    )}

                    {activeTab === "drivers" && (
                        <DriversList />
                    )}

                    {activeTab === "history" && (
                        <HistoryList />
                    )}

                    {activeTab === "devices" && (
                        <DevicesList />
                    )}

                    {activeTab === "maintenance" && (
                        <MaintenanceList />
                    )}

                    {activeTab === "reports" && (
                        <ReportsList />
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default FleetDashboard;
