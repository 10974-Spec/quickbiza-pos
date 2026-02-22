import api from "./api";

export const setupAPI = {
    checkStatus: async () => {
        const response = await api.get('/setup/status');
        return response.data;
    },

    createCompany: async (data: any) => {
        const response = await api.post('/setup/company', data);
        return response.data;
    },

    activateLicense: async (key: string) => {
        const response = await api.post('/setup/license', { key });
        return response.data;
    },

    createAdmin: async (data: any) => {
        const response = await api.post('/setup/admin', data);
        return response.data;
    },

    // Add explicit getModules if needed, or rely on licenseAPI
};
