import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { API_URL } from '@/config/api';
import { safeLocalStorage } from '@/lib/storage';

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
        const savedUser = safeLocalStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => {
        return safeLocalStorage.getItem('userToken');
    });

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        safeLocalStorage.removeItem('userToken');
        safeLocalStorage.removeItem('user');
        safeLocalStorage.removeItem('cart'); // Clear cart on logout
        safeLocalStorage.removeItem('loginTime');
        safeLocalStorage.removeItem('lastActivity');
    }, []);

    // Check for token expiry on mount and set up activity tracking
    useEffect(() => {
        const checkTokenExpiry = () => {
            const loginTime = safeLocalStorage.getItem('loginTime');
            if (loginTime && token) {
                const hoursSinceLogin = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
                if (hoursSinceLogin >= 24) {
                    logout();
                }
            }
        };

        // Check immediately
        checkTokenExpiry();

        // Check every 5 minutes
        const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);

        // Activity tracking - update last activity time on user interaction
        const updateActivity = () => {
            if (token) {
                safeLocalStorage.setItem('lastActivity', Date.now().toString());
            }
        };

        // Track various user activities
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => window.addEventListener(event, updateActivity, { passive: true }));

        return () => {
            clearInterval(interval);
            events.forEach(event => window.removeEventListener(event, updateActivity));
        };
    }, [token, logout]);

    useEffect(() => {
        // Sync token and user to localStorage whenever they change
        if (token && user) {
            safeLocalStorage.setItem('userToken', token);
            safeLocalStorage.setItem('user', JSON.stringify(user));
        } else {
            safeLocalStorage.removeItem('userToken');
            safeLocalStorage.removeItem('user');
        }
    }, [token, user]);

    const refreshProfile = useCallback(async () => {
        const savedToken = safeLocalStorage.getItem('userToken');
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
                safeLocalStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Failed to refresh profile:', error);
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        const now = Date.now().toString();
        safeLocalStorage.setItem('userToken', newToken);
        safeLocalStorage.setItem('user', JSON.stringify(newUser));
        safeLocalStorage.setItem('loginTime', now);
        safeLocalStorage.setItem('lastActivity', now);
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        safeLocalStorage.setItem('user', JSON.stringify(updatedUser));
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
