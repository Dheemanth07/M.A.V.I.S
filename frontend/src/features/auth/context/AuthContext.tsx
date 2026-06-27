import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role: 'user' | 'admin') => Promise<void>;
    logout: () => void;
    setRole: (role: 'user' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('mavis_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('mavis_token') || null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('mavis_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('mavis_user');
        }
        if (token) {
            localStorage.setItem('mavis_token', token);
        } else {
            localStorage.removeItem('mavis_token');
        }
    }, [user, token]);

    const login = async (email: string, password: string) => {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Login failed');

        setUser(json.data.user);
        setToken(json.data.token);
    };

    const register = async (name: string, email: string, password: string, role: 'user' | 'admin') => {
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Registration failed');

        setUser(json.data.user);
        setToken(json.data.token);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('mavis_user');
        localStorage.removeItem('mavis_token');
    };

    const setRole = (role: 'user' | 'admin') => {
        if (user) {
            const updated = { ...user, role };
            setUser(updated);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: Boolean(user && token),
            login,
            register,
            logout,
            setRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
