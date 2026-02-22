import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authAPI } from '@/services/api';

interface User {
    id: number;
    username: string;
    full_name: string;
    role: string;
    company_id: number;
    permissions?: string[];
    profile_image?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    loginWithToken: (token: string, user: User) => void;
    updateUser: (updatedData: Partial<User>) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isManager: boolean;
    isCashier: boolean;
    isBaker: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Check for existing auth on mount
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to restore user session", e);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
            }
        }
    }, []);

    const login = async (username: string, password: string) => {
        const data = await authAPI.login(username, password);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    };

    const loginWithToken = (token: string, user: User) => {
        setToken(token);
        setUser(user);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
    };

    const updateUser = (updatedData: Partial<User>) => {
        if (!user) return;
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        authAPI.logout();
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        login,
        loginWithToken,
        updateUser,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'manager' || user?.role === 'admin',
        isCashier: user?.role === 'cashier',
        isBaker: user?.role === 'baker',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
