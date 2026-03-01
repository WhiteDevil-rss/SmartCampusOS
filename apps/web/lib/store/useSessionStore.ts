import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SessionState {
    expiryTimestamp: number;
    hasHydrated: boolean;
    startSession: () => void;
    forceReset: () => void;
}

export const useSessionStore = create<SessionState>()(
    persist(
        (set) => ({
            expiryTimestamp: 0, // Reset on start
            hasHydrated: false,
            startSession: () => {
                const now = Date.now();
                set({ expiryTimestamp: now + 600000 }); // Strict 10 minutes
            },
            forceReset: () => set({ expiryTimestamp: 0 }),
        }),
        {
            name: 'session-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.hasHydrated = true;
                }
            },
        }
    )
);
