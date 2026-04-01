'use client';

import React, { useCallback, useEffect } from 'react';
import {
    api,
    clearFrontendAuthHints,
    getAuthPayload,
    hasFrontendSessionHint,
    setFrontendAuthHints,
    type AppAxiosRequestConfig,
} from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { LuShieldAlert } from 'react-icons/lu';
import { usePathname } from 'next/navigation';

const PUBLIC_ROUTES = new Set([
    '/login',
    '/admin/login',
    '/forgot-password',
    '/reset-password',
]);

const PUBLIC_PREFIXES = ['/public'];



import { useAccessibilityAudit } from '@/lib/hooks/use-accessibility-audit';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { setUser, logout, setHasHydrated, setAuthReady, backendError, setBackendError } = useAuthStore();
    const configureSession = useSessionStore((state) => state.configure);

    // Run development-only accessibility audit
    useAccessibilityAudit();

    const bootstrap = useCallback(async (cancelledRef: () => boolean) => {
        const isPublicRoute = PUBLIC_ROUTES.has(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
        const hasSessionHint = typeof document !== 'undefined' ? hasFrontendSessionHint() : false;

        if (isPublicRoute && !hasSessionHint) {
            clearFrontendAuthHints();
            logout();
            setBackendError(null);
            setHasHydrated(true);
            setAuthReady(true);
            return;
        }

        try {
            const response = await api.get('/auth/me', {
                skipAuthRedirect: true,
            } as AppAxiosRequestConfig);
            if (cancelledRef()) return;
            const payload = getAuthPayload(response.data);

            if (payload?.user) {
                setFrontendAuthHints(payload.user.role);
                setUser(payload.user as any);
                configureSession(
                    payload.sessionTimeout ?? 10,
                    payload.warningMinutes ?? 2,
                    { resetActivity: false },
                );
                setBackendError(null);
            } else {
                clearFrontendAuthHints();
                logout();
            }
        } catch (error: any) {
            if (cancelledRef()) return;

            if (!error.response) {
                setBackendError('NETWORK_ERROR');
            } else if (error.response.status >= 500) {
                setBackendError('SERVER_ERROR');
            } else {
                clearFrontendAuthHints();
                logout();
            }
        } finally {
            if (!cancelledRef()) {
                setHasHydrated(true);
                setAuthReady(true);
            }
        }
    }, [configureSession, logout, pathname, setAuthReady, setBackendError, setHasHydrated, setUser]);

    useEffect(() => {
        let cancelled = false;
        void bootstrap(() => cancelled);
        return () => {
            cancelled = true;
        };
    }, [bootstrap]);

    if (backendError === 'NETWORK_ERROR' || backendError === 'SERVER_ERROR') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-rose-500/30">
                <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative mx-auto size-24">
                        <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full animate-pulse" />
                        <div className="relative bg-slate-900 border border-rose-500/30 size-full rounded-3xl flex items-center justify-center shadow-2xl">
                            <LuShieldAlert className="size-12 text-rose-500 animate-bounce" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-white tracking-tighter">Campus Services Offline</h1>
                        <p className="text-slate-400 font-medium leading-relaxed">
                            {backendError === 'NETWORK_ERROR'
                                ? "We're unable to connect to the core university ledgers. This usually means the API node is unavailable or your connection is unstable."
                                : 'The central server encountered a critical fault. Our engineers have been notified and are working on a resolution.'}
                        </p>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
