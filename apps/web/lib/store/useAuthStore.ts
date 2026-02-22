import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

export interface User {
    id: string;
    username: string;
    role: 'SUPERADMIN' | 'UNI_ADMIN' | 'DEPT_ADMIN' | 'FACULTY';
    entityId: string | null;
    universityId: string | null;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user, token) => {
                Cookies.set('token', token, { expires: 1 }); // 1 day
                set({ user, isAuthenticated: true });
            },
            logout: () => {
                Cookies.remove('token');
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
