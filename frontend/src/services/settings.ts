import api from "./api";

export interface AppSettings {
    theme: 'default' | 'neo' | 'win7' | 'saas' | 'material' | 'terminal' | 'retro' | 'access';
    primary_color: string;
    logo_path: string;
    receipt_footer_text: string;
    company_name?: string;
    layout?: string;
    icon_set?: string;
}

export const settingsAPI = {
    getSettings: async (): Promise<AppSettings> => {
        const response = await api.get('/settings');
        return response.data;
    },

    updateSettings: async (settings: Partial<AppSettings>) => {
        const response = await api.post('/settings', settings);
        return response.data;
    },

    uploadLogo: async (file: File) => {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await api.post('/settings/logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};
