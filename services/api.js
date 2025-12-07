import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5005/api';

// Helper function to get auth token
const getAuthToken = async () => {
    try {
        return await AsyncStorage.getItem('authToken');
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

// Helper function to set auth token
const setAuthToken = async (token) => {
    try {
        await AsyncStorage.setItem('authToken', token);
    } catch (error) {
        console.error('Error setting auth token:', error);
    }
};

// Helper function to remove auth token
const removeAuthToken = async () => {
    try {
        await AsyncStorage.removeItem('authToken');
    } catch (error) {
        console.error('Error removing auth token:', error);
    }
};

// Auth API calls
export const authAPI = {
    register: async (username, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data;
        } catch (error) {
            throw error;
        }
    },

    login: async (username, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            await setAuthToken(data.token);
            return data;
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        await removeAuthToken();
    },
};

// Inventory API calls
export const inventoryAPI = {
    getAllItems: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/inventory`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.items;
        } catch (error) {
            throw error;
        }
    },

    addItem: async (itemData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/inventory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(itemData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.item;
        } catch (error) {
            throw error;
        }
    },

    updateItem: async (itemId, itemData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(itemData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.item;
        } catch (error) {
            throw error;
        }
    },

    deleteItem: async (itemId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data;
        } catch (error) {
            throw error;
        }
    },

    checkReorderItems: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/inventory/reorder`, {
                method: 'POST',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.items;
        } catch (error) {
            throw error;
        }
    },
}; 