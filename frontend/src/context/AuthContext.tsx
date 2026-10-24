import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAdmin: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [accessToken, setAccessToken] = useState<string | null>(
        () => localStorage.getItem('accessToken')
    );

    const login = (token: string, userData: User) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setAccessToken(token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setAccessToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user, accessToken, login, logout,
            isAdmin: user?.role === 'ADMIN',
            isAuthenticated: !!accessToken,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
