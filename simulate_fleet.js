// Native fetch is available in Node.js v18+

const API_URL = 'http://localhost:3000/api/fleet/gps/data';

// Nairobi Center: -1.2921, 36.8219
const vehicles = [
    { deviceId: 'SIM_001', lat: -1.2921, lng: 36.8219, speed: 45, heading: 0, label: 'CBD Cruiser' },
    { deviceId: 'SIM_002', lat: -1.2800, lng: 36.8100, speed: 60, heading: 90, label: 'Westlands Express' },
    { deviceId: 'SIM_003', lat: -1.3000, lng: 36.8500, speed: 30, heading: 180, label: 'Industrial Area Van' },
    { deviceId: 'SIM_004', lat: -1.2600, lng: 36.7900, speed: 0, heading: 0, ignition: false, label: 'Kileleshwa Parked' }, // Idle
    { deviceId: 'SIM_005', lat: -1.3100, lng: 36.8000, speed: 55, heading: 270, label: 'Langata Road' },
    { deviceId: 'SIM_006', lat: -1.2921, lng: 36.8219, speed: 20, heading: 45, label: 'CBD Traffic' }, // Close to 001 for clustering
];

console.log('🚀 Starting Fleet Simulation...');
console.log(`📡 Sending updates to ${API_URL}`);
console.log('Press Ctrl+C to stop.');

setInterval(async () => {
    const timestamp = new Date().toISOString();

    for (let vehicle of vehicles) {
        // Update position randomly if moving
        if (vehicle.speed > 0) {
            vehicle.lat += (Math.random() - 0.5) * 0.001;
            vehicle.lng += (Math.random() - 0.5) * 0.001;
            // Randomly fluctuate speed
            vehicle.speed = Math.max(0, Math.min(120, vehicle.speed + (Math.random() - 0.5) * 10));
            vehicle.ignition = true;
        }

        const payload = {
            deviceId: vehicle.deviceId,
            lat: vehicle.lat,
            lng: vehicle.lng,
            speed: Math.round(vehicle.speed),
            heading: vehicle.heading,
            ignition: vehicle.ignition !== false,
            fuel: Math.floor(Math.random() * 40) + 60, // Random fuel 60-100%
            timestamp
        };

        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            // console.log(`[${vehicle.deviceId}] Updated at ${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)}`);
        } catch (error) {
            console.error(`Error updating ${vehicle.deviceId}:`, error.message);
        }
    }
    process.stdout.write('.');
}, 2000); // Update every 2 seconds
