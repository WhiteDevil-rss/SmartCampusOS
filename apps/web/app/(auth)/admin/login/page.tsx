'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail, ShieldCheck, TriangleAlert } from 'lucide-react';
import { api, clearFrontendAuthHints, getAuthPayload, getRoleHomePath, hasFrontendSessionHint, setFrontendAuthHints } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';

const adminRoles = new Set(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']);

export default function AdminLoginPage() {
    const router = useRouter();
    const { user, isAuthenticated, hasHydrated, isAuthReady, login, logout } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const redirectingRef = useRef(false);
    const pendingRedirectUrlRef = useRef<string | null>(null);

    const getRedirectPath = useCallback((role?: string | null, responseRedirectUrl?: string | null) => {
        if (responseRedirectUrl && responseRedirectUrl !== '/login') return responseRedirectUrl;
        return getRoleHomePath(role);
    }, []);

    const redirectToDestination = useCallback(
        (role?: string | null, responseRedirectUrl?: string | null) => {
            if (redirectingRef.current) return;
            redirectingRef.current = true;
            router.replace(getRedirectPath(role, responseRedirectUrl));
        },
        [getRedirectPath, router]
    );

    useEffect(() => {
        if (!hasHydrated || !isAuthReady) return;

        const hasSessionCookie = hasFrontendSessionHint();

        if (!hasSessionCookie && isAuthenticated) {
            clearFrontendAuthHints();
            logout();
            return;
        }

        if (isAuthenticated && user) {
            if (!adminRoles.has(user.role)) {
                logout();
                setError('Access denied. This gateway is restricted to administrative accounts.');
                return;
            }

            redirectToDestination(user.role, pendingRedirectUrlRef.current);
        }
    }, [hasHydrated, isAuthReady, isAuthenticated, logout, redirectToDestination, user]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const payload = getAuthPayload(response.data);

            if (!payload?.user) {
                throw new Error('Malformed login response.');
            }

            if (!adminRoles.has(payload.user.role)) {
                setError('Access denied. This gateway is restricted to administrative accounts.');
                clearFrontendAuthHints();
                return;
            }

            setFrontendAuthHints(payload.user.role);
            login(payload.user);
            pendingRedirectUrlRef.current = payload.redirectUrl ?? null;
        } catch (err: any) {
            if (err.response?.status === 429) {
                setError('Too many admin login attempts from this device. Please wait a few minutes and try again.');
            } else if (err.response?.status === 423) {
                setError('This account is temporarily locked after repeated failed attempts. Please try again later.');
            } else if (err.response?.status === 403) {
                setError(err.response?.data?.message || 'Your account has been deactivated. Contact an administrator.');
            } else {
                setError(err.response?.data?.message || 'Unable to sign in.');
            }
            setPassword('');
            pendingRedirectUrlRef.current = null;
            redirectingRef.current = false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background text-text-primary font-sans antialiased mesh-gradient">
            <div className="hidden lg:flex w-7/12 flex-col justify-between p-16 relative overflow-hidden border-r border-border">
                <div className="absolute top-0 left-0 size-full opacity-20 pointer-events-none">
                    <div className="absolute top-1/4 -left-20 size-96 bg-primary/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 -right-20 size-96 bg-secondary/20 rounded-full blur-[120px]" />
                </div>

                <Link href="/" className="z-10 flex items-center gap-3 group">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(99,102,241,0.1)] group-hover:scale-110 transition-transform">
                        <ShieldCheck className="size-6 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-2xl font-bold font-space-grotesk tracking-tight">SmartCampus OS</span>
                        <span className="text-secondary text-[10px] font-bold tracking-[0.3em] uppercase mt-1">Administrative Gateway</span>
                    </div>
                </Link>

                <div className="z-10 max-w-xl">
                    <h1 className="text-5xl md:text-6xl font-bold font-space-grotesk leading-tight tracking-tight mb-8">
                        Protected access for institutional operators only.
                    </h1>
                    <p className="text-text-muted text-xl leading-relaxed">
                        Authentication, authorization, and session controls are enforced at the server boundary before any dashboard route or API is allowed through.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-5/12 flex flex-col items-center justify-center p-8 md:p-16 relative">
                <Link href="/" className="absolute top-8 left-8 lg:left-auto lg:right-16 flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-bold group">
                    Return Home
                </Link>

                <div className="w-full max-w-md glass-morphism rounded-[40px] p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50" />

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold font-space-grotesk mb-3">Admin Login</h2>
                        <p className="text-text-muted text-sm">Enter your authorized credentials</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm flex items-center gap-3">
                            <TriangleAlert className="size-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-text-secondary ml-1">Institutional Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="name@university.edu"
                                    className="w-full bg-white/5 border border-border-hover rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:bg-surface-hover transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-text-secondary ml-1">Access Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-border-hover rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:bg-surface-hover transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="glow-button w-full bg-primary text-white rounded-2xl py-4 font-bold text-lg hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="size-5 animate-spin" /> : null}
                            {loading ? 'Authorizing...' : 'Authorize Identity'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
