import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { API_URL } from '@/config/api';

interface Address {
    _id: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    type: 'home' | 'work' | 'other';
    isDefault: boolean;
}

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    profileImage?: string;
    addresses?: Address[];
    isVerified: boolean;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    updateUser: (user: User) => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('userToken');
    });

    useEffect(() => {
        // Sync token and user to localStorage whenever they change
        if (token && user) {
            localStorage.setItem('userToken', token);
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('userToken');
            localStorage.removeItem('user');
        }
    }, [token, user]);

    const refreshProfile = useCallback(async () => {
        const savedToken = localStorage.getItem('userToken');
        if (!savedToken) return;

        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                headers: {
                    Authorization: `Bearer ${savedToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const updatedUser = {
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone,
                    gender: data.user.gender,
                    dateOfBirth: data.user.dateOfBirth,
                    profileImage: data.user.profileImage,
                    addresses: data.user.addresses,
                    isVerified: data.user.isVerified,
                    createdAt: data.user.createdAt,
                };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Failed to refresh profile:', error);
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('userToken', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        localStorage.removeItem('cart'); // Clear cart on logout
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, updateUser, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
