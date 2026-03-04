'use client';

import { Suspense, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginClient() {
    const searchParams = useSearchParams();
    const isExpired = searchParams.get('expired') === 'true';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user, login: loginStore, isAuthenticated } = useAuthStore();
    const router = useRouter();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            const roleRedirects: Record<string, string> = {
                SUPERADMIN: '/superadmin',
                UNI_ADMIN: '/dashboard',
                DEPT_ADMIN: '/department',
                FACULTY: '/faculty-panel'
            };
            const path = roleRedirects[user.role] || '/dashboard';
            window.location.href = path;
        }
    }, [isAuthenticated, user]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            const response = await api.post('/auth/login', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const { user } = response.data;

            if (!user) throw new Error('User data missing');

            const startSession = useSessionStore.getState().startSession;
            startSession();
            loginStore(user);

            const roleRedirects: Record<string, string> = {
                SUPERADMIN: '/superadmin',
                UNI_ADMIN: '/dashboard',
                DEPT_ADMIN: '/department',
                FACULTY: '/faculty-panel'
            };
            const targetPath = roleRedirects[user.role] || '/dashboard';

            if (typeof window !== 'undefined') {
                window.location.href = targetPath;
            }
        } catch (err) {
            const firebaseErr = err as { code?: string; response?: { status?: number } };
            if (firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/invalid-credential') {
                setError('Invalid email or password');
            } else if (firebaseErr.response?.status === 401) {
                setError('Account not linked in database.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden font-sans">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

            {/* Left Side: Branding (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden mesh-gradient flex-col justify-center px-16 xl:px-24">
                <div className="absolute inset-0 opacity-40 pointer-events-none">
                    <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-primary/30 blur-[120px] rounded-full animate-pulse-slow"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-secondary/20 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="relative z-10 space-y-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary p-3 rounded-2xl shadow-glow">
                            <span className="material-symbols-outlined text-white text-3xl">auto_schedule</span>
                        </div>
                        <span className="font-heading font-bold text-3xl tracking-tighter text-white">Zembaa AI</span>
                    </div>

                    <h1 className="font-heading text-5xl xl:text-6xl font-bold leading-tight text-white mb-6">
                        Welcome Back to the <span className="text-secondary">Future</span> of Scheduling
                    </h1>

                    <ul className="space-y-6">
                        {[
                            "AI-Powered Timetables",
                            "Conflict-Free Scheduling",
                            "Smart Resource Optimization"
                        ].map((text, i) => (
                            <li key={i} className="flex items-center gap-4 text-white/90 text-lg animate-slide-up" style={{ animationDelay: `${0.2 * (i + 1)}s` }}>
                                <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-secondary text-sm font-bold">check</span>
                                </div>
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Decorative floating element */}
                <div className="absolute bottom-20 right-20 glass-morphism p-6 rounded-2xl shadow-2xl animate-float hidden xl:block border-primary/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <span className="material-symbols-outlined text-3xl">verified</span>
                        </div>
                        <div>
                            <p className="text-white font-bold">99.9% Accuracy</p>
                            <p className="text-white/50 text-xs">AI Optimization Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 bg-background lg:bg-surface/30 relative flex flex-col justify-center items-center px-6 py-12 lg:px-12">
                {/* Back Link */}
                <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-text-muted hover:text-primary transition-all group animate-fade-in">
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
                </Link>

                <div className="w-full max-w-md animate-slide-up">
                    <div className="flex flex-col items-center mb-10 lg:hidden">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-glow mb-4">
                            <span className="material-symbols-outlined text-white text-3xl">auto_schedule</span>
                        </div>
                        <h2 className="font-heading text-3xl font-bold">Zembaa AI</h2>
                    </div>

                    <div className="glass-card p-8 lg:p-10 rounded-3xl w-full border-white/5 shadow-2xl">
                        <div className="mb-8">
                            <h2 className="font-heading text-3xl font-bold text-white mb-2">Sign In</h2>
                            <p className="text-text-muted text-sm font-medium">Please enter your credentials to access the platform.</p>
                        </div>

                        {isExpired && !error && (
                            <div className="p-4 bg-accent-yellow/10 text-accent-yellow text-xs font-bold rounded-xl border border-accent-yellow/20 flex items-center gap-3 mb-6 animate-fade-in">
                                <span className="material-symbols-outlined text-sm">info</span>
                                <span>Session expired. Please log in again.</span>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-accent-red/10 text-accent-red text-xs font-bold rounded-xl border border-accent-red/20 flex items-center gap-3 mb-6 animate-fade-in">
                                <span className="material-symbols-outlined text-sm">error</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xl">mail</span>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-background/50 border border-border rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                        placeholder="name@university.edu"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Password</label>
                                    <Link href="#" className="text-xs font-bold text-primary hover:underline">Forgot?</Link>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xl">lock</span>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-background/50 border border-border rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
                                />
                                <label htmlFor="remember" className="text-sm font-medium text-text-secondary cursor-pointer">Remember me for 30 days</label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-glow-primary transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Sign In to Dashboard</span>
                                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative my-8 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <span className="relative bg-surface px-4 text-xs font-bold text-text-muted uppercase tracking-widest">OR</span>
                        </div>

                        <button className="w-full bg-white/5 border border-border text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Sign in with Google</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-text-muted text-sm font-medium">
                            Don't have access?
                            <Link className="text-primary font-bold hover:underline ml-2" href="#">Contact Us</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
