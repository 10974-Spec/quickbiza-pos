import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { fleetAPI } from "@/services/fleet";

// Fix for default Leaflet marker icons in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Icons based on status
const createStatusIcon = (color: string, plate: string, heading: number = 0) => {
    return L.divIcon({
        className: "custom-marker-container",
        html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                <div style="
                    background-color: white; 
                    padding: 4px 10px; 
                    border-radius: 6px; 
                    box-shadow: 0 3px 6px rgba(0,0,0,0.3); 
                    font-weight: 800; 
                    font-size: 12px; 
                    margin-bottom: 6px;
                    white-space: nowrap;
                    border: 2px solid ${color};
                    font-family: sans-serif;
                    z-index: 100;
                ">
                    ${plate}
                </div>
                <div style="
                    background-color: ${color};
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: 4px solid white;
                    box-shadow: 0 6px 12px rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    transform: rotate(${heading}deg);
                    transition: transform 0.3s ease;
                ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M12 10v-3"/><path d="M10 8h4"/>
                    </svg>
                </div>
            </div>
        `,
        iconSize: [50, 80],
        iconAnchor: [25, 75],
    });
};

const FleetMap = () => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [map, setMap] = useState<L.Map | null>(null);
    const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);

    // Load initial vehicle data
    useEffect(() => {
        const loadVehicles = async () => {
            try {
                const data = await fleetAPI.getVehicles();
                setVehicles(data);
            } catch (error) {
                console.error("Failed to load vehicles:", error);
            }
        };
        loadVehicles();
    }, []);

    // Socket.IO Connection
    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

        socket.on("connect", () => {
            console.log("Connected to Fleet WebSocket");
        });

        socket.on("fleet:location", (data: any) => {
            setVehicles(prev => {
                const existingIndex = prev.findIndex(v => v.gps_device_id === data.deviceId || v.id === data.vehicleId || v.plate_number === data.deviceId);

                if (existingIndex !== -1) {
                    // Update existing
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        latitude: data.lat,
                        longitude: data.lng,
                        speed: data.speed,
                        ignition: data.ignition,
                        fuel_level: data.fuel,
                        gps_status: 'active',
                        last_ping: new Date().toISOString()
                    };
                    return updated;
                } else {
                    // Add new/simulated
                    return [...prev, {
                        id: data.deviceId,
                        gps_device_id: data.deviceId,
                        plate_number: data.deviceId, // Use ID as plate for simulation
                        model: 'Simulated',
                        latitude: data.lat,
                        longitude: data.lng,
                        speed: data.speed,
                        ignition: data.ignition,
                        fuel_level: data.fuel,
                        gps_status: 'active',
                        last_ping: new Date().toISOString()
                    }];
                }
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const getStatusColor = (v: any) => {
        if (v.speed > 0) return '#22c55e'; // Moving (Green)
        if (v.ignition === 'on' || v.ignition === true || v.gps_status === 'active') return '#eab308'; // Idle (Yellow)
        return '#6b7280'; // Offline (Gray)
    };

    const focusNextVehicle = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent map click
        if (!map || vehicles.length === 0) return;

        const activeVehicles = vehicles.filter(v => v.gps_status === 'active' || v.speed > 0);

        if (activeVehicles.length === 0) {
            toast.info("No active vehicles found");
            return;
        }

        const nextIndex = (currentFocusIndex + 1) % activeVehicles.length;
        setCurrentFocusIndex(nextIndex);
        const target = activeVehicles[nextIndex];

        if (target.latitude && target.longitude) {
            map.flyTo([target.latitude, target.longitude], 16, {
                animate: true,
                duration: 1.5
            });
            toast.success(`Tracking: ${target.plate_number}`);
        }
    };

    const StatusBadge = ({ status, color }: { status: string, color: string }) => (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider" style={{ backgroundColor: color }}>
            {status}
        </span>
    );

    return (
        <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-neo border-2 border-foreground z-0">
            <MapContainer
                center={[-1.2921, 36.8219]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                ref={setMap}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Removed ClusterGroup due to stability issues with real-time updates */}
                {vehicles.map(vehicle => {
                    const lat = vehicle.latitude || vehicle.lat;
                    const lng = vehicle.longitude || vehicle.lng;
                    const color = getStatusColor(vehicle);

                    // Skip invalid coordinates
                    if (!lat || !lng) return null;

                    return (
                        <Marker
                            key={vehicle.id || vehicle.gps_device_id}
                            position={[lat, lng]}
                            icon={createStatusIcon(color, vehicle.plate_number, vehicle.heading || 0)}
                        >
                            <Popup
                                closeButton={false}
                                className="custom-popup"
                                minWidth={250}
                                maxWidth={300}
                                autoPan={false}
                            >
                                <div className="p-2 space-y-3 font-sans">
                                    <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                                        <div>
                                            <h3 className="font-extrabold text-lg text-black">{vehicle.plate_number}</h3>
                                            <p className="text-sm font-medium text-gray-500">{vehicle.model}</p>
                                        </div>
                                        <StatusBadge status={vehicle.speed > 0 ? 'Moving' : 'Idle'} color={color} />
                                    </div>

                                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Driver</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                    {(vehicle.driver_name || 'U').charAt(0)}
                                                </div>
                                                <span className="font-bold text-sm text-blue-900">{vehicle.driver_name || 'Unassigned'}</span>
                                            </div>
                                        </div>
                                        <div className="h-8 w-[1px] bg-blue-200"></div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Contact</span>
                                            <span className="text-xs font-medium text-blue-800 mt-1">+254 7XX XXX</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                            <span className="text-gray-400 block text-[10px] uppercase font-bold">Speed</span>
                                            <span className="font-bold text-lg">{vehicle.speed || 0} <span className="text-xs font-medium text-gray-500">km/h</span></span>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                            <span className="text-gray-400 block text-[10px] uppercase font-bold">Fuel Lvl</span>
                                            <span className="font-bold text-lg">{vehicle.fuel_level || '-'} <span className="text-xs font-medium text-gray-500">%</span></span>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] uppercase font-bold text-green-600">Current Trip</span>
                                            <span className="text-[10px] font-bold text-green-600 bg-green-200 px-1.5 rounded">Active</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-medium text-gray-500 block">Destination</span>
                                                <span className="text-sm font-bold text-gray-800">Nairobi CBD</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-medium text-gray-500 block">ETA</span>
                                                <span className="text-sm font-extrabold text-green-700">14 mins</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-green-200 h-1.5 rounded-full mt-2 overflow-hidden">
                                            <div className="bg-green-500 h-full w-[65%] rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* View Active Vehicles Button */}
            <div className="absolute bottom-6 right-6 z-[1000]">
                <button
                    onClick={focusNextVehicle}
                    className="
                        bg-white text-black font-bold py-3 px-6 
                        border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                        hover:translate-x-[-2px] hover:translate-y-[-2px] 
                        hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] 
                        active:translate-x-[0px] active:translate-y-[0px] 
                        active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                        transition-all flex items-center gap-2
                    "
                >
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Next Active Vehicle
                </button>
            </div>
        </div>
    );
};

export default FleetMap;
