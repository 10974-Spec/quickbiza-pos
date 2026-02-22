import api from "./api";

export interface LicenseDetails {
    license_key: string;
    status: 'active' | 'expired' | 'revoked';
    expiry_date: string;
    modules_enabled: string[];
}

export const licenseAPI = {
    getDetails: async (): Promise<LicenseDetails> => {
        const response = await api.get('/setup/license');
        return response.data;
    },

    getModules: async (): Promise<string[]> => {
        try {
            const details = await licenseAPI.getDetails();
            return Array.isArray(details.modules_enabled) ? details.modules_enabled : [];
        } catch (error) {
            console.error('Failed to get modules:', error);
            return [];
        }
    },

    updateModules: async (modules: string[]): Promise<void> => {
        await api.put('/setup/modules', { modules });
    }
};
