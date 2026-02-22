import { useState, useEffect } from "react";
import { fleetAPI } from "@/services/fleet";
import { History as HistoryIcon, MapPin, Calendar, Clock } from "lucide-react";

const History = () => {
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            const data = await fleetAPI.getTrips();
            setTrips(data);
        } catch (error) {
            console.error("Failed to load trips:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="neo-card p-4">
                <h3 className="font-bold mb-2">Trip History</h3>
                <p className="text-sm text-muted-foreground">Recent trips and route logs</p>
            </div>

            <div className="space-y-4">
                {trips.map((trip) => (
                    <div key={trip.id} className="neo-card p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-muted rounded-full">
                                <HistoryIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                                <h4 className="font-bold flex items-center gap-2">
                                    {trip.start_location}
                                    <span className="text-muted-foreground">→</span>
                                    {trip.end_location}
                                </h4>
                                <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(trip.start_time).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {trip.duration} min
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold">{trip.distance_km} km</span>
                            <span className="text-xs text-muted-foreground text-green-600">Completed</span>
                        </div>
                    </div>
                ))}

                {!loading && trips.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground neo-card">
                        <HistoryIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No trip history available.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
