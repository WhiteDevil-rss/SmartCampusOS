'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, ArrowLeft, Loader2, Mail, TriangleAlert } from 'lucide-react';
import { api, clearFrontendAuthHints, getAuthPayload, getRoleHomePath, hasFrontendSessionHint, setFrontendAuthHints } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { GlassCard } from '@/components/ui/glass-card';



export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated, hasHydrated, isAuthReady, login, logout } = useAuthStore();
    const configureSession = useSessionStore((state) => state.configure);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const redirectingRef = useRef(false);
    const pendingRedirectUrlRef = useRef<string | null>(null);

    const getRedirectPath = useCallback(
        (role?: string | null, responseRedirectUrl?: string | null) => {
            const nextPath = searchParams.get('next');
            if (nextPath && nextPath !== '/login') {
                return nextPath;
            }

            if (responseRedirectUrl && responseRedirectUrl !== '/login') {
                return responseRedirectUrl;
            }

            return getRoleHomePath(role);
        },
        [searchParams]
    );

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
            redirectToDestination(user.role, pendingRedirectUrlRef.current);
        }
    }, [hasHydrated, isAuthReady, isAuthenticated, logout, redirectToDestination, user]);

    useEffect(() => {
        if (searchParams.get('expired') === 'true') {
            setError('You have been automatically logged out due to inactivity. Please log in again.');
        } else if (searchParams.get('passwordChanged') === 'true') {
            setError('Your password was changed. Please log in again.');
        }
    }, [searchParams]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const payload = getAuthPayload(response.data);

            if (!payload?.user) {
                throw new Error('Malformed login response.');
            }

            setFrontendAuthHints(payload.user.role);
            login(payload.user as any);
            configureSession(payload.sessionTimeout ?? 10, payload.warningMinutes ?? 2);
            pendingRedirectUrlRef.current = payload.redirectUrl ?? null;
        } catch (err: any) {
            if (err.response?.status === 429) {
                setError('Too many login attempts from this device. Please wait a few minutes and try again.');
            } else if (err.response?.status === 423) {
                setError('Your account is temporarily locked after repeated failed attempts. Please try again later.');
            } else if (err.response?.status === 403) {
                setError(err.response?.data?.message || 'Your account has been deactivated. Contact an administrator.');
            } else {
                setError(err.response?.data?.message || 'Unable to sign in.');
            }
            setPassword('');
            pendingRedirectUrlRef.current = null;
            redirectingRef.current = false;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] flex flex-col font-sans overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <header className="relative z-50 p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
                <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShieldCheck className="size-5 text-white" />
                    </div>
                    <span className="text-xl font-black font-space-grotesk tracking-tight text-slate-800 dark:text-white">SmartOS</span>
                </Link>
                <Link href="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group">
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Return Home
                </Link>
            </header>

            <main className="flex-1 relative z-10 flex items-center justify-center px-6 pb-24">
                <GlassCard className="w-full max-w-lg rounded-[2.5rem] px-8 py-12 md:p-16 border-2 border-primary/20 bg-primary/5">
                    <div className="text-center mb-10">
                        <div className="mx-auto size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                            <Lock className="size-6" />
                        </div>
                        <h1 className="text-3xl font-black font-space-grotesk mb-2">Secure Sign In</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                            Registration is administrator-controlled. Use your assigned credentials.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold tracking-wide flex items-center gap-3">
                            <TriangleAlert className="size-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Identifier</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all outline-none"
                                    placeholder="name@campus.edu"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white rounded-2xl py-4 font-bold text-base shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                            <span>{isLoading ? 'Signing In...' : 'Validate Access'}</span>
                        </button>
                    </form>
                </GlassCard>
            </main>
        </div>
    );
}
