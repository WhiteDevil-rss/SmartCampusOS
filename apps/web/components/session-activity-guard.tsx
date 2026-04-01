'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, clearFrontendAuthHints } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSessionStore } from '@/lib/store/useSessionStore';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function SessionActivityGuard() {
    const router = useRouter();
    const { isAuthenticated, logout } = useAuthStore();
    const {
        timeoutMinutes,
        warningMinutes,
        lastActivityAt,
        warningOpen,
        markActivity,
        openWarning,
        closeWarning,
        reset,
    } = useSessionStore();
    const [secondsRemaining, setSecondsRemaining] = useState(timeoutMinutes * 60);
    const expiredRef = useRef(false);

    const warningThresholdMs = useMemo(
        () => warningMinutes * 60_000,
        [warningMinutes],
    );

    const handleLogout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // no-op
        }

        clearFrontendAuthHints();
        logout();
        reset();
        router.replace('/login?expired=true');
    }, [logout, reset, router]);

    const handleStayLoggedIn = useCallback(async () => {
        try {
            const response = await api.post('/auth/refresh');
            useSessionStore
                .getState()
                .configure(
                    response.data.timeoutMinutes ?? timeoutMinutes,
                    response.data.warningMinutes ?? warningMinutes,
                    { resetActivity: true },
                );
        } catch {
            await handleLogout();
            return;
        }

        closeWarning();
        markActivity();
    }, [closeWarning, handleLogout, markActivity, timeoutMinutes, warningMinutes]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const activityHandler = () => markActivity();
        const events = ['keydown', 'pointerdown', 'touchstart'];

        events.forEach((eventName) =>
            window.addEventListener(eventName, activityHandler, { passive: true }),
        );

        return () => {
            events.forEach((eventName) =>
                window.removeEventListener(eventName, activityHandler),
            );
        };
    }, [isAuthenticated, markActivity]);

    useEffect(() => {
        if (!isAuthenticated || !lastActivityAt) return;

        const interval = window.setInterval(() => {
            const elapsedMs = Date.now() - lastActivityAt;
            const remainingMs = Math.max(0, timeoutMinutes * 60_000 - elapsedMs);
            setSecondsRemaining(Math.ceil(remainingMs / 1000));

            if (remainingMs === 0 && !expiredRef.current) {
                expiredRef.current = true;
                void handleLogout();
                return;
            }

            expiredRef.current = false;

            if (remainingMs <= warningThresholdMs) {
                openWarning();
            }
        }, 1000);

        return () => window.clearInterval(interval);
    }, [handleLogout, isAuthenticated, lastActivityAt, openWarning, timeoutMinutes, warningThresholdMs]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Dialog open={warningOpen} onOpenChange={(open) => (open ? openWarning() : closeWarning())}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Session Expiring Soon</DialogTitle>
                    <DialogDescription>
                        Your session will expire in {Math.max(1, Math.ceil(secondsRemaining / 60))} minute(s) due to inactivity.
                        Click &quot;Stay Logged In&quot; to continue working.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-end">
                    <Button variant="outline" onClick={() => void handleLogout()}>
                        Log Out
                    </Button>
                    <Button onClick={() => void handleStayLoggedIn()}>
                        Stay Logged In
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
