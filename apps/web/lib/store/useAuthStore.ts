import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    username: string;
    email: string | null;
    role: 'SUPERADMIN' | 'UNI_ADMIN' | 'COLLEGE_ADMIN' | 'DEPT_ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT' | 'APPROVAL_ADMIN';
    entityId: string | null;
    universityId: string | null;
    departmentId?: string | null;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    hasHydrated: boolean;
    isAuthReady: boolean;
    backendError: string | null;
    setHasHydrated: (state: boolean) => void;
    setAuthReady: (state: boolean) => void;
    setBackendError: (error: string | null) => void;
    login: (user: User) => void;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            hasHydrated: false,
            isAuthReady: false,
            backendError: null,
            setHasHydrated: (state) => set({ hasHydrated: state }),
            setAuthReady: (state) => set({ isAuthReady: state }),
            setBackendError: (error) => set({ backendError: error }),
            login: (user) => {
                set({ user, isAuthenticated: true, isAuthReady: true, backendError: null });
            },
            setUser: (user) => {
                set({ user, isAuthenticated: Boolean(user), isAuthReady: true, backendError: null });
            },
            logout: () => {
                set({ user: null, isAuthenticated: false, isAuthReady: true });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
