import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fleetAPI = {
    // Vehicles
    getVehicles: async () => {
        const response = await axios.get(`${API_URL}/fleet/vehicles`);
        return response.data;
    },
    createVehicle: async (data: any) => {
        const response = await axios.post(`${API_URL}/fleet/vehicles`, data);
        return response.data;
    },

    // Drivers
    getDrivers: async () => {
        const response = await axios.get(`${API_URL}/fleet/drivers`);
        return response.data;
    },
    createDriver: async (data: any) => {
        const response = await axios.post(`${API_URL}/fleet/drivers`, data);
        return response.data;
    },

    // Trips
    getTrips: async () => {
        // const response = await axios.get(`${API_URL}/fleet/trips`);
        // return response.data;
        return []; // Mock for now until endpoint is ready
    },

    // Devices
    getDevices: async () => {
        const response = await axios.get(`${API_URL}/fleet/devices`);
        return response.data;
    },
    registerDevice: async (data: any) => {
        const response = await axios.post(`${API_URL}/fleet/devices`, data);
        return response.data;
    },

    // Maintenance
    getMaintenance: async () => {
        const response = await axios.get(`${API_URL}/fleet/maintenance`);
        return response.data;
    },
    createMaintenance: async (data: any) => {
        const response = await axios.post(`${API_URL}/fleet/maintenance`, data);
        return response.data;
    },

    // Reports
    getStats: async () => {
        const response = await axios.get(`${API_URL}/fleet/stats`);
        return response.data;
    }
};
