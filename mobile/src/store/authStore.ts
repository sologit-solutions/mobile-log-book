import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    mode: 'online' | 'offline';
    login: (user: User, token: string) => void;
    logout: () => void;
    setMode: (mode: 'online' | 'offline') => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            mode: 'offline', // Default to offline for this app's logic
            login: (user, token) => set({ user, token, mode: 'online' }),
            logout: () => set({ user: null, token: null, mode: 'offline' }),
            setMode: (mode) => set({ mode }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);