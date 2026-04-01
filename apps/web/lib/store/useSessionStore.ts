import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SessionState {
    timeoutMinutes: number;
    warningMinutes: number;
    startedAt: number;
    lastActivityAt: number;
    warningOpen: boolean;
    hydrated: boolean;
    configure: (
        timeoutMinutes: number,
        warningMinutes: number,
        options?: { resetActivity?: boolean }
    ) => void;
    markActivity: () => void;
    openWarning: () => void;
    closeWarning: () => void;
    reset: () => void;
}

const DEFAULT_TIMEOUT_MINUTES = 10;
const DEFAULT_WARNING_MINUTES = 2;

export const useSessionStore = create<SessionState>()(
    persist(
        (set) => ({
            timeoutMinutes: DEFAULT_TIMEOUT_MINUTES,
            warningMinutes: DEFAULT_WARNING_MINUTES,
            startedAt: 0,
            lastActivityAt: 0,
            warningOpen: false,
            hydrated: true,
            configure: (timeoutMinutes, warningMinutes, options) =>
                set((state) => {
                    const resetActivity = options?.resetActivity ?? true;
                    const now = Date.now();

                    return {
                        timeoutMinutes,
                        warningMinutes,
                        startedAt: resetActivity ? now : (state.startedAt || now),
                        lastActivityAt: resetActivity ? now : state.lastActivityAt,
                        warningOpen: resetActivity ? false : state.warningOpen,
                    };
                }),
            markActivity: () =>
                set((state) => ({
                    lastActivityAt: Date.now(),
                    warningOpen: false,
                    startedAt: state.startedAt || Date.now(),
                })),
            openWarning: () => set({ warningOpen: true }),
            closeWarning: () => set({ warningOpen: false }),
            reset: () =>
                set({
                    timeoutMinutes: DEFAULT_TIMEOUT_MINUTES,
                    warningMinutes: DEFAULT_WARNING_MINUTES,
                    startedAt: 0,
                    lastActivityAt: 0,
                    warningOpen: false,
                }),
        }),
        {
            name: 'session-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                timeoutMinutes: state.timeoutMinutes,
                warningMinutes: state.warningMinutes,
                startedAt: state.startedAt,
                lastActivityAt: state.lastActivityAt,
                warningOpen: state.warningOpen,
            }),
        },
    ),
);
