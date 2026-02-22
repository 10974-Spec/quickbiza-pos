import axios from 'axios';

const isProduction = import.meta.env.PROD;
// Use 127.0.0.1 explicitly — more stable than 'localhost' on Windows (avoids IPv6 vs IPv4 ambiguity)
const API_BASE_URL = isProduction ? 'http://127.0.0.1:5000/api' : 'http://127.0.0.1:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        if (!isLoginRequest && (error.response?.status === 401 || error.response?.status === 403)) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (username: string, password: string) => {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    },
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
};

// Products API
export const productsAPI = {
    getAll: async (params?: { search?: string; category?: string }) => {
        const response = await api.get('/products', { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/products', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
};

// Categories API
export const categoriesAPI = {
    getAll: async () => {
        const response = await api.get('/categories');
        return response.data;
    },
    create: async (data: { name: string; description?: string }) => {
        const response = await api.post('/categories', data);
        return response.data;
    },
};

// Sales API
export const salesAPI = {
    create: async (data: { items: any[]; discount_percent?: number; customer_id?: number }) => {
        const response = await api.post('/sales', data);
        return response.data;
    },
    getAll: async (params?: { start_date?: string; end_date?: string; limit?: number }) => {
        const response = await api.get('/sales', { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/sales/${id}`);
        return response.data;
    },
    getTodaySummary: async () => {
        const response = await api.get('/sales/summary/today');
        return response.data;
    },
};

// Payments API
export const paymentsAPI = {
    mpesa: async (data: { sale_id: number; phone: string; amount: number }) => {
        const response = await api.post('/payments/mpesa', data);
        return response.data;
    },
    cash: async (data: { sale_id: number; amount: number; amount_tendered?: number }) => {
        const response = await api.post('/payments/cash', data);
        return response.data;
    },
    card: async (data: { sale_id: number; amount: number }) => {
        const response = await api.post('/payments/card', data);
        return response.data;
    },
    checkStatus: async (payment_id: number) => {
        const response = await api.get(`/payments/${payment_id}/status`);
        return response.data;
    },
};

// Inventory API
export const inventoryAPI = {
    getRaw: async () => {
        const response = await api.get('/inventory/raw');
        return response.data;
    },
    getFinished: async () => {
        const response = await api.get('/inventory/finished');
        return response.data;
    },
    getAlerts: async () => {
        const response = await api.get('/inventory/alerts');
        return response.data;
    },
    adjust: async (data: { type: string; item_id: number; quantity_change: number; notes?: string }) => {
        const response = await api.post('/inventory/adjust', data);
        return response.data;
    },
    recordWaste: async (data: { type: string; item_id: number; quantity: number; notes?: string }) => {
        const response = await api.post('/inventory/waste', data);
        return response.data;
    },
    getLogs: async (params?: { type?: string; limit?: number }) => {
        const response = await api.get('/inventory/logs', { params });
        return response.data;
    },
};

// Orders API
export const ordersAPI = {
    getAll: async (params?: { status?: string; customer_id?: number; limit?: number }) => {
        const response = await api.get('/orders', { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/orders', data);
        return response.data;
    },
    updateStatus: async (id: number, status: string) => {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data;
    },
    updatePayment: async (id: number, additional_payment: number) => {
        const response = await api.patch(`/orders/${id}/payment`, { additional_payment });
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/orders/${id}`);
        return response.data;
    },
};

// Customers API
export const customersAPI = {
    getAll: async (params?: { search?: string; limit?: number }) => {
        const response = await api.get('/customers', { params });
        return response.data;
    },
    getById: async (id: number, params?: any) => {
        const response = await api.get(`/customers/${id}`, { params });
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/customers', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/customers/${id}`, data);
        return response.data;
    },
    updateLoyalty: async (id: number, points_change: number) => {
        const response = await api.patch(`/customers/${id}/loyalty`, { points_change });
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/customers/${id}`);
        return response.data;
    },
};

// Suppliers API
export const suppliersAPI = {
    getAll: async () => {
        const response = await api.get('/suppliers');
        return response.data;
    },
    getById: async (id: number, params?: any) => {
        const response = await api.get(`/suppliers/${id}`, { params });
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/suppliers', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/suppliers/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/suppliers/${id}`);
        return response.data;
    },
};

// Purchases API
export const purchasesAPI = {
    getAll: async (params?: { status?: string; supplier_id?: number; limit?: number }) => {
        const response = await api.get('/purchases', { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/purchases/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/purchases', data);
        return response.data;
    },
    addPayment: async (id: number, data: any) => {
        const response = await api.post(`/purchases/${id}/payments`, data);
        return response.data;
    },
    getPayments: async (id: number) => {
        const response = await api.get(`/purchases/${id}/payments`);
        return response.data;
    },
    updateStatus: async (id: number, status: string) => {
        const response = await api.patch(`/purchases/${id}/status`, { status });
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/purchases/${id}`);
        return response.data;
    },
};

// Expenses API
export const expensesAPI = {
    getAll: async (params?: { category?: string; start_date?: string; end_date?: string; limit?: number }) => {
        const response = await api.get('/expenses', { params });
        return response.data;
    },
    getSummary: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await api.get('/expenses/summary', { params });
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/expenses', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/expenses/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/expenses/${id}`);
        return response.data;
    },
};

// Promotions API
export const promotionsAPI = {
    getAll: async (params?: { active_only?: boolean }) => {
        const response = await api.get('/promotions', { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/promotions/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/promotions', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/promotions/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/promotions/${id}`);
        return response.data;
    },
};

// Branches API
export const branchesAPI = {
    getAll: async () => {
        const response = await api.get('/branches');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/branches/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/branches', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/branches/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/branches/${id}`);
        return response.data;
    },
};

// Transfers API
export const transfersAPI = {
    getAll: async (params?: { status?: string }) => {
        const response = await api.get('/transfers', { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/transfers/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/transfers', data);
        return response.data;
    },
    updateStatus: async (id: number, status: string) => {
        const response = await api.patch(`/transfers/${id}/status`, { status });
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/transfers/${id}`);
        return response.data;
    },
};

// Reports API
export const reportsAPI = {
    sales: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await api.get('/reports/sales', { params });
        return response.data;
    },
    inventory: async () => {
        const response = await api.get('/reports/inventory');
        return response.data;
    },
    financial: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await api.get('/reports/financial', { params });
        return response.data;
    },
    products: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await api.get('/reports/products', { params });
        return response.data;
    },
    customers: () => api.get('/reports/customers').then(res => res.data),
    expenses: (params: any) => api.get('/reports/expenses', { params }).then(res => res.data),
    print: (data: any) => api.post('/reports/print', data).then(res => res.data),
};

// Devices API
export const devicesAPI = {
    getAll: async () => {
        const response = await api.get('/devices');
        return response.data;
    },
    getActiveCount: async () => {
        const response = await api.get('/devices/active');
        return response.data;
    },
    scan: async () => {
        const response = await api.post('/devices/scan');
        return response.data;
    },
    test: async (id: number) => {
        const response = await api.post(`/devices/${id}/test`);
        return response.data;
    },
    update: async (id: number, data: { device_name: string }) => {
        const response = await api.put(`/devices/${id}`, data);
        return response.data;
    },
    updateStatus: async (id: number, status: string) => {
        const response = await api.put(`/devices/${id}/status`, { status });
        return response.data;
    },
    refresh: async (id: number) => {
        const response = await api.post(`/devices/${id}/refresh`);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/devices/${id}`);
        return response.data;
    },
};

// Notifications API
export const notificationsAPI = {
    getAll: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },
    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread');
        return response.data;
    },
    markAsRead: async (id: number) => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await api.put('/notifications/read-all');
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    },
};

// Returns API
export const returnsAPI = {
    getAll: async () => {
        const response = await api.get('/returns');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/returns', data);
        return response.data;
    },
};

// Users API
export const usersAPI = {
    updateProfile: async (id: number, data: { full_name?: string; username?: string; password?: string; current_password?: string; profile_image?: File }) => {
        let payload: any = data;
        let headers: any = {};

        if (data.profile_image) {
            payload = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    payload.append(key, value);
                }
            });
            headers = { 'Content-Type': 'multipart/form-data' };
        }

        const response = await api.patch(`/users/${id}`, payload, { headers });
        return response.data;
    },
    verifyAdmin: async (data: { password: string }) => {
        const response = await api.post('/users/verify-admin', data);
        return response.data;
    },
};

// Roles API
export const rolesAPI = {
    getAll: async () => {
        const response = await api.get('/roles');
        return response.data;
    },
    create: async (data: { name: string; permissions?: string[] }) => {
        const response = await api.post('/roles', data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/roles/${id}`);
        return response.data;
    },
};

export default api;
