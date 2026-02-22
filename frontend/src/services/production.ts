import api from './api';

export interface Ingredient {
    id: number;
    name: string;
    unit: string;
    low_stock_threshold: number;
}

export interface RecipeItem {
    id?: number;
    product_id: number;
    ingredient_id: number;
    quantity_required: number;
    name?: string;
    unit?: string;
}

export interface ProductionFeasibility {
    canProduce: boolean;
    details: {
        ingredient_id: number;
        name: string;
        unit: string;
        required: number;
        available: number;
        isSufficient: boolean;
    }[];
}

export const productionAPI = {
    getIngredients: async (): Promise<Ingredient[]> => {
        const response = await api.get('/production/ingredients');
        return response.data;
    },

    createIngredient: async (data: Partial<Ingredient>): Promise<Ingredient> => {
        const response = await api.post('/production/ingredients', data);
        return response.data;
    },

    getRecipe: async (productId: number): Promise<RecipeItem[]> => {
        const response = await api.get(`/production/recipes/${productId}`);
        return response.data;
    },

    saveRecipe: async (productId: number, ingredients: Partial<RecipeItem>[]): Promise<void> => {
        await api.post(`/production/recipes/${productId}`, { ingredients });
    },

    checkFeasibility: async (productId: number, quantity: number): Promise<ProductionFeasibility> => {
        const response = await api.post('/production/check-feasibility', { productId, quantity });
        return response.data;
    },

    recordProduction: async (data: { product_id: number, quantity: number, notes?: string }): Promise<void> => {
        await api.post('/production/record', data);
    },

    getLogs: async (): Promise<any[]> => {
        const response = await api.get('/production/logs');
        return response.data;
    }
};
